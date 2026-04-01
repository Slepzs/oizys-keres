import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from './gameStore';
import { xpForPlayerLevel, xpForSkillLevel } from '@/game/data';
import type { SkillId, CombatSkillId, PetId } from '@/game/types';
import {
  SKILL_IDS,
  COMBAT_SKILL_DEFINITIONS,
  ENEMY_DEFINITIONS,
  PET_DEFINITIONS,
  WOODCUTTING_TREES,
} from '@/game/data';
import {
  getCombatSkillLevel,
  getCombatSkillXpProgress,
  getActivePetCombatProfile,
  getPetEvolutionStage,
  getSummoningCombatBonuses,
  calculateCombatLevel,
  getPlayerAttack,
  getPlayerStrength,
  getPlayerDefense,
  getPlayerAttackSpeed,
  getTotalEquipmentStats,
  getAvailableTrees,
  getActiveTree,
  getMiningRocksForLevel,
  getActiveMiningRock,
  xpForPetLevel,
  getFishingSpotsForLevel,
  getActiveFishingSpot,
  getActiveCookingRecipe,
  getCookingRecipesForLevel,
  getActiveHerbloreRecipe,
  getHerbloreRecipesForLevel,
} from '@/game/logic';
import { scaleEnemyMaxHp } from '@/game/logic/combat/balance';
import { ITEM_DEFINITIONS, ITEM_IDS } from '@/game/data';
import { isFood, isPotion } from '@/game/types/items';
import { COMBAT_SKILL_IDS } from '@/game/types';

export function usePlayerSummary() {
  const { level, xp, health, maxHealth, mana, maxMana } = useGameStore(
    useShallow((state) => ({
      level: state.player.level,
      xp: state.player.xp,
      health: state.player.health,
      maxHealth: state.player.maxHealth,
      mana: state.player.mana,
      maxMana: state.player.maxMana,
    }))
  );

  return useMemo(() => {
    const xpRequired = xpForPlayerLevel(level + 1);
    const progress = xpRequired > 0 ? xp / xpRequired : 1;
    const currentHealth = Math.floor(health);
    const currentMana = Math.floor(mana);
    const healthProgress = maxHealth > 0 ? health / maxHealth : 1;
    const manaProgress = maxMana > 0 ? mana / maxMana : 1;

    return {
      level,
      xp,
      xpRequired,
      progress,
      currentHealth,
      maxHealth,
      healthProgress,
      currentMana,
      maxMana,
      manaProgress,
    };
  }, [level, xp, health, maxHealth, mana, maxMana]);
}

export function useSkillSummaries() {
  const skills = useGameStore(useShallow((state) => state.skills));

  return useMemo(() => {
    const summaries: Record<
      SkillId,
      { level: number; xp: number; xpRequired: number; progress: number }
    > = {} as Record<
      SkillId,
      { level: number; xp: number; xpRequired: number; progress: number }
    >;

    (Object.keys(skills) as SkillId[]).forEach((skillId) => {
      const skill = skills[skillId];
      const xpRequired = xpForSkillLevel(skill.level + 1);
      summaries[skillId] = {
        level: skill.level,
        xp: skill.xp,
        xpRequired,
        progress: xpRequired > 0 ? skill.xp / xpRequired : 1,
      };
    });

    return summaries;
  }, [skills]);
}

export function useTotalSkillLevels() {
  const skills = useGameStore(useShallow((state) => state.skills));

  return useMemo(() => {
    return SKILL_IDS.reduce((total, skillId) => {
      return total + (skills[skillId]?.level ?? 0);
    }, 0);
  }, [skills]);
}

