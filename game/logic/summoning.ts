import { PET_DEFINITIONS, PET_EVOLUTION_STAGES, PET_IDS } from '../data/summoning.data';
import type {
  ActivePetCombatProfile,
  PetDefinition,
  PetEvolutionStageDefinition,
  PetId,
  PetState,
  SummoningCombatBonuses,
  SummoningState,
} from '../types';
import type { GameEvent } from '../systems/events.types';

const MAX_PET_LEVEL = 50;
const PET_XP_BASE = 28;

function createEmptyBonuses(): SummoningCombatBonuses {
  return {
    attackBonus: 0,
    strengthBonus: 0,
    defenseBonus: 0,
    maxHpBonus: 0,
    attackSpeedMultiplier: 1,
    damageReduction: 0,
  };
}

export function xpForPetLevel(level: number): number {
  if (level <= 1) {
    return 0;
  }

  return Math.floor(PET_XP_BASE * Math.pow(level, 1.55));
}

export function addPetXp(pet: PetState, xpGained: number): {
  pet: PetState;
  leveledUp: boolean;
  levelsGained: number;
} {
  if (xpGained <= 0 || !Number.isFinite(xpGained)) {
    return { pet, leveledUp: false, levelsGained: 0 };
  }

  let currentLevel = pet.level;
  let currentXp = pet.xp + xpGained;

  while (currentLevel < MAX_PET_LEVEL) {
    const xpNeeded = xpForPetLevel(currentLevel + 1);
    if (currentXp >= xpNeeded) {
      currentXp -= xpNeeded;
      currentLevel += 1;
    } else {
      break;
    }
  }

  if (currentLevel >= MAX_PET_LEVEL) {
    currentLevel = MAX_PET_LEVEL;
    currentXp = 0;
  }

  return {
    pet: {
      ...pet,
      level: currentLevel,
      xp: currentXp,
    },
    leveledUp: currentLevel > pet.level,
    levelsGained: currentLevel - pet.level,
  };
}

export function getPetDefinition(petId: PetId): PetDefinition {
  return PET_DEFINITIONS[petId];
}

export function getPetEvolutionStage(
  pet: PetState,
  summoningLevel: number
): PetEvolutionStageDefinition {
  let stage = PET_EVOLUTION_STAGES[0];

  for (const candidate of PET_EVOLUTION_STAGES) {
    if (pet.level >= candidate.minPetLevel && summoningLevel >= candidate.minSummoningLevel) {
      stage = candidate;
    }
  }

  return stage;
}

function getStageRank(stage: PetEvolutionStageDefinition): number {
  return PET_EVOLUTION_STAGES.findIndex((candidate) => candidate.id === stage.id) + 1;
}

function ensureActivePet(summoning: SummoningState): SummoningState {
  if (summoning.activePetId && summoning.pets[summoning.activePetId]?.unlocked) {
    return summoning;
  }

  const fallbackPetId = PET_IDS.find((petId) => summoning.pets[petId].unlocked) ?? null;
  return {
    ...summoning,
    activePetId: fallbackPetId,
  };
}

function applyBondXpToPet(
  summoning: SummoningState,
  petId: PetId,
  xpGained: number,
  summoningLevel: number,
  counters: { ritualsChanneled?: number; combatKills?: number } = {}
): { summoning: SummoningState; events: GameEvent[] } {
  const pet = summoning.pets[petId];
  if (!pet?.unlocked) {
    return { summoning, events: [] };
  }

  const previousStage = getPetEvolutionStage(pet, summoningLevel);
  const bondResult = addPetXp(pet, xpGained);
  const updatedPet: PetState = {
    ...bondResult.pet,
    ritualsChanneled: pet.ritualsChanneled + (counters.ritualsChanneled ?? 0),
    combatKills: pet.combatKills + (counters.combatKills ?? 0),
  };
  const nextStage = getPetEvolutionStage(updatedPet, summoningLevel);

  const nextSummoning: SummoningState = {
    ...summoning,
    pets: {
      ...summoning.pets,
      [petId]: updatedPet,
    },
  };

  const events: GameEvent[] = [];
  if (bondResult.leveledUp) {
    events.push({
      type: 'PET_LEVEL_UP',
      petId,
      newLevel: updatedPet.level,
    });
  }

  if (nextStage.id !== previousStage.id) {
    events.push({
      type: 'PET_EVOLVED',
      petId,
      stageId: nextStage.id,
    });
  }

  return { summoning: nextSummoning, events };
}

function unlockAvailablePets(
  summoning: SummoningState,
  summoningLevel: number
): { summoning: SummoningState; events: GameEvent[] } {
  let nextSummoning = summoning;
  const events: GameEvent[] = [];

  for (const petId of PET_IDS) {
    const definition = PET_DEFINITIONS[petId];
    const pet = nextSummoning.pets[petId];
    if (
      !pet.unlocked
      && summoningLevel >= definition.unlockLevel
      && nextSummoning.ritualsCompleted >= definition.unlockRituals
    ) {
      nextSummoning = {
        ...nextSummoning,
        pets: {
          ...nextSummoning.pets,
          [petId]: {
            ...pet,
            unlocked: true,
          },
        },
      };
      events.push({ type: 'PET_UNLOCKED', petId });
    }
  }

  return {
    summoning: ensureActivePet(nextSummoning),
    events,
  };
}

