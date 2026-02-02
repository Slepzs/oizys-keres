import type { ZoneDefinition } from '../types/combat';

export const ZONE_DEFINITIONS: Record<string, ZoneDefinition> = {
  sewers: {
    id: 'sewers',
    name: 'City Sewers',
    description: 'Dark tunnels beneath the city, home to rats and other vermin.',
    icon: '🚰',
    combatLevelRequired: 1,
    enemies: ['rat', 'wolf', 'nerd'],
  },
  forest: {
    id: 'forest',
    name: 'Goblin Forest',
    description: 'A dense forest infested with goblin raiders.',
    icon: '🌲',
    combatLevelRequired: 5,
    enemies: ['goblin'],
  },
  crypt: {
    id: 'crypt',
    name: 'Ancient Crypt',
    description: 'An abandoned crypt filled with restless undead.',
    icon: '⚰️',
    combatLevelRequired: 10,
    enemies: ['skeleton'],
  },
  stronghold: {
    id: 'stronghold',
    name: 'Orc Stronghold',
    description: 'A fortified camp of orc warriors.',
    icon: '🏰',
    combatLevelRequired: 20,
    enemies: ['orc'],
  },
  caves: {
    id: 'caves',
    name: 'Troll Caves',
    description: 'Deep caves where trolls make their lair.',
    icon: '🕳️',
    combatLevelRequired: 30,
    enemies: ['troll'],
  },
  abyss: {
    id: 'abyss',
    name: 'Demonic Abyss',
    description: 'A rift to the demon realm. Only the strongest survive.',
    icon: '🔥',
    combatLevelRequired: 45,
    enemies: ['demon'],
  },
};

export const ZONE_IDS = Object.keys(ZONE_DEFINITIONS);
