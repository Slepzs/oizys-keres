import type { CompletionRecommendation } from '@/game/logic';

export interface CompletionRecommendationAction {
  ctaLabel: string;
  route: '/combat' | '/skills' | '/quests' | '/progress';
  shouldStartQuest: boolean;
  questId?: string;
  enemyId?: string;
  zoneId?: string;
}

export function getCompletionRecommendationAction(
  recommendation: CompletionRecommendation
): CompletionRecommendationAction {
  switch (recommendation.kind) {
    case 'start-contract':
    case 'start-quest':
      return {
        ctaLabel: recommendation.kind === 'start-contract' ? 'Start contract' : 'Start quest',
        route: '/quests',
        shouldStartQuest: true,
        questId: recommendation.questId,
      };
    case 'advance-quest':
      return {
        ctaLabel: 'Open quests',
        route: '/quests',
        shouldStartQuest: false,
        questId: recommendation.questId,
      };
    case 'hunt-contract':
    case 'train-combat':
      return {
        ctaLabel: 'Open combat',
        route: '/combat',
        shouldStartQuest: false,
        questId: recommendation.questId,
        enemyId: recommendation.enemyId,
        zoneId: recommendation.zoneId,
      };
    case 'complete-ledger':
      return {
        ctaLabel: 'Review ledger',
        route: '/progress',
        shouldStartQuest: false,
      };
    case 'finish-ascension':
    default:
      switch (recommendation.focusArea) {
        case 'player':
        case 'skills':
          return {
            ctaLabel: 'Train skills',
            route: '/skills',
            shouldStartQuest: false,
          };
        case 'quests':
          return {
            ctaLabel: 'Open quests',
            route: '/quests',
            shouldStartQuest: false,
          };
        case 'combat':
        case 'kills':
        case 'zones':
          return {
            ctaLabel: 'Open combat',
            route: '/combat',
            shouldStartQuest: false,
          };
        case 'completion':
        default:
          return {
            ctaLabel: 'Review ledger',
            route: '/progress',
            shouldStartQuest: false,
          };
      }
  }
}
