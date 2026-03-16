import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, type ViewStyle } from 'react-native';
import { SafeContainer } from '../components/layout/SafeContainer';
import { Card } from '../components/common/Card';
import { ProgressBar } from '../components/common/ProgressBar';
import { useGameStore } from '@/store';
import { ACHIEVEMENT_DEFINITIONS } from '@/game/data';
import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import type { AchievementCategory, AchievementDefinition, AchievementReward } from '@/game/types';

const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  progression: 'Progression',
  skill: 'Skills',
  collection: 'Collection',
  secret: 'Secret',
};

const CATEGORY_ORDER: AchievementCategory[] = ['progression', 'skill', 'collection', 'secret'];

interface AchievementEntry {
  definition: AchievementDefinition;
  unlocked: boolean;
  unlockedAt: number | undefined;
  progress: number | undefined;
}

function formatReward(reward: AchievementReward): string {
  switch (reward.type) {
    case 'multiplier': {
      const targetLabel = formatMultiplierTarget(reward.target);
      return `+${Math.round(reward.bonus * 100)}% ${targetLabel}`;
    }
    case 'unlock':
      return `Unlocks: ${reward.feature}`;
    case 'resource':
      return `+${reward.amount} ${reward.resourceId}`;
    case 'item':
      return `+${reward.quantity}x ${reward.itemId}`;
  }
}

function formatMultiplierTarget(target: string): string {
  switch (target) {
    case 'xp': return 'Global XP';
    case 'drops': return 'Drop Chance';
    case 'all_skills': return 'All Skills XP';
    case 'woodcutting': return 'Woodcutting XP';
    case 'mining': return 'Mining XP';
    case 'crafting': return 'Crafting XP';
    case 'summoning': return 'Summoning XP';
    default: return `${target} XP`;
  }
}

function getProgressLabel(definition: AchievementDefinition, progress: number | undefined): string | null {
  const { condition } = definition;
  switch (condition.type) {
    case 'total_kills':
      return progress != null ? `${progress.toLocaleString()} / ${condition.count.toLocaleString()} kills` : null;
    case 'quests_completed':
      return progress != null ? `${progress} / ${condition.count} quests` : null;
    case 'total_resources':
      return progress != null ? `${progress} / ${condition.amount}` : null;
    default:
      return null;
  }
}

function getProgressRatio(definition: AchievementDefinition, progress: number | undefined): number {
  if (progress == null) return 0;
  const { condition } = definition;
  switch (condition.type) {
    case 'total_kills':
      return Math.min(1, progress / condition.count);
    case 'quests_completed':
      return Math.min(1, progress / condition.count);
    case 'total_resources':
      return Math.min(1, progress / condition.amount);
    default:
      return 0;
  }
}

export function AchievementsScreen() {
  const achievements = useGameStore((state) => state.achievements);
  const [expandedCategories, setExpandedCategories] = useState<Set<AchievementCategory>>(
    new Set(['progression', 'skill', 'collection'])
  );

  const entriesByCategory = useMemo(() => {
    const allDefinitions = Object.values(ACHIEVEMENT_DEFINITIONS);
    const result: Partial<Record<AchievementCategory, AchievementEntry[]>> = {};

    for (const definition of allDefinitions) {
      if (definition.hidden && !achievements.unlocked.includes(definition.id)) {
        continue;
      }

      const entry: AchievementEntry = {
        definition,
        unlocked: achievements.unlocked.includes(definition.id),
        unlockedAt: achievements.unlockedAt[definition.id],
        progress: achievements.progress[definition.id],
      };

      const cat = definition.category;
      if (!result[cat]) result[cat] = [];
      result[cat]!.push(entry);
    }

    // Sort: unlocked first, then by name
    for (const cat of CATEGORY_ORDER) {
      result[cat]?.sort((a, b) => {
        if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
        return a.definition.name.localeCompare(b.definition.name);
      });
    }

    return result;
  }, [achievements]);

  const totalUnlocked = achievements.unlocked.length;
  const totalDefined = Object.values(ACHIEVEMENT_DEFINITIONS).filter(
    (d) => !d.hidden || achievements.unlocked.includes(d.id)
  ).length;

  const toggleCategory = (cat: AchievementCategory) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  };

  return (
    <SafeContainer padTop={false}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Achievements</Text>
          <Text style={styles.countLabel}>
            {totalUnlocked} / {totalDefined}
          </Text>
        </View>

        <Card style={styles.progressCard}>
          <ProgressBar
            progress={totalDefined > 0 ? totalUnlocked / totalDefined : 0}
            color={colors.warning}
            height={8}
          />
          <Text style={styles.progressLabel}>
            {totalDefined - totalUnlocked} remaining
          </Text>
        </Card>

        {CATEGORY_ORDER.map((cat) => {
          const entries = entriesByCategory[cat];
          if (!entries || entries.length === 0) return null;

          const unlockedInCat = entries.filter((e) => e.unlocked).length;
          const isExpanded = expandedCategories.has(cat);

          return (
            <View key={cat} style={styles.section}>
              <Pressable
                style={styles.categoryHeader}
                onPress={() => toggleCategory(cat)}
              >
                <Text style={styles.categoryTitle}>{CATEGORY_LABELS[cat]}</Text>
                <View style={styles.categoryMeta}>
                  <Text style={styles.categoryCount}>
                    {unlockedInCat}/{entries.length}
                  </Text>
                  <Text style={styles.chevron}>{isExpanded ? '▼' : '▶'}</Text>
                </View>
              </Pressable>

              {isExpanded && entries.map((entry) => (
                <AchievementCard key={entry.definition.id} entry={entry} />
              ))}
            </View>
          );
        })}
      </ScrollView>
    </SafeContainer>
  );
}

