import type { SkillId } from '../../game/types/skills.ts';

type SkillDetailHref = `/skill/${SkillId}`;
type AppHref = SkillDetailHref | '/crafting' | '/combat';
const SKILL_ID_SET = new Set<SkillId>([
  'woodcutting',
  'mining',
  'crafting',
  'summoning',
  'fishing',
  'cooking',
  'herblore',
]);

interface SkillTrainAction {
  kind: 'train';
  title: 'Train' | 'Stop';
  variant: 'primary' | 'secondary';
}

interface SkillNavigateAction {
  kind: 'navigate';
  title: string;
  variant: 'primary' | 'secondary';
  href: AppHref;
}

interface SkillSecondaryAction {
  label: string;
  description: string;
  title: string;
  href: AppHref;
}

export function getSkillDetailHref(skillId: SkillId): SkillDetailHref {
  return `/skill/${skillId}`;
}

export function isSkillIdParam(value: string): value is SkillId {
  return SKILL_ID_SET.has(value as SkillId);
}

export function getSkillPrimaryAction(skillId: SkillId, isTraining: boolean): SkillTrainAction | SkillNavigateAction {
  if (skillId === 'crafting') {
    return {
      kind: 'navigate',
      title: 'Open Crafting',
      variant: 'primary',
      href: '/crafting',
    };
  }

  return {
    kind: 'train',
    title: isTraining ? 'Stop' : 'Train',
    variant: isTraining ? 'secondary' : 'primary',
  };
}

export function getSkillSecondaryAction(skillId: SkillId): SkillSecondaryAction | null {
  if (skillId === 'cooking' || skillId === 'herblore') {
    return {
      label: 'Combat',
      description: 'Food and potion loadout',
      title: 'Open',
      href: '/combat',
    };
  }

  return null;
}

export function getSkillSelectionLabel(skillId: SkillId): string | null {
  switch (skillId) {
    case 'woodcutting':
      return 'Tree';
    case 'mining':
      return 'Rock';
    case 'fishing':
      return 'Spot';
    case 'cooking':
    case 'herblore':
      return 'Recipe';
    case 'summoning':
      return 'Companion';
    case 'crafting':
      return null;
    default:
      return null;
  }
}
