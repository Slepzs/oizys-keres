import {
  COMPLETION_FINAL_CONTRACT_IDS,
  COMPLETION_FINAL_HUNTS,
  COMPLETION_LORE,
  COMPLETION_TARGETS,
  ENEMY_DEFINITIONS,
  getQuestDefinition,
  ZONE_DEFINITIONS,
} from '@/game/data';
import type { GameState } from '@/game/types';

import { calculateCombatLevel } from './combat';

type CompletionState = Pick<GameState, 'player' | 'combat' | 'quests'>;

interface ProgressMetric {
  current: number;
  target: number;
  progress: number;
}

interface CompletionContractEntry {
  questId: string;
  name: string;
  icon: string;
  description: string;
  completed: boolean;
}

interface CompletionHuntEntry {
  enemyId: string;
  enemyName: string;
  enemyIcon: string;
  zoneId: string;
  zoneName: string;
  kills: number;
  unlocked: boolean;
  questId: string;
  questName: string;
  questCompleted: boolean;
}

export interface CompletionProgress {
  lore: typeof COMPLETION_LORE;
  ascension: {
    player: ProgressMetric;
    combat: ProgressMetric;
  };
  realm: {
    quests: ProgressMetric;
    kills: ProgressMetric;
    zones: ProgressMetric;
  };
  finalContracts: {
    completedCount: number;
    total: number;
    entries: CompletionContractEntry[];
  };
  finalHunts: CompletionHuntEntry[];
}

function buildMetric(current: number, target: number): ProgressMetric {
  const safeTarget = Math.max(1, target);

  return {
    current,
    target,
    progress: Math.max(0, Math.min(1, current / safeTarget)),
  };
}

export function getCompletionProgress(state: CompletionState): CompletionProgress {
  const completedQuestIds = new Set(state.quests.completed);
  const combatLevel = calculateCombatLevel(state.combat.combatSkills);
  const unlockedZones = Object.values(ZONE_DEFINITIONS).filter((zone) => {
    return combatLevel >= zone.combatLevelRequired;
  }).length;

  const finalContracts = COMPLETION_FINAL_CONTRACT_IDS.map((questId) => {
    const definition = getQuestDefinition(questId);

    return {
      questId,
      name: definition?.name ?? questId,
      icon: definition?.icon ?? '📜',
      description: definition?.description ?? 'Complete this final contract.',
      completed: completedQuestIds.has(questId),
    };
  });

  const finalHunts = COMPLETION_FINAL_HUNTS.map((hunt) => {
    const enemy = ENEMY_DEFINITIONS[hunt.enemyId];
    const zone = ZONE_DEFINITIONS[hunt.zoneId];
    const linkedQuest = getQuestDefinition(hunt.questId);
    const kills = state.combat.enemyKillCounts[hunt.enemyId] ?? 0;
    const unlocked = combatLevel >= Math.max(
      zone?.combatLevelRequired ?? 1,
      enemy?.combatLevelRequired ?? 1
    );

    return {
      enemyId: hunt.enemyId,
      enemyName: enemy?.name ?? hunt.enemyId,
      enemyIcon: enemy?.icon ?? '⚔️',
      zoneId: hunt.zoneId,
      zoneName: zone?.name ?? hunt.zoneId,
      kills,
      unlocked,
      questId: hunt.questId,
      questName: linkedQuest?.name ?? hunt.questId,
      questCompleted: completedQuestIds.has(hunt.questId),
    };
  });

  return {
    lore: COMPLETION_LORE,
    ascension: {
      player: buildMetric(state.player.level, COMPLETION_TARGETS.playerLevel),
      combat: buildMetric(combatLevel, COMPLETION_TARGETS.combatLevel),
    },
    realm: {
      quests: buildMetric(state.quests.totalCompleted, COMPLETION_TARGETS.questsCompleted),
      kills: buildMetric(state.combat.totalKills, COMPLETION_TARGETS.totalKills),
      zones: buildMetric(unlockedZones, Object.keys(ZONE_DEFINITIONS).length),
    },
    finalContracts: {
      completedCount: finalContracts.filter((entry) => entry.completed).length,
      total: finalContracts.length,
      entries: finalContracts,
    },
    finalHunts,
  };
}
