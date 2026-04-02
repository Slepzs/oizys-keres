export interface CompletionHuntDefinition {
  enemyId: string;
  zoneId: string;
  questId: string;
}

export const COMPLETION_TARGETS = {
  playerLevel: 100,
  combatLevel: 120,
  questsCompleted: 100,
  totalKills: 10_000,
} as const;

export const COMPLETION_LORE = {
  title: 'The Last Ledger',
  intro:
    'You are past the apprentice years. What remains are the old threats that never stay buried: the Abyss, the haunted ruins, and the final contracts ordinary hunters never finish. Full completion means reaching your peak, clearing the last hunts, and proving your system can outlast the realm itself.',
} as const;

export const COMPLETION_FINAL_HUNTS: CompletionHuntDefinition[] = [
  {
    enemyId: 'banshee',
    zoneId: 'ruins',
    questId: 'silencer',
  },
  {
    enemyId: 'dragon_whelp',
    zoneId: 'dragon_lair',
    questId: 'dragonkin',
  },
  {
    enemyId: 'elder_demon',
    zoneId: 'abyssal_depths',
    questId: 'elder_nemesis',
  },
];

export const COMPLETION_FINAL_CONTRACT_IDS = [
  'demon_contract',
  'abyss_walker',
  'silencer',
  'ruins_warden',
  'dragonkin',
  'elder_nemesis',
] as const;
