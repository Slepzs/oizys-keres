import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ProgressBar } from '@/ui/components/common/ProgressBar';
import { Card } from '@/ui/components/common/Cards/Card';
import { SafeContainer } from '@/ui/components/layout/SafeContainer';
import { borderRadius, colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { useCompletionProgress } from '@/store';

import { AchievementsTabContent } from './AchievementsScreen';
import { QuestsTabContent } from './QuestsScreen';

type ProgressTabId = 'quests' | 'achievements' | 'completion';

interface ProgressScreenProps {
  initialTab?: ProgressTabId;
}

const PROGRESS_TABS: Array<{ id: ProgressTabId; label: string }> = [
  { id: 'quests', label: 'Quests' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'completion', label: 'Completion' },
];

export function ProgressScreen({ initialTab = 'quests' }: ProgressScreenProps) {
  const [activeTab, setActiveTab] = useState<ProgressTabId>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  return (
    <SafeContainer padTop={false}>
      <View style={styles.tabBar}>
        {PROGRESS_TABS.map((tab) => {
          const isActive = tab.id === activeTab;

          return (
            <Pressable
              key={tab.id}
              style={({ pressed }) => [
                styles.tabButton,
                isActive && styles.tabButtonActive,
                pressed && styles.tabButtonPressed,
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.content}>
        {activeTab === 'quests' ? <QuestsTabContent /> : null}
        {activeTab === 'achievements' ? <AchievementsTabContent /> : null}
        {activeTab === 'completion' ? <CompletionTabContent /> : null}
      </View>
    </SafeContainer>
  );
}

function CompletionTabContent() {
  const completion = useCompletionProgress();
  const overviewCards = useMemo(() => {
    return [
      {
        key: 'player',
        label: 'Player Level',
        value: `${completion.ascension.player.current}/${completion.ascension.player.target}`,
        progress: completion.ascension.player.progress,
        color: colors.primary,
      },
      {
        key: 'combat',
        label: 'Combat Level',
        value: `${completion.ascension.combat.current}/${completion.ascension.combat.target}`,
        progress: completion.ascension.combat.progress,
        color: colors.error,
      },
      {
        key: 'quests',
        label: 'Quests Completed',
        value: `${completion.realm.quests.current}/${completion.realm.quests.target}`,
        progress: completion.realm.quests.progress,
        color: colors.warning,
      },
      {
        key: 'kills',
        label: 'Total Kills',
        value: `${completion.realm.kills.current.toLocaleString()}/${completion.realm.kills.target.toLocaleString()}`,
        progress: completion.realm.kills.progress,
        color: colors.success,
      },
    ];
  }, [completion]);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Completion</Text>
        <Text style={styles.sectionMeta}>
          {completion.finalContracts.completedCount}/{completion.finalContracts.total} final contracts
        </Text>
      </View>

      <Card style={styles.loreCard} variant="elevated">
        <Text style={styles.loreEyebrow}>{completion.lore.title}</Text>
        <Text style={styles.loreBody}>{completion.lore.intro}</Text>
      </Card>

      <View style={styles.metricsGrid}>
        {overviewCards.map((card) => (
          <Card key={card.key} style={styles.metricCard}>
            <Text style={styles.metricLabel}>{card.label}</Text>
            <Text style={styles.metricValue}>{card.value}</Text>
            <ProgressBar
              progress={card.progress}
              color={card.color}
              backgroundColor={colors.surfaceLight}
              height={6}
              style={styles.metricProgress}
            />
          </Card>
        ))}
      </View>

      <Card style={styles.realmCard}>
        <View style={styles.realmHeader}>
          <Text style={styles.realmTitle}>Realm Mastery</Text>
          <Text style={styles.realmValue}>
            {completion.realm.zones.current}/{completion.realm.zones.target} zones unlocked
          </Text>
        </View>
        <ProgressBar
          progress={completion.realm.zones.progress}
          color={colors.rarityRare}
          backgroundColor={colors.surfaceLight}
          height={6}
          style={styles.metricProgress}
        />
        <Text style={styles.realmCopy}>
          Unlock every combat frontier, then push the late hunts until the final ledger is closed.
        </Text>
      </Card>

      <View style={styles.section}>
        <Text style={styles.subsectionTitle}>Final Hunts</Text>
        {completion.finalHunts.map((hunt) => (
          <Card key={hunt.enemyId} style={styles.listCard}>
            <View style={styles.listHeader}>
              <View style={styles.listTitleRow}>
                <Text style={styles.listIcon}>{hunt.enemyIcon}</Text>
                <View>
                  <Text style={styles.listTitle}>{hunt.enemyName}</Text>
                  <Text style={styles.listSubtitle}>{hunt.zoneName}</Text>
                </View>
              </View>
              <Text style={[styles.statusBadge, hunt.unlocked ? styles.statusReady : styles.statusLocked]}>
                {hunt.unlocked ? 'UNLOCKED' : 'LOCKED'}
              </Text>
            </View>
            <View style={styles.huntStatsRow}>
              <Text style={styles.huntStat}>Kills: {hunt.kills}</Text>
              <Text style={styles.huntStat}>
                Quest: {hunt.questCompleted ? 'Complete' : hunt.questName}
              </Text>
            </View>
          </Card>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.subsectionTitle}>Final Contracts</Text>
        {completion.finalContracts.entries.map((entry) => (
          <Card key={entry.questId} style={styles.listCard}>
            <View style={styles.listHeader}>
              <View style={styles.listTitleRow}>
                <Text style={styles.listIcon}>{entry.icon}</Text>
                <View>
                  <Text style={styles.listTitle}>{entry.name}</Text>
                  <Text style={styles.listSubtitle}>{entry.description}</Text>
                </View>
              </View>
              <Text style={[styles.statusBadge, entry.completed ? styles.statusComplete : styles.statusPending]}>
                {entry.completed ? 'DONE' : 'OPEN'}
              </Text>
            </View>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    marginTop: spacing.md,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primary,
  },
  tabButtonPressed: {
    opacity: 0.9,
  },
  tabLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  tabLabelActive: {
    color: colors.text,
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  sectionMeta: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  loreCard: {
    marginBottom: spacing.md,
  },
  loreEyebrow: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.warning,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  loreBody: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 21,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  metricCard: {
    width: '48%',
    gap: spacing.xs,
  },
  metricLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  metricProgress: {
    marginTop: spacing.xs,
  },
  realmCard: {
    marginBottom: spacing.lg,
  },
  realmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    alignItems: 'center',
  },
  realmTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  realmValue: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  realmCopy: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  section: {
    marginBottom: spacing.lg,
  },
  subsectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  listCard: {
    marginBottom: spacing.sm,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  listTitleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flex: 1,
  },
  listIcon: {
    fontSize: fontSize.xl,
  },
  listTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  listSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statusBadge: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statusLocked: {
    color: colors.textSecondary,
    backgroundColor: colors.surfaceLight,
  },
  statusReady: {
    color: colors.success,
    backgroundColor: 'rgba(74, 222, 128, 0.12)',
  },
  statusComplete: {
    color: colors.success,
    backgroundColor: 'rgba(74, 222, 128, 0.12)',
  },
  statusPending: {
    color: colors.warning,
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
  },
  huntStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  huntStat: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
});