export function useCombatSummary() {
  const { combat, summoning, summoningLevel } = useGameStore(
    useShallow((state) => ({
      combat: state.combat,
      summoning: state.summoning,
      summoningLevel: state.skills.summoning.level,
    }))
  );

  return useMemo(() => {
    const petBonuses = getSummoningCombatBonuses(summoning, summoningLevel);
    const activePet = getActivePetCombatProfile(summoning, summoningLevel);
    const combatLevel = calculateCombatLevel(combat.combatSkills);
    const effectiveAttack = getPlayerAttack(combat, petBonuses);
    const effectiveStrength = getPlayerStrength(combat, petBonuses);
    const effectiveDefense = getPlayerDefense(combat, petBonuses);
    const attackSpeed = getPlayerAttackSpeed(combat, petBonuses);
    const equipmentStats = getTotalEquipmentStats(combat.equipment);

    const skillSummaries: Record<
      CombatSkillId,
      {
        id: CombatSkillId;
        name: string;
        icon: string;
        level: number;
        xp: number;
        xpRequired: number;
        progress: number;
      }
    > = {} as Record<
      CombatSkillId,
      {
        id: CombatSkillId;
        name: string;
        icon: string;
        level: number;
        xp: number;
        xpRequired: number;
        progress: number;
      }
    >;

    for (const skillId of COMBAT_SKILL_IDS) {
      const xp = combat.combatSkills[skillId].xp;
      const level = getCombatSkillLevel(xp);
      const xpProgress = getCombatSkillXpProgress(xp);
      const def = COMBAT_SKILL_DEFINITIONS[skillId];
      skillSummaries[skillId] = {
        id: skillId,
        name: def.name,
        icon: def.icon,
        level,
        xp,
        xpRequired: xpProgress.required,
        progress: xpProgress.progress,
      };
    }

    return {
      combatLevel,
      skills: skillSummaries,
      effectiveAttack,
      effectiveStrength,
      effectiveDefense,
      attackSpeed,
      equipmentStats,
      playerCurrentHp: combat.playerCurrentHp,
      playerMaxHp: combat.playerMaxHp,
      healthProgress: combat.playerMaxHp > 0 ? combat.playerCurrentHp / combat.playerMaxHp : 1,
      trainingMode: combat.trainingMode,
      autoFight: combat.autoFight,
      autoEat: combat.autoEat,
      autoEatThreshold: combat.autoEatThreshold,
      autoDrink: combat.autoDrink,
      potionBuffs: combat.potionBuffs,
      totalKills: combat.totalKills,
      totalDeaths: combat.totalDeaths,
      selectedZoneId: combat.selectedZoneId,
      selectedEnemyByZone: combat.selectedEnemyByZone,
      activePet,
      petBonuses,
    };
  }, [combat, summoning, summoningLevel]);
}

export function useActiveCombat() {
  const { activeCombat, playerCurrentHp, playerMaxHp } = useGameStore(
    useShallow((state) => ({
      activeCombat: state.combat.activeCombat,
      playerCurrentHp: state.combat.playerCurrentHp,
      playerMaxHp: state.combat.playerMaxHp,
    }))
  );

  return useMemo(() => {
    if (!activeCombat) {
      return null;
    }

    return {
      zoneId: activeCombat.zoneId,
      enemyId: activeCombat.enemyId,
      enemyCurrentHp: activeCombat.enemyCurrentHp,
      playerNextAttackAt: activeCombat.playerNextAttackAt,
      enemyNextAttackAt: activeCombat.enemyNextAttackAt,
      petNextAttackAt: activeCombat.petNextAttackAt ?? null,
      playerCurrentHp,
      playerMaxHp,
    };
  }, [activeCombat, playerCurrentHp, playerMaxHp]);
}

export function useCombatFeedback() {
  const { entries, killsThisSession, sessionStartedAt } = useGameStore(
    useShallow((state) => ({
      entries: state.combatFeedback.entries,
      killsThisSession: state.combatFeedback.killsThisSession,
      sessionStartedAt: state.combatFeedback.sessionStartedAt,
    }))
  );

  return useMemo(() => ({
    entries,
    killsThisSession,
    sessionStartedAt,
  }), [entries, killsThisSession, sessionStartedAt]);
}

export function useCombatTracker() {
  const { enemyId, enemyCurrentHp, playerCurrentHp, playerMaxHp } = useGameStore(
    useShallow((state) => ({
      enemyId: state.combat.activeCombat?.enemyId ?? null,
      enemyCurrentHp: state.combat.activeCombat?.enemyCurrentHp ?? 0,
      playerCurrentHp: state.combat.playerCurrentHp,
      playerMaxHp: state.combat.playerMaxHp,
    }))
  );

  return useMemo(() => {
    if (!enemyId) {
      return null;
    }

    const enemy = ENEMY_DEFINITIONS[enemyId];
    if (!enemy) {
      return null;
    }

    const playerProgress = playerMaxHp > 0 ? playerCurrentHp / playerMaxHp : 0;
    const enemyMaxHp = scaleEnemyMaxHp(enemy.maxHp);
    const enemyProgress = enemyMaxHp > 0 ? enemyCurrentHp / enemyMaxHp : 0;

    return {
      enemyId,
      enemyName: enemy.name,
      enemyIcon: enemy.icon,
      enemyMaxHp,
      enemyCurrentHp,
      enemyProgress,
      playerCurrentHp,
      playerMaxHp,
      playerProgress,
    };
  }, [enemyId, enemyCurrentHp, playerCurrentHp, playerMaxHp]);
}

