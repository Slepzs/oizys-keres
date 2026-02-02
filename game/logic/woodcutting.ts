import { WOODCUTTING_TREES, getAvailableTrees, getDefaultTree } from '../data/tree-tiers.data';
import type { SkillState } from '../types/skills';

export { WOODCUTTING_TREES, getAvailableTrees, getDefaultTree };

export function setActiveTree(skill: SkillState, treeId: string): SkillState {
  const tree = WOODCUTTING_TREES[treeId];
  if (!tree || skill.level < tree.levelRequired) {
    return skill;
  }
  return {
    ...skill,
    activeTreeId: treeId,
  };
}

export function getActiveTree(skill: SkillState) {
  if (!skill.activeTreeId) {
    return getDefaultTree(skill.level);
  }
  return WOODCUTTING_TREES[skill.activeTreeId] || getDefaultTree(skill.level);
}

export function getWoodcuttingTreesForLevel(level: number) {
  return getAvailableTrees(level);
}
