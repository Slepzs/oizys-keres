export type PetId =
  | 'emberling'
  | 'gravewisp'
  | 'shellback'
  | 'storm_gryphon'
  | 'void_mantis';

export type PetRole = 'skirmisher' | 'siphoner' | 'guardian' | 'vanguard' | 'executioner';
export type PetEvolutionStageId = 'dormant' | 'awakened' | 'ascended' | 'mythic';
export type PetPassiveId =
  | 'cinder_drive'
  | 'soul_siphon'
  | 'bastion_shell'
  | 'tempest_feathers'
  | 'void_hunt';

export interface PetState {
  unlocked: boolean;
  level: number;
  xp: number;
  ritualsChanneled: number;
  combatKills: number;
}

export type PetsState = Record<PetId, PetState>;

export interface SummoningState {
  activePetId: PetId | null;
  ritualsCompleted: number;
  pets: PetsState;
}

export interface PetDefinition {
  id: PetId;
  name: string;
  description: string;
  icon: string;
  role: PetRole;
  affinity: string;
  passiveId: PetPassiveId;
  passiveSummary: string;
  unlockLevel: number;
  unlockRituals: number;
  baseAttack: number;
  attackPerLevel: number;
  attackIntervalSeconds: number;
  ritualBondXp: number;
  killBondXp: number;
}

export interface PetEvolutionStageDefinition {
  id: PetEvolutionStageId;
  name: string;
  icon: string;
  minPetLevel: number;
  minSummoningLevel: number;
  powerMultiplier: number;
}

export interface SummoningCombatBonuses {
  attackBonus: number;
  strengthBonus: number;
  defenseBonus: number;
  maxHpBonus: number;
  attackSpeedMultiplier: number;
  damageReduction: number;
}

export interface ActivePetCombatProfile {
  id: PetId;
  name: string;
  icon: string;
  role: PetRole;
  affinity: string;
  level: number;
  stageId: PetEvolutionStageId;
  stageName: string;
  stageIcon: string;
  attackIntervalSeconds: number;
  damage: number;
  healOnAttack: number;
  missingHpDamageMultiplier: number;
  passiveSummary: string;
}
