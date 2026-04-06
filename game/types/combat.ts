export type CombatSkillId = 'attack' | 'strength' | 'defense';
export type TrainingMode = 'attack' | 'strength' | 'defense' | 'balanced';
export type EquipmentSlot = 'weapon' | 'helmet' | 'chest' | 'legs' | 'boots' | 'accessory';
export type CombatAbilityId = 'burst' | 'guard' | 'recover';

export interface CombatSkillState {
  xp: number;
}

export type CombatSkillsState = Record<CombatSkillId, CombatSkillState>;

export interface EquipmentStats {
  attackBonus: number;
  strengthBonus: number;
  defenseBonus: number;
  attackSpeed?: number;
}

export type EquipmentState = Record<EquipmentSlot, string | null>;

export interface EnemyDefinition {
  id: string;
  name: string;
  icon: string;
  maxHp: number;
  attack: number;
  strength: number;
  defense: number;
  attackSpeed: number;
  xpReward: number;
  combatLevelRequired: number;
}

export interface ZoneDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  combatLevelRequired: number;
  enemies: string[];
}

export interface ActiveCombat {
  zoneId: string;
  enemyId: string;
  enemyCurrentHp: number;
  playerNextAttackAt: number;
  enemyNextAttackAt: number;
  petNextAttackAt?: number;
  playerRegenAt: number;
}

export type PotionBuffType = 'attack' | 'strength' | 'defence';

export interface PotionBuff {
  buffType: PotionBuffType;
  value: number;
  expiresAt: number;
}

export interface CombatAbilityEffects {
  burstReady: boolean;
  guardExpiresAt: number;
}

export type CombatAbilityCooldowns = Record<CombatAbilityId, number>;

export interface CombatState {
  combatSkills: CombatSkillsState;
  equipment: EquipmentState;
  activeCombat: ActiveCombat | null;
  trainingMode: TrainingMode;
  playerCurrentHp: number;
  playerMaxHp: number;
  selectedZoneId: string | null;
  selectedEnemyByZone: Record<string, string>;
  autoFight: boolean;
  autoEat: boolean;
  autoEatThreshold: number;
  autoDrink: boolean;
  potionBuffs: PotionBuff[];
  abilityCooldowns: CombatAbilityCooldowns;
  abilityEffects: CombatAbilityEffects;
  totalKills: number;
  enemyKillCounts: Record<string, number>;
  totalDeaths: number;
}

export interface CombatSkillDefinition {
  id: CombatSkillId;
  name: string;
  description: string;
  icon: string;
}

export interface CombatAbilityDefinition {
  id: CombatAbilityId;
  label: string;
  description: string;
  tone: 'attack' | 'defense' | 'support';
  cooldownMs: number;
}

export const COMBAT_SKILL_IDS: CombatSkillId[] = ['attack', 'strength', 'defense'];
export const EQUIPMENT_SLOTS: EquipmentSlot[] = ['weapon', 'helmet', 'chest', 'legs', 'boots', 'accessory'];
export const COMBAT_ABILITY_IDS: CombatAbilityId[] = ['burst', 'guard', 'recover'];
