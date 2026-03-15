import type { ResourceId } from '../types/resources';

export interface RockTier {
  id: string;
  name: string;
  description: string;
  icon: string;
  levelRequired: number;
  baseXpPerAction: number;
  baseResourcePerAction: number;
  resourceProduced: ResourceId;
  ticksPerAction: number;
}

export const MINING_ROCKS: Record<string, RockTier> = {
  limestone: {
    id: 'limestone',
    name: 'Limestone Rock',
    description: 'Common rock that yields stone and basic ore.',
    icon: '🪨',
    levelRequired: 1,
    baseXpPerAction: 12,
    baseResourcePerAction: 1,
    resourceProduced: 'ore',
    ticksPerAction: 40,
  },
  copper: {
    id: 'copper',
    name: 'Copper Deposit',
    description: 'A soft metal deposit. Good for early crafting.',
    icon: '🟤',
    levelRequired: 10,
    baseXpPerAction: 22,
    baseResourcePerAction: 1,
    resourceProduced: 'copper_ore',
    ticksPerAction: 38,
  },
  iron: {
    id: 'iron',
    name: 'Iron Vein',
    description: 'A solid iron vein for intermediate crafting.',
    icon: '🔩',
    levelRequired: 25,
    baseXpPerAction: 40,
    baseResourcePerAction: 1,
    resourceProduced: 'iron_ore',
    ticksPerAction: 45,
  },
  coal: {
    id: 'coal',
    name: 'Coal Seam',
    description: 'Dense coal for high-heat smelting.',
    icon: '🖤',
    levelRequired: 40,
    baseXpPerAction: 60,
    baseResourcePerAction: 1,
    resourceProduced: 'coal',
    ticksPerAction: 50,
  },
  mithril: {
    id: 'mithril',
    name: 'Mithril Deposit',
    description: 'A rare, glowing deposit of mithril ore.',
    icon: '💠',
    levelRequired: 55,
    baseXpPerAction: 90,
    baseResourcePerAction: 1,
    resourceProduced: 'mithril_ore',
    ticksPerAction: 60,
  },
  adamantite: {
    id: 'adamantite',
    name: 'Adamantite Vein',
    description: 'The hardest ore known. Slow to mine but extremely valuable.',
    icon: '⬛',
    levelRequired: 70,
    baseXpPerAction: 130,
    baseResourcePerAction: 1,
    resourceProduced: 'adamantite_ore',
    ticksPerAction: 70,
  },
};

export const ROCK_IDS = Object.keys(MINING_ROCKS);

export function getAvailableRocks(miningLevel: number): RockTier[] {
  return Object.values(MINING_ROCKS).filter(
    (rock) => rock.levelRequired <= miningLevel
  );
}

export function getDefaultRock(miningLevel: number): RockTier {
  const available = getAvailableRocks(miningLevel);
  return available[available.length - 1];
}