export function useEquipment() {
  const equipment = useGameStore(useShallow((state) => state.combat.equipment));

  return useMemo(() => {
    return {
      weapon: equipment.weapon,
      helmet: equipment.helmet,
      chest: equipment.chest,
      legs: equipment.legs,
      boots: equipment.boots,
      accessory: equipment.accessory,
    };
  }, [equipment]);
}

export function useCombatActions() {
  return useGameStore(
    useShallow((state) => ({
      startCombat: state.startCombat,
      fleeCombat: state.fleeCombat,
      setTrainingMode: state.setTrainingMode,
      toggleAutoFight: state.toggleAutoFight,
      toggleAutoEat: state.toggleAutoEat,
      toggleAutoDrink: state.toggleAutoDrink,
      setAutoEatThreshold: state.setAutoEatThreshold,
      equipItem: state.equipItem,
      unequipSlot: state.unequipSlot,
      selectZone: state.selectZone,
      selectEnemyForZone: state.selectEnemyForZone,
      setActivePet: state.setActivePet,
      eatFood: state.eatFood,
      drinkPotion: state.drinkPotion,
    }))
  );
}

export function useSummoningSummary() {
  const { summoningSkill, summoning, essenceAmount } = useGameStore(
    useShallow((state) => ({
      summoningSkill: state.skills.summoning,
      summoning: state.summoning,
      essenceAmount: state.resources.spirit_essence.amount,
    }))
  );

  return useMemo(() => {
    const activePet = summoning.activePetId ? PET_DEFINITIONS[summoning.activePetId] : null;
    const petSummaries = (Object.keys(summoning.pets) as PetId[]).map((petId) => {
      const pet = summoning.pets[petId];
      const definition = PET_DEFINITIONS[petId];
      const stage = getPetEvolutionStage(pet, summoningSkill.level);
      const combatProfile = pet.unlocked
        ? getActivePetCombatProfile(
            {
              activePetId: petId,
              ritualsCompleted: summoning.ritualsCompleted,
              pets: {
                ...summoning.pets,
                [petId]: pet,
              },
            },
            summoningSkill.level
          )
        : null;

      return {
        ...definition,
        unlocked: pet.unlocked,
        level: pet.level,
        xp: pet.xp,
        xpRequired: xpForPetLevel(pet.level + 1),
        ritualsChanneled: pet.ritualsChanneled,
        combatKills: pet.combatKills,
        stage,
        isActive: summoning.activePetId === petId,
        combatProfile,
      };
    });

    return {
      skillLevel: summoningSkill.level,
      skillXp: summoningSkill.xp,
      skillXpRequired: xpForSkillLevel(summoningSkill.level + 1),
      automationUnlocked: summoningSkill.automationUnlocked,
      automationEnabled: summoningSkill.automationEnabled,
      ritualsCompleted: summoning.ritualsCompleted,
      essenceAmount,
      activePet,
      pets: petSummaries,
    };
  }, [essenceAmount, summoning, summoningSkill]);
}

export function useSummoningActions() {
  return useGameStore(
    useShallow((state) => ({
      setActivePet: state.setActivePet,
      toggleAutomation: state.toggleAutomation,
      setActiveSkill: state.setActiveSkill,
    }))
  );
}

export function useWoodcuttingTrees() {
  const { level, activeTreeId } = useGameStore(
    useShallow((state) => ({
      level: state.skills.woodcutting.level,
      activeTreeId: state.skills.woodcutting.activeTreeId,
    }))
  );

  return useMemo(() => {
    const active = getActiveTree({ level, activeTreeId });
    return {
      available: getAvailableTrees(level),
      active,
      level,
      activeTreeId: active.id,
    };
  }, [level, activeTreeId]);
}

