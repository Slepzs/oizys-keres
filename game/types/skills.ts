import type { ResourceId } from './resources';

export type SkillId = 'woodcutting' | 'mining' | 'smithing';

export interface SkillState {
  level: number;
  xp: number;
  automationUnlocked: boolean;
  automationEnabled: boolean;
  tickProgress: number;
  activeTreeId?: string;
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
