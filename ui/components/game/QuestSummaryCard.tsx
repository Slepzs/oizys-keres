import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { Card } from '../common/Card';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '@/constants/theme';
import { useGameStore } from '@/store';
import { getQuestDefinition } from '@/game/data';
import type { PlayerQuestState } from '@/game/types';

function isQuestComplete(state: PlayerQuestState): boolean {
  const definition = getQuestDefinition(state.questId);
  if (!definition) return false;

  return definition.objectives.every((objective) => {
    const current = state.progress[objective.id] ?? 0;
    if (objective.type === 'gain_xp' || objective.type === 'gain_resource') {
      return current >= objective.amount;
    }
    if (objective.type === 'collect_item' || objective.type === 'kill' || objective.type === 'craft') {
      return current >= objective.amount;
    }
    if (objective.type === 'reach_level') {
      return current >= objective.level;
    }
    if (objective.type === 'timer') {
      return current >= objective.durationMs;
    }
    return false;
  });
}

export function QuestSummaryCard() {
  const router = useRouter();

  const { active, totalCompleted } = useGameStore(
    useShallow((state) => ({
      active: state.quests.active,
      totalCompleted: state.quests.totalCompleted,
    }))
  );

  const { activeCount, claimableCount } = useMemo(() => {
    const claimable = active.filter((q) => isQuestComplete(q)).length;
    return {
      activeCount: active.length,
      claimableCount: claimable,
    };
  }, [active]);

  const summary = useMemo(() => {
    const hasClaimable = claimableCount > 0;
    const activeNonClaimable = activeCount - claimableCount;

    return {
      hasClaimable,
      activeNonClaimable,
      statusText: hasClaimable
        ? `${claimableCount} ready to claim!`
        : activeNonClaimable > 0
        ? `${activeNonClaimable} in progress`
        : 'Start a quest',
    };
  }, [activeCount, claimableCount]);

  const handlePress = () => {
    router.push('/quests');
  };

  return (
    <Pressable onPress={handlePress}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.icon}>📜</Text>
            <Text style={styles.title}>Quests</Text>
          </View>
          {summary.hasClaimable && <View style={styles.badge} />}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{activeCount}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{totalCompleted}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        <Text style={[styles.statusText, summary.hasClaimable && styles.statusHighlight]}>
          {summary.statusText}
        </Text>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  icon: {
    fontSize: 20,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  badge: {
    width: 10,
    height: 10,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.sm,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  statusText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  statusHighlight: {
    color: colors.success,
    fontWeight: fontWeight.semibold,
  },
});