export function useMiningRocks() {
  const { level, activeRockId } = useGameStore(
    useShallow((state) => ({
      level: state.skills.mining.level,
      activeRockId: state.skills.mining.activeRockId,
    }))
  );

  return useMemo(() => {
    const active = getActiveMiningRock({ level, activeRockId });
    return {
      available: getMiningRocksForLevel(level),
      active,
      level,
      activeRockId: active.id,
    };
  }, [level, activeRockId]);
}

export function useFishingSpots() {
  const { level, activeFishingSpotId } = useGameStore(
    useShallow((state) => ({
      level: state.skills.fishing.level,
      activeFishingSpotId: state.skills.fishing.activeFishingSpotId,
    }))
  );

  return useMemo(() => {
    const active = getActiveFishingSpot({ level, activeFishingSpotId });
    return {
      available: getFishingSpotsForLevel(level),
      active,
      level,
      activeFishingSpotId: active.id,
    };
  }, [level, activeFishingSpotId]);
}

export function useNotificationActions() {
  return useGameStore(
    useShallow((state) => ({
      addNotification: state.addNotification,
      removeNotification: state.removeNotification,
      clearNotifications: state.clearNotifications,
    }))
  );
}

export function useActiveMultipliers() {
  const multipliers = useGameStore(useShallow((state) => state.multipliers.active));

  return useMemo(() => {
    return multipliers.slice().sort((a, b) => {
      if (a.source < b.source) return -1;
      if (a.source > b.source) return 1;
      return 0;
    });
  }, [multipliers]);
}

export function useCookingRecipes() {
  const { level, activeCookingRecipeId } = useGameStore(
    useShallow((state) => ({
      level: state.skills.cooking.level,
      activeCookingRecipeId: state.skills.cooking.activeCookingRecipeId,
    }))
  );

  return useMemo(() => {
    const active = getActiveCookingRecipe({ level, activeCookingRecipeId });
    return {
      available: getCookingRecipesForLevel(level),
      active,
      level,
      activeCookingRecipeId: active.id,
    };
  }, [level, activeCookingRecipeId]);
}

export function useBagFood() {
  const bag = useGameStore(useShallow((state) => state.bag));

  return useMemo(() => {
    return ITEM_IDS
      .filter((itemId) => {
        const def = ITEM_DEFINITIONS[itemId];
        return isFood(def);
      })
      .map((itemId) => {
        const def = ITEM_DEFINITIONS[itemId];
        if (!isFood(def)) return null;
        const quantity = bag.slots
          .filter((slot): slot is NonNullable<typeof slot> => slot !== null && slot.itemId === itemId)
          .reduce((sum, slot) => sum + slot.quantity, 0);
        return { itemId, name: def.name, icon: def.icon, healAmount: def.healAmount, quantity };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null && entry.quantity > 0);
  }, [bag]);
}

export function useBagPotions() {
  const bag = useGameStore(useShallow((state) => state.bag));

  return useMemo(() => {
    return ITEM_IDS
      .filter((itemId) => {
        const def = ITEM_DEFINITIONS[itemId];
        return isPotion(def);
      })
      .map((itemId) => {
        const def = ITEM_DEFINITIONS[itemId];
        if (!isPotion(def)) return null;
        const quantity = bag.slots
          .filter((slot): slot is NonNullable<typeof slot> => slot !== null && slot.itemId === itemId)
          .reduce((sum, slot) => sum + slot.quantity, 0);
        return {
          itemId,
          name: def.name,
          icon: def.icon,
          buffType: def.buffType,
          buffValue: def.buffValue,
          durationMs: def.durationMs,
          quantity,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null && entry.quantity > 0);
  }, [bag]);
}

export function useHerbloreRecipes() {
  const { level, activeHerbloreRecipeId } = useGameStore(
    useShallow((state) => ({
      level: state.skills.herblore.level,
      activeHerbloreRecipeId: state.skills.herblore.activeHerbloreRecipeId,
    }))
  );

  return useMemo(() => {
    const active = getActiveHerbloreRecipe({ level, activeHerbloreRecipeId });
    return {
      available: getHerbloreRecipesForLevel(level),
      active,
      level,
      activeHerbloreRecipeId: active.id,
    };
  }, [level, activeHerbloreRecipeId]);
}
