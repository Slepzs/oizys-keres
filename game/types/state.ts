import type { CombatState } from './combat';
import type { ResourcesState } from './resources';
import type { FishingRodId, FishingUpgradeId, FishingUpgradePreset, RareFishId, SkillId, SkillsState } from './skills';
import type { BagState, SortMode } from './items';
import type { QuestsState } from './quests';
import type { AchievementsState } from './achievements';
import type { MultipliersState } from './multipliers';
import type { NotificationsState } from './notifications';
import type { CraftingState } from './crafting';
import type { SummoningState } from './summoning';

export interface BagSettings {
  autoSort: boolean;
  sortMode: SortMode;
  activeTabIndex: number;
}

export interface PlayerState {
  level: number;
  xp: number;
  coins: number;
  health: number;
  maxHealth: number;
  mana: number;
  maxMana: number;
}

export interface AttributeState {
  base: number;
  bonus: number;
  multiplier: number;
  current?: number;
}

export type AttributesState = Record<string, AttributeState>;

export interface SkillStatState {
  level: number;
  xp: number;
  tier?: number;
  mastery?: number;
}

export type SkillStatsState = Record<SkillId, SkillStatState>;

export interface FishingGearState {
  ownedRodIds: FishingRodId[];
  ownedUpgradeIds: FishingUpgradeId[];
  discoveredRareFishIds: RareFishId[];
  activeUpgradePreset: FishingUpgradePreset;
}

export interface TimestampsState {
  lastActive: number;
  lastSave: number;
  sessionStart: number;
}

export interface GameState {
  player: PlayerState;
  skills: SkillsState;
  attributes: AttributesState;
  skillStats: SkillStatsState;
  resources: ResourcesState;
  fishingGear: FishingGearState;
  bag: BagState;
  bagSettings: BagSettings;
  quests: QuestsState;
  achievements: AchievementsState;
  multipliers: MultipliersState;
  crafting: CraftingState;
  summoning: SummoningState;
  combat: CombatState;
  timestamps: TimestampsState;
  activeSkill: string | null;
  rngSeed: number;
  notifications: NotificationsState;
}

export type GameAction =
  | { type: 'TICK'; payload: { deltaMs: number } }
  | { type: 'SET_ACTIVE_SKILL'; payload: { skillId: string | null } }
  | { type: 'TOGGLE_AUTOMATION'; payload: { skillId: string } }
  | { type: 'PROCESS_OFFLINE'; payload: { elapsedMs: number } }
  | { type: 'LOAD_SAVE'; payload: { state: GameState } }
  | { type: 'RESET' };
