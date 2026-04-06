import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeContainer } from '../components/layout/SafeContainer';
import { QuestCard } from '../components/game/QuestCard';
import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { useQuestsHook } from '@/hooks/useQuests';
import { resolveQuestSpotlight } from './quests-focus';

interface QuestsScreenProps {
  highlightQuestId?: string;
}

export function QuestsScreen({ highlightQuestId }: QuestsScreenProps) {
  return (
    <SafeContainer padTop={false}>
      <QuestsTabContent highlightQuestId={highlightQuestId} />
    </SafeContainer>
  );
}

interface QuestsTabContentProps {
  highlightQuestId?: string;
}

export function QuestsTabContent({ highlightQuestId }: QuestsTabContentProps) {
  const {
    activeQuests,
    readyToClaim,
    availableQuests,
    completedQuests,
    totalCompleted,
    startQuest,
    claimRewards,
    abandonQuest,
  } = useQuestsHook();
  const spotlight = resolveQuestSpotlight({
    questId: highlightQuestId,
    readyToClaimIds: readyToClaim.map((quest) => quest.state.questId),
    activeQuestIds: activeQuests.map((quest) => quest.state.questId),
    availableQuestIds: availableQuests.map((quest) => quest.id),
    completedQuestIds: completedQuests.map((quest) => quest.definition.id),
  });
  const [showCompleted, setShowCompleted] = useState(spotlight.showCompleted);

  React.useEffect(() => {
    setShowCompleted(spotlight.showCompleted);
  }, [spotlight.showCompleted]);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Quests</Text>
        <Text style={styles.completedCount}>{totalCompleted} completed</Text>
      </View>

      {/* Ready to Claim Section */}
      {readyToClaim.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ready to Claim</Text>
          {readyToClaim.map((quest) => (
            <QuestCard
              key={quest.state.questId}
              definition={quest.definition}
              state={quest.state}
              progress={quest.progress}
              isComplete={quest.isComplete}
              variant="claim"
              isHighlighted={spotlight.section === 'claim' && highlightQuestId === quest.state.questId}
              onClaim={() => claimRewards(quest.state.questId)}
            />
          ))}
        </View>
      )}

      {/* Active Quests Section */}
      {activeQuests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Quests</Text>
          {activeQuests.map((quest) => (
            <QuestCard
              key={quest.state.questId}
              definition={quest.definition}
              state={quest.state}
              progress={quest.progress}
              isComplete={quest.isComplete}
              variant="active"
              isHighlighted={spotlight.section === 'active' && highlightQuestId === quest.state.questId}
              onAbandon={() => abandonQuest(quest.state.questId)}
            />
          ))}
        </View>
      )}

      {/* Available Quests Section */}
      {availableQuests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Quests</Text>
          {availableQuests.map((definition) => (
            <QuestCard
              key={definition.id}
              definition={definition}
              variant="available"
              isHighlighted={spotlight.section === 'available' && highlightQuestId === definition.id}
              onStart={() => startQuest(definition.id)}
            />
          ))}
        </View>
      )}

      {/* Completed Quests Toggle */}
      {totalCompleted > 0 && (
        <Pressable
          style={styles.completedToggle}
          onPress={() => setShowCompleted(!showCompleted)}
        >
          <Text style={styles.completedToggleText}>
            {showCompleted ? '▼' : '▶'} Completed Quests ({totalCompleted})
          </Text>
        </Pressable>
      )}

      {/* Completed Quests Section */}
      {showCompleted && completedQuests.length > 0 && (
        <View style={styles.section}>
          {completedQuests.map((quest) => (
            <QuestCard
              key={quest.definition.id}
              definition={quest.definition}
              variant="completed"
              completedAt={quest.completedAt}
              completedCount={quest.completedCount}
              isHighlighted={
                spotlight.section === 'completed' && highlightQuestId === quest.definition.id
              }
            />
          ))}
        </View>
      )}

      {/* Empty State */}
      {activeQuests.length === 0 &&
        readyToClaim.length === 0 &&
        availableQuests.length === 0 &&
        (!showCompleted || completedQuests.length === 0) && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📜</Text>
            <Text style={styles.emptyText}>No quests available</Text>
            <Text style={styles.emptySubtext}>
              Keep playing to unlock new quests
            </Text>
          </View>
        )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  completedCount: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  completedToggle: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  completedToggleText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
});
