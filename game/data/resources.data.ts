import type { ResourceDefinition, ResourceId, ResourceState, ResourcesState } from '../types';

export const RESOURCE_DEFINITIONS: Record<ResourceId, ResourceDefinition> = {
  wood: {
    id: 'wood',
    name: 'Wood',
    description: 'Basic building material gathered from trees.',
    icon: '🪵',
  },
  oak_wood: {
    id: 'oak_wood',
    name: 'Oak Wood',
    description: 'Sturdy wood from oak trees.',
    icon: '🪵',
  },
  willow_wood: {
    id: 'willow_wood',
    name: 'Willow Wood',
    description: 'Flexible wood from willow trees.',
    icon: '🌿',
  },
  maple_wood: {
    id: 'maple_wood',
    name: 'Maple Wood',
    description: 'Beautiful wood from maple trees.',
    icon: '🍁',
  },
  yew_wood: {
    id: 'yew_wood',
    name: 'Yew Wood',
    description: 'Ancient wood from yew trees.',
    icon: '🌲',
  },
  magic_wood: {
    id: 'magic_wood',
    name: 'Magic Wood',
    description: 'Wood infused with magical energy.',
    icon: '✨',
  },
  stone: {
    id: 'stone',
    name: 'Stone',
    description: 'Hard material mined from rocks.',
    icon: '🪨',
  },
  ore: {
    id: 'ore',
    name: 'Ore',
    description: 'Raw metal ore for crafting.',
    icon: '⛏️',
  },
  copper_ore: {
    id: 'copper_ore',
    name: 'Copper Ore',
    description: 'Soft copper ore, easy to smelt.',
    icon: '🟤',
  },
  iron_ore: {
    id: 'iron_ore',
    name: 'Iron Ore',
    description: 'Common iron ore used in many recipes.',
    icon: '🔩',
  },
  coal: {
    id: 'coal',
    name: 'Coal',
    description: 'Combustible coal used to fuel smelting.',
    icon: '🖤',
  },
  mithril_ore: {
    id: 'mithril_ore',
    name: 'Mithril Ore',
    description: 'A rare, light metal with magical properties.',
    icon: '💠',
  },
  adamantite_ore: {
    id: 'adamantite_ore',
    name: 'Adamantite Ore',
    description: 'An incredibly hard ore found in the deepest deposits.',
    icon: '⬛',
  },
  spirit_essence: {
    id: 'spirit_essence',
    name: 'Spirit Essence',
    description: 'Condensed ritual energy used to call and strengthen companions.',
    icon: '🔮',
  },
  raw_shrimp: {
    id: 'raw_shrimp',
    name: 'Raw Shrimp',
    description: 'Small crustaceans caught in shallow ponds.',
    icon: '🦐',
  },
  raw_sardine: {
    id: 'raw_sardine',
    name: 'Raw Sardine',
    description: 'Small silver fish from freshwater lakes.',
    icon: '🐟',
  },
  raw_trout: {
    id: 'raw_trout',
    name: 'Raw Trout',
    description: 'A firm fish found in mountain rivers.',
    icon: '🐠',
  },
  raw_salmon: {
    id: 'raw_salmon',
    name: 'Raw Salmon',
    description: 'A prized coastal fish with rich pink flesh.',
    icon: '🐡',
  },
  raw_lobster: {
    id: 'raw_lobster',
    name: 'Raw Lobster',
    description: 'A large crustacean hauled from the deep sea floor.',
    icon: '🦞',
  },
  raw_swordfish: {
    id: 'raw_swordfish',
    name: 'Raw Swordfish',
    description: 'A powerful open-ocean fish with a deadly bill.',
    icon: '🗡️',
  },
  raw_shark: {
    id: 'raw_shark',
    name: 'Raw Shark',
    description: 'Apex predator of the abyssal trench. Fearless anglers only.',
    icon: '🦈',
  },
  raw_glacier_fish: {
    id: 'raw_glacier_fish',
    name: 'Raw Glacier Fish',
    description: 'Dense coldwater fish hauled from glacial supply routes.',
    icon: '🐟',
  },
  raw_stormsnap_tuna: {
    id: 'raw_stormsnap_tuna',
    name: 'Raw Stormsnap Tuna',
    description: 'A fierce shelf-runner prized for value and weight.',
    icon: '🐠',
  },
  raw_celestial_koi: {
    id: 'raw_celestial_koi',
    name: 'Raw Celestial Koi',
    description: 'A radiant reef fish tied to the rarest fishing waters.',
    icon: '✨',
  },
};

export const RESOURCE_IDS = Object.keys(RESOURCE_DEFINITIONS) as ResourceId[];

export function createInitialResourceState(): ResourceState {
  return {
    amount: 0,
    totalGained: 0,
  };
}

export function createInitialResourcesState(): ResourcesState {
  return {
    wood: createInitialResourceState(),
    oak_wood: createInitialResourceState(),
    willow_wood: createInitialResourceState(),
    maple_wood: createInitialResourceState(),
    yew_wood: createInitialResourceState(),
    magic_wood: createInitialResourceState(),
    stone: createInitialResourceState(),
    ore: createInitialResourceState(),
    copper_ore: createInitialResourceState(),
    iron_ore: createInitialResourceState(),
    coal: createInitialResourceState(),
    mithril_ore: createInitialResourceState(),
    adamantite_ore: createInitialResourceState(),
    spirit_essence: createInitialResourceState(),
    raw_shrimp: createInitialResourceState(),
    raw_sardine: createInitialResourceState(),
    raw_trout: createInitialResourceState(),
    raw_salmon: createInitialResourceState(),
    raw_lobster: createInitialResourceState(),
    raw_swordfish: createInitialResourceState(),
    raw_shark: createInitialResourceState(),
    raw_glacier_fish: createInitialResourceState(),
    raw_stormsnap_tuna: createInitialResourceState(),
    raw_celestial_koi: createInitialResourceState(),
  };
}
