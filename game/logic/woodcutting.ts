import { WOODCUTTING_TREES, getAvailableTrees, getDefaultTree } from '../data/tree-tiers.data';
import type { SkillState, TreeTierId } from '../types/skills';

export { WOODCUTTING_TREES, getAvailableTrees, getDefaultTree };

type WoodcuttingSelectionState = Pick<SkillState, 'level' | 'activeTreeId'>;

export function setActiveTree(skill: SkillState, treeId: TreeTierId): SkillState {
  const tree = WOODCUTTING_TREES[treeId];
  if (!tree || skill.level < tree.levelRequired) {
    return skill;
  }
  return {
    ...skill,
    activeTreeId: treeId,
  };
}

export function getActiveTree(skill: WoodcuttingSelectionState) {
  if (!skill.activeTreeId) {
    return getDefaultTree(skill.level);
  }

  const selectedTree = WOODCUTTING_TREES[skill.activeTreeId];
  if (!selectedTree || skill.level < selectedTree.levelRequired) {
    return getDefaultTree(skill.level);
  }

  return selectedTree;
}

export function getWoodcuttingTreesForLevel(level: number) {
  return getAvailableTrees(level);
}
