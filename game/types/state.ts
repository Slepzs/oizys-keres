import type { ResourcesState } from './resources';
import type { SkillId, SkillsState } from './skills';
import type { BagState, SortMode } from './items';
import type { QuestsState } from './quests';
import type { AchievementsState } from './achievements';
import type { MultipliersState } from './multipliers';

export interface BagSettings {
  autoSort: boolean;
  sortMode: SortMode;
}

export interface PlayerState {
  level: number;
  xp: number;
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
  bag: BagState;
  bagSettings: BagSettings;
  quests: QuestsState;
  achievements: AchievementsState;
  multipliers: MultipliersState;
  timestamps: TimestampsState;
  activeSkill: string | null;
  rngSeed: number;
}

export type GameAction =
  | { type: 'TICK'; payload: { deltaMs: number } }
  | { type: 'SET_ACTIVE_SKILL'; payload: { skillId: string | null } }
  | { type: 'TOGGLE_AUTOMATION'; payload: { skillId: string } }
  | { type: 'PROCESS_OFFLINE'; payload: { elapsedMs: number } }
  | { type: 'LOAD_SAVE'; payload: { state: GameState } }
  | { type: 'RESET' };
