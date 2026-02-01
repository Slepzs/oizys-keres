import type { ResourcesState } from './resources';
import type { SkillsState } from './skills';
import type { BagState, SortMode } from './items';
import type { QuestsState } from './quests';

export interface BagSettings {
  autoSort: boolean;
  sortMode: SortMode;
}

export interface PlayerState {
  level: number;
  xp: number;
}

export interface TimestampsState {
  lastActive: number;
  lastSave: number;
  sessionStart: number;
}

export interface GameState {
  player: PlayerState;
  skills: SkillsState;
  resources: ResourcesState;
  bag: BagState;
  bagSettings: BagSettings;
  quests: QuestsState;
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
