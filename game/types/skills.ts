import type { ResourceId } from './resources';

export type SkillId = 'woodcutting' | 'mining' | 'crafting' | 'summoning';
export type TreeTierId = 'normal' | 'oak' | 'willow' | 'maple' | 'yew' | 'magic';
export type RockTierId = 'limestone' | 'copper' | 'iron' | 'coal' | 'mithril' | 'adamantite';

export interface SkillState {
  level: number;
  xp: number;
  automationUnlocked: boolean;
  automationEnabled: boolean;
  tickProgress: number;
  activeTreeId?: TreeTierId;
  activeRockId?: RockTierId;
}

export type SkillsState = Record<SkillId, SkillState>;

export interface SkillDefinition {
  id: SkillId;
  name: string;
  description: string;
  icon: string;
  baseXpPerAction: number;
  baseResourcePerAction: number;
  resourceProduced: ResourceId;
  automationUnlockLevel: number;
  ticksPerAction: number;
}