export function processSummoningRituals(
  summoning: SummoningState,
  summoningLevel: number,
  actionsCompleted: number
): { summoning: SummoningState; events: GameEvent[] } {
  if (actionsCompleted <= 0) {
    return { summoning, events: [] };
  }

  let nextSummoning = ensureActivePet({
    ...summoning,
    ritualsCompleted: summoning.ritualsCompleted + actionsCompleted,
  });
  const events: GameEvent[] = [];

  const unlockResult = unlockAvailablePets(nextSummoning, summoningLevel);
  nextSummoning = unlockResult.summoning;
  events.push(...unlockResult.events);

  if (!nextSummoning.activePetId) {
    return { summoning: nextSummoning, events };
  }

  const activePetId = nextSummoning.activePetId;
  const definition = PET_DEFINITIONS[activePetId];
  const bondXp = Math.max(
    1,
    Math.floor(actionsCompleted * definition.ritualBondXp * (1 + summoningLevel * 0.0125))
  );
  const bondResult = applyBondXpToPet(
    nextSummoning,
    activePetId,
    bondXp,
    summoningLevel,
    { ritualsChanneled: actionsCompleted }
  );

  return {
    summoning: bondResult.summoning,
    events: [...events, ...bondResult.events],
  };
}

export function rewardActivePetForCombatKill(
  summoning: SummoningState,
  summoningLevel: number,
  enemyXpReward: number
): { summoning: SummoningState; events: GameEvent[] } {
  const activePetId = summoning.activePetId;
  if (!activePetId) {
    return { summoning, events: [] };
  }

  const definition = PET_DEFINITIONS[activePetId];
  const bondXp = Math.max(1, Math.floor(definition.killBondXp + enemyXpReward * 0.45));

  return applyBondXpToPet(
    ensureActivePet(summoning),
    activePetId,
    bondXp,
    summoningLevel,
    { combatKills: 1 }
  );
}

export function getSummoningCombatBonuses(
  summoning: SummoningState,
  summoningLevel: number
): SummoningCombatBonuses {
  const activePetId = summoning.activePetId;
  if (!activePetId) {
    return createEmptyBonuses();
  }

  const pet = summoning.pets[activePetId];
  if (!pet?.unlocked) {
    return createEmptyBonuses();
  }

  const stage = getPetEvolutionStage(pet, summoningLevel);
  const stageRank = getStageRank(stage);
  const bonuses = createEmptyBonuses();

  switch (PET_DEFINITIONS[activePetId].passiveId) {
    case 'cinder_drive':
      bonuses.attackBonus += Math.floor(pet.level / 10);
      bonuses.attackSpeedMultiplier += stageRank * 0.05 + pet.level * 0.003;
      break;
    case 'soul_siphon':
      bonuses.strengthBonus += stageRank + Math.floor(pet.level / 14);
      break;
    case 'bastion_shell':
      bonuses.defenseBonus += stageRank * 2 + Math.floor(pet.level / 5);
      bonuses.maxHpBonus += stageRank * 10 + pet.level;
      bonuses.damageReduction += Math.max(0, stageRank - 1) + Math.floor(pet.level / 18);
      break;
    case 'tempest_feathers':
      bonuses.attackBonus += stageRank * 2 + Math.floor(pet.level / 6);
      bonuses.strengthBonus += stageRank * 2 + Math.floor(pet.level / 6);
      bonuses.attackSpeedMultiplier += stageRank * 0.03;
      break;
    case 'void_hunt':
      bonuses.strengthBonus += stageRank + Math.floor(pet.level / 8);
      break;
  }

  return bonuses;
}

export function getActivePetCombatProfile(
  summoning: SummoningState,
  summoningLevel: number
): ActivePetCombatProfile | null {
  const activePetId = summoning.activePetId;
  if (!activePetId) {
    return null;
  }

  const pet = summoning.pets[activePetId];
  if (!pet?.unlocked) {
    return null;
  }

  const definition = PET_DEFINITIONS[activePetId];
  const stage = getPetEvolutionStage(pet, summoningLevel);
  const stageRank = getStageRank(stage);
  const baseDamage = definition.baseAttack
    + (pet.level - 1) * definition.attackPerLevel
    + summoningLevel * 0.35;

  const profile: ActivePetCombatProfile = {
    id: activePetId,
    name: definition.name,
    icon: definition.icon,
    role: definition.role,
    affinity: definition.affinity,
    level: pet.level,
    stageId: stage.id,
    stageName: stage.name,
    stageIcon: stage.icon,
    attackIntervalSeconds: Math.max(
      1.05,
      definition.attackIntervalSeconds / (1 + pet.level * 0.005 + (stageRank - 1) * 0.06)
    ),
    damage: Math.max(1, Math.floor(baseDamage * stage.powerMultiplier)),
    healOnAttack: 0,
    missingHpDamageMultiplier: 1,
    passiveSummary: definition.passiveSummary,
  };

  switch (definition.passiveId) {
    case 'soul_siphon':
      profile.healOnAttack = stageRank + Math.floor(pet.level / 12);
      break;
    case 'void_hunt':
      profile.missingHpDamageMultiplier = 1 + stageRank * 0.12;
      break;
  }

  return profile;
}
