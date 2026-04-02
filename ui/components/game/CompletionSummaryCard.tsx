import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useCompletionRecommendationAction } from '@/hooks';
import { borderRadius, colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { useCompletionProgress } from '@/store';

import { Card } from '../common/Cards/Card';
import { Button } from '../common/Button';

function getRecommendationMeta(kind: string) {
  switch (kind) {
    case 'start-contract':
      return {
        eyebrow: 'Next Contract',
        icon: '📜',
        accent: colors.warning,
      };
    case 'start-quest':
      return {
        eyebrow: 'Next Quest',
        icon: '🧭',
        accent: colors.primary,
      };
    case 'advance-quest':
      return {
        eyebrow: 'Support Track',
        icon: '🗂️',
        accent: colors.rarityRare,
      };
    case 'hunt-contract':
      return {
        eyebrow: 'Active Hunt',
        icon: '🎯',
        accent: colors.error,
      };
    case 'train-skill':
      return {
        eyebrow: 'Skill Gate',
        icon: '🪓',
        accent: colors.primary,
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
  const { action, handlePress } = useCompletionRecommendationAction(
    completion.recommendation
  );
  const { action: nonCombatAction, handlePress: handleNonCombatPress } =
    useCompletionRecommendationAction(completion.nonCombatRecommendation);
  const meta = useMemo(() => {
    return getRecommendationMeta(completion.recommendation.kind);
  }, [completion.recommendation.kind]);
  const nonCombatMeta = useMemo(() => {
    return getRecommendationMeta(completion.nonCombatRecommendation.kind);
  }, [completion.nonCombatRecommendation.kind]);

  return (
    <Card style={styles.card} variant="elevated">
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.icon}>{meta.icon}</Text>
          <View style={styles.titleStack}>
            <Text style={[styles.eyebrow, { color: meta.accent }]}>{meta.eyebrow}</Text>
            <Text style={styles.title}>Late-Game Focus</Text>
          </View>
        </View>
      </View>

      <Text style={styles.primaryText}>{completion.recommendation.title}</Text>
      <Text style={styles.detailText}>{completion.recommendation.detail}</Text>

      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <Text style={[styles.actionPill, { borderColor: meta.accent, color: meta.accent }]}>
            {completion.recommendation.actionLabel}
          </Text>
          <Text style={styles.progressMeta}>
            {completion.finalContracts.completedCount}/{completion.finalContracts.total} final contracts
          </Text>
        </View>
        <View style={styles.buttonRow}>
          <Button
            title={action.ctaLabel}
            onPress={handlePress}
            size="sm"
            style={styles.primaryButton}
          />
          <Button
            title="View ledger"
            onPress={() => router.push('/progress' as never)}
            variant="secondary"
            size="sm"
            style={styles.secondaryButton}
          />
        </View>
      </View>

      <View style={styles.secondarySection}>
        <View style={styles.secondaryHeader}>
          <Text style={[styles.secondaryEyebrow, { color: nonCombatMeta.accent }]}>
            {nonCombatMeta.eyebrow}
          </Text>
          <Text
            style={[styles.actionPill, { borderColor: nonCombatMeta.accent, color: nonCombatMeta.accent }]}
          >
            {completion.nonCombatRecommendation.actionLabel}
          </Text>
        </View>
        <Text style={styles.secondaryTitle}>{completion.nonCombatRecommendation.title}</Text>
        <Text style={styles.secondaryDetail}>{completion.nonCombatRecommendation.detail}</Text>
        <Button
          title={nonCombatAction.ctaLabel}
          onPress={handleNonCombatPress}
          variant="secondary"
          size="sm"
        />
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
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    flexShrink: 1,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'right',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  primaryButton: {
    flex: 1,
  },
  secondaryButton: {
    flex: 1,
  },
  secondarySection: {
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
    paddingTop: spacing.md,
  },
  secondaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  secondaryEyebrow: {
    flex: 1,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
  },
  secondaryTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  secondaryDetail: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 19,
  },
});
