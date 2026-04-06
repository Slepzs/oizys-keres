export type QuestSpotlightSection = 'claim' | 'active' | 'available' | 'completed' | null;

interface ResolveQuestSpotlightInput {
  questId?: string | null;
  readyToClaimIds: string[];
  activeQuestIds: string[];
  availableQuestIds: string[];
  completedQuestIds: string[];
}

interface QuestSpotlight {
  section: QuestSpotlightSection;
  showCompleted: boolean;
}

export function resolveQuestSpotlight({
  questId,
  readyToClaimIds,
  activeQuestIds,
  availableQuestIds,
  completedQuestIds,
}: ResolveQuestSpotlightInput): QuestSpotlight {
  if (!questId) {
    return {
      section: null,
      showCompleted: false,
    };
  }

  if (readyToClaimIds.includes(questId)) {
    return {
      section: 'claim',
      showCompleted: false,
    };
  }

  if (activeQuestIds.includes(questId)) {
    return {
      section: 'active',
      showCompleted: false,
    };
  }

  if (availableQuestIds.includes(questId)) {
    return {
      section: 'available',
      showCompleted: false,
    };
  }

  if (completedQuestIds.includes(questId)) {
    return {
      section: 'completed',
      showCompleted: true,
    };
  }

  return {
    section: null,
    showCompleted: false,
  };
}
