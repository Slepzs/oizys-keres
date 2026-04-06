import type { CompletionRecommendation } from '@/game/logic';
import { SKILL_DEFINITIONS } from '@/game/data';
import { getSkillDetailHref } from '@/ui/screens/skill-detail.config';

export interface CompletionRecommendationAction {
  ctaLabel: string;
  route: '/combat' | '/skills' | '/quests' | '/progress' | `/skill/${string}`;
  params?: Record<string, string>;
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
        params: recommendation.questId
          ? {
              questId: recommendation.questId,
            }
          : undefined,
        shouldStartQuest: true,
        questId: recommendation.questId,
      };
    case 'advance-quest':
      return {
        ctaLabel: 'Open quests',
        route: '/quests',
        params: recommendation.questId
          ? {
              questId: recommendation.questId,
            }
          : undefined,
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
          return {
            ctaLabel: 'Train skills',
            route: '/skills',
            shouldStartQuest: false,
          };
        case 'skills':
          if (recommendation.skillId) {
            const skillName = SKILL_DEFINITIONS[recommendation.skillId]?.name ?? recommendation.skillId;
            return {
              ctaLabel: `Open ${skillName}`,
              route: getSkillDetailHref(recommendation.skillId),
              shouldStartQuest: false,
            };
          }

          return {
            ctaLabel: 'Train skills',
            route: '/skills',
            shouldStartQuest: false,
          };
        case 'quests':
          return {
            ctaLabel: 'Open quests',
            route: '/quests',
            params: recommendation.questId
              ? {
                  questId: recommendation.questId,
                }
              : undefined,
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