function AchievementCard({ entry }: { entry: AchievementEntry }) {
  const { definition, unlocked, unlockedAt, progress } = entry;
  const progressLabel = getProgressLabel(definition, progress);
  const progressRatio = getProgressRatio(definition, progress);
  const hasProgressBar = !unlocked && progressRatio > 0;

  return (
    <Card style={StyleSheet.flatten([styles.achievementCard, unlocked ? styles.unlockedCard : styles.lockedCard]) as ViewStyle}>
      <View style={styles.achievementRow}>
        <Text style={[styles.achievementIcon, !unlocked && styles.lockedIcon]}>
          {unlocked ? definition.icon : '🔒'}
        </Text>
        <View style={styles.achievementInfo}>
          <View style={styles.achievementNameRow}>
            <Text style={[styles.achievementName, !unlocked && styles.lockedText]}>
              {definition.name}
            </Text>
            {unlocked && (
              <Text style={styles.unlockedBadge}>✓</Text>
            )}
          </View>
          <Text style={[styles.achievementDesc, !unlocked && styles.lockedDesc]}>
            {definition.description}
          </Text>
          {definition.rewards && definition.rewards.length > 0 && (
            <Text style={[styles.rewardText, !unlocked && styles.lockedReward]}>
              {definition.rewards.map(formatReward).join('  ·  ')}
            </Text>
          )}
          {progressLabel && (
            <Text style={styles.progressText}>{progressLabel}</Text>
          )}
        </View>
      </View>
      {hasProgressBar && (
        <ProgressBar
          progress={progressRatio}
          color={colors.primary}
          backgroundColor={colors.surfaceLight}
          height={4}
          style={styles.achievementProgress}
        />
      )}
      {unlocked && unlockedAt != null && (
        <Text style={styles.unlockedAt}>
          Unlocked {new Date(unlockedAt).toLocaleDateString()}
        </Text>
      )}
    </Card>
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
  countLabel: {
    fontSize: fontSize.md,
    color: colors.warning,
    fontWeight: fontWeight.semibold,
  },
  progressCard: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  progressLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'right',
  },
  section: {
    marginBottom: spacing.lg,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceLight,
  },
  categoryTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  categoryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryCount: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  chevron: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  achievementCard: {
    marginBottom: spacing.sm,
  },
  unlockedCard: {
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  lockedCard: {
    opacity: 0.65,
  },
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  achievementIcon: {
    fontSize: 28,
  },
  lockedIcon: {
    opacity: 0.5,
  },
  achievementInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  achievementNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  achievementName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  lockedText: {
    color: colors.textMuted,
  },
  unlockedBadge: {
    fontSize: fontSize.sm,
    color: colors.warning,
    fontWeight: fontWeight.bold,
  },
  achievementDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  lockedDesc: {
    color: colors.textMuted,
  },
  rewardText: {
    fontSize: fontSize.xs,
    color: colors.success,
    fontWeight: fontWeight.medium,
  },
  lockedReward: {
    color: colors.textMuted,
  },
  progressText: {
    fontSize: fontSize.xs,
    color: colors.primary,
  },
  achievementProgress: {
    marginTop: spacing.sm,
  },
  unlockedAt: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'right',
  },
});
