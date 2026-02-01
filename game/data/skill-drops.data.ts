import type { ItemId } from '../types/items';
import type { SkillId } from '../types/skills';

export interface SkillDropEntry {
  itemId: ItemId;
  /** Base chance (0-1) per action */
  chance: number;
  minQuantity: number;
  maxQuantity: number;
  /** Minimum skill level required for this drop */
  minLevel: number;
}

export type SkillDropTable = SkillDropEntry[];

export const SKILL_DROP_TABLES: Record<SkillId, SkillDropTable> = {
  woodcutting: [
    {
      itemId: 'tree_seed',
      chance: 0.05,
      minQuantity: 1,
      maxQuantity: 2,
      minLevel: 1,
    },
    {
      itemId: 'bird_nest',
      chance: 0.02,
      minQuantity: 1,
      maxQuantity: 1,
      minLevel: 10,
    },
  ],

  mining: [
    {
      itemId: 'ruby',
      chance: 0.03,
      minQuantity: 1,
      maxQuantity: 1,
      minLevel: 5,
    },
    {
      itemId: 'sapphire',
      chance: 0.03,
      minQuantity: 1,
      maxQuantity: 1,
      minLevel: 5,
    },
    {
      itemId: 'geode',
      chance: 0.01,
      minQuantity: 1,
      maxQuantity: 1,
      minLevel: 15,
    },
  ],

  smithing: [
    {
      itemId: 'bronze_ingot',
      chance: 0.3,
      minQuantity: 1,
      maxQuantity: 1,
      minLevel: 1,
    },
    {
      itemId: 'iron_ingot',
      chance: 0.15,
      minQuantity: 1,
      maxQuantity: 1,
      minLevel: 15,
    },
    {
      itemId: 'bronze_pickaxe',
      chance: 0.05,
      minQuantity: 1,
      maxQuantity: 1,
      minLevel: 5,
    },
    {
      itemId: 'bronze_hatchet',
      chance: 0.05,
      minQuantity: 1,
      maxQuantity: 1,
      minLevel: 5,
    },
  ],
};
