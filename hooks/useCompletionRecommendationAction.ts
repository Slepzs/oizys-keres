import { useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';

import type { CompletionRecommendation } from '@/game/logic';
import { useCombatActions, useGameActions } from '@/store';
import { getCompletionRecommendationAction } from '@/ui/components/game/completion-recommendation-action';

export function useCompletionRecommendationAction(
  recommendation: CompletionRecommendation
) {
  const router = useRouter();
  const { startQuest } = useGameActions();
  const { selectZone, selectEnemyForZone } = useCombatActions();

  const action = useMemo(() => {
    return getCompletionRecommendationAction(recommendation);
  }, [recommendation]);

  const handlePress = useCallback(() => {
    if (action.shouldStartQuest && action.questId) {
      startQuest(action.questId);
    }

    if (action.zoneId) {
      selectZone(action.zoneId);
      if (action.enemyId) {
        selectEnemyForZone(action.zoneId, action.enemyId);
      }
    }

    router.push(action.route as never);
  }, [action, router, selectEnemyForZone, selectZone, startQuest]);

  return {
    action,
    handlePress,
  };
}
