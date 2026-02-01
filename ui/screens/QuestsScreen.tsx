import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeContainer } from '../components/layout/SafeContainer';
import { QuestCard } from '../components/game/QuestCard';
import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { useQuestsHook } from '@/hooks/useQuests';

export function QuestsScreen() {
  const {
    activeQuests,
    readyToClaim,
    availableQuests,
    totalCompleted,
    startQuest,
    claimRewards,
    abandonQuest,
  } = useQuestsHook();

  return (
    <SafeContainer padTop={false}>
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
                onStart={() => startQuest(definition.id)}
              />
            ))}
          </View>
        )}

        {/* Empty State */}
        {activeQuests.length === 0 &&
          readyToClaim.length === 0 &&
          availableQuests.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📜</Text>
              <Text style={styles.emptyText}>No quests available</Text>
              <Text style={styles.emptySubtext}>
                Keep playing to unlock new quests
              </Text>
            </View>
          )}
      </ScrollView>
    </SafeContainer>
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
});
