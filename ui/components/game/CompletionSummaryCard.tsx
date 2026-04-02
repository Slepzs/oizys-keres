import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { borderRadius, colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { useCompletionProgress } from '@/store';

import { Card } from '../common/Cards/Card';

function getRecommendationMeta(kind: string) {
  switch (kind) {
    case 'start-contract':
      return {
        eyebrow: 'Next Contract',
        icon: '📜',
        accent: colors.warning,
      };
    case 'hunt-contract':
      return {
        eyebrow: 'Active Hunt',
        icon: '🎯',
        accent: colors.error,
      };
    case 'train-combat':
      return {
        eyebrow: 'Combat Gate',
        icon: '⚔️',
        accent: colors.primary,
      };
    case 'complete-ledger':
      return {
        eyebrow: 'Completion',
        icon: '🏁',
        accent: colors.success,
      };
    default:
      return {
        eyebrow: 'Ledger Gap',
        icon: '📈',
        accent: colors.rarityRare,
      };
  }
}

export function CompletionSummaryCard() {
  const router = useRouter();
  const completion = useCompletionProgress();
  const meta = useMemo(() => {
    return getRecommendationMeta(completion.recommendation.kind);
  }, [completion.recommendation.kind]);

  return (
    <Card
      style={styles.card}
      variant="elevated"
      onPress={() => router.push('/progress')}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.icon}>{meta.icon}</Text>
          <View style={styles.titleStack}>
            <Text style={[styles.eyebrow, { color: meta.accent }]}>{meta.eyebrow}</Text>
            <Text style={styles.title}>Late-Game Focus</Text>
          </View>
        </View>
        <Text style={styles.chevron}>{'\u2192'}</Text>
      </View>

      <Text style={styles.primaryText}>{completion.recommendation.title}</Text>
      <Text style={styles.detailText}>{completion.recommendation.detail}</Text>

      <View style={styles.footer}>
        <Text style={[styles.actionPill, { borderColor: meta.accent, color: meta.accent }]}>
          {completion.recommendation.actionLabel}
        </Text>
        <Text style={styles.progressMeta}>
          {completion.finalContracts.completedCount}/{completion.finalContracts.total} final contracts
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  titleStack: {
    flex: 1,
  },
  icon: {
    fontSize: 20,
  },
  eyebrow: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  chevron: {
    fontSize: fontSize.lg,
    color: colors.textMuted,
  },
  primaryText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  detailText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  footer: {
    gap: spacing.sm,
  },
  actionPill: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    backgroundColor: colors.surface,
  },
  progressMeta: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});
