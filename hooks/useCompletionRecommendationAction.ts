import { useCallback, useMemo } from 'react';
import { useRouter } from 'expo-router';

import type { CompletionRecommendation } from '@/game/logic';
import { useCombatActions, useGameActions } from '@/store';
import { getCompletionRecommendationAction } from '@/ui/components/game/completion-recommendation-action';

export function useCompletionRecommendationAction(
  recommendation: CompletionRecommendation | null
) {
  const router = useRouter();
  const { startQuest } = useGameActions();
  const { selectZone, selectEnemyForZone } = useCombatActions();

  const action = useMemo(() => {
    return recommendation ? getCompletionRecommendationAction(recommendation) : null;
  }, [recommendation]);

  const handlePress = useCallback(() => {
    if (!action) {
      return;
    }

    if (action.shouldStartQuest && action.questId) {
      startQuest(action.questId);
    }

    if (action.zoneId) {
      selectZone(action.zoneId);
      if (action.enemyId) {
        selectEnemyForZone(action.zoneId, action.enemyId);
      }
    }

    if (action.params) {
      router.push({
        pathname: action.route,
        params: action.params,
      } as never);
      return;
    }

    router.push(action.route as never);
  }, [action, router, selectEnemyForZone, selectZone, startQuest]);

  return {
    action,
    handlePress,
  };
}
