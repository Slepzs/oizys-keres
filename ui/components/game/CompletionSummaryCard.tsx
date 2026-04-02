import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useCompletionRecommendationAction } from '@/hooks';
import { borderRadius, colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { useCompletionProgress } from '@/store';

import { Card } from '../common/Cards/Card';
import { Button } from '../common/Button';
import { ProgressBar } from '../common/ProgressBar';

function getNonCombatCategoryLabel(category: string | null) {
  switch (category) {
    case 'skill':
      return 'Skill chain';
    case 'exploration':
      return 'Exploration chain';
    default:
      return 'All tracked chains';
  }
}

function getNonCombatBlockerAccent(kind: string) {
  switch (kind) {
    case 'ready':
    case 'complete':
      return colors.success;
    case 'active':
      return colors.rarityRare;
    case 'skill':
      return colors.primary;
    case 'player':
      return colors.warning;
    case 'resource':
      return colors.secondary;
    default:
      return colors.warning;
  }
}

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
  const { action: completionAlternativeAction, handlePress: handleCompletionAlternativePress } =
    useCompletionRecommendationAction(completion.completionAdvisor.alternative);
  const { action: nonCombatAction, handlePress: handleNonCombatPress } =
    useCompletionRecommendationAction(completion.nonCombatRecommendation);
  const { action: nonCombatAlternativeAction, handlePress: handleNonCombatAlternativePress } =
    useCompletionRecommendationAction(completion.nonCombatAdvisor.alternative);
  const meta = useMemo(() => {
    return getRecommendationMeta(completion.recommendation.kind);
  }, [completion.recommendation.kind]);
  const nonCombatMeta = useMemo(() => {
    return getRecommendationMeta(completion.nonCombatRecommendation.kind);
  }, [completion.nonCombatRecommendation.kind]);
  const completionAdvisorAlternativeMeta = useMemo(() => {
    return completion.completionAdvisor.alternative
      ? getRecommendationMeta(completion.completionAdvisor.alternative.kind)
      : null;
  }, [completion.completionAdvisor.alternative]);
  const nonCombatAdvisorAlternativeMeta = useMemo(() => {
    return completion.nonCombatAdvisor.alternative
      ? getRecommendationMeta(completion.nonCombatAdvisor.alternative.kind)
      : null;
  }, [completion.nonCombatAdvisor.alternative]);

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
      <View style={styles.advisorSection}>
        <Text style={styles.advisorEyebrow}>Why this objective</Text>
        <Text style={styles.advisorTitle}>{completion.completionAdvisor.rationale.label}</Text>
        <Text style={styles.advisorDetail}>{completion.completionAdvisor.rationale.detail}</Text>
        {completion.completionAdvisor.alternative && completionAdvisorAlternativeMeta ? (
          <View style={styles.advisorAlternativeCard}>
            <View style={styles.advisorAlternativeHeader}>
              <Text style={styles.advisorAlternativeEyebrow}>After this</Text>
              <Text
                style={[
                  styles.actionPill,
                  {
                    borderColor: completionAdvisorAlternativeMeta.accent,
                    color: completionAdvisorAlternativeMeta.accent,
                  },
                ]}
              >
                {completion.completionAdvisor.alternative.actionLabel}
              </Text>
            </View>
            <Text style={styles.advisorAlternativeTitle}>
              {completion.completionAdvisor.alternative.title}
            </Text>
            <Text style={styles.advisorAlternativeDetail}>
              {completion.completionAdvisor.alternative.detail}
            </Text>
            {completionAlternativeAction ? (
              <Button
                title={completionAlternativeAction.ctaLabel}
                onPress={handleCompletionAlternativePress}
                variant="secondary"
                size="sm"
              />
            ) : null}
          </View>
        ) : null}
      </View>

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
            title={action?.ctaLabel ?? 'Open plan'}
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
        <View style={styles.supportMetaRow}>
          <Text style={styles.supportMetaText}>
            {completion.nonCombat.completedCount}/{completion.nonCombat.total} support quests
          </Text>
          <Text style={styles.supportMetaText}>
            {getNonCombatCategoryLabel(completion.nonCombat.nextCategory)}
          </Text>
        </View>
        <ProgressBar
          progress={completion.nonCombat.progress}
          color={nonCombatMeta.accent}
          backgroundColor={colors.surfaceLight}
          height={6}
        />
        <View style={styles.supportBlockerRow}>
          <Text
            style={[
              styles.actionPill,
              {
                borderColor: getNonCombatBlockerAccent(completion.nonCombat.blocker.kind),
                color: getNonCombatBlockerAccent(completion.nonCombat.blocker.kind),
              },
            ]}
          >
            {completion.nonCombat.blocker.label}
          </Text>
          <Text style={styles.supportBlockerDetail}>{completion.nonCombat.blocker.detail}</Text>
          {completion.nonCombat.blocker.progress ? (
            <View style={styles.supportBlockerProgressRow}>
              <View style={styles.supportBlockerProgressHeader}>
                <Text style={styles.supportBlockerProgressLabel}>
                  {completion.nonCombat.blocker.progress.label}
                </Text>
                <Text style={styles.supportBlockerProgressValue}>
                  {(completion.nonCombat.blocker.progress.progress * 100).toFixed(0)}%
                </Text>
              </View>
              <ProgressBar
                progress={completion.nonCombat.blocker.progress.progress}
                color={getNonCombatBlockerAccent(completion.nonCombat.blocker.kind)}
                backgroundColor={colors.surfaceLight}
                height={5}
              />
            </View>
          ) : null}
        </View>
        <View style={styles.advisorSection}>
          <Text style={styles.advisorEyebrow}>Why this branch</Text>
          <Text style={styles.advisorTitle}>{completion.nonCombatAdvisor.rationale.label}</Text>
          <Text style={styles.advisorDetail}>{completion.nonCombatAdvisor.rationale.detail}</Text>
          {completion.nonCombatAdvisor.alternative && nonCombatAdvisorAlternativeMeta ? (
            <View style={styles.advisorAlternativeCard}>
              <View style={styles.advisorAlternativeHeader}>
                <Text style={styles.advisorAlternativeEyebrow}>After this</Text>
                <Text
                  style={[
                    styles.actionPill,
                    {
                      borderColor: nonCombatAdvisorAlternativeMeta.accent,
                      color: nonCombatAdvisorAlternativeMeta.accent,
                    },
                  ]}
                >
                  {completion.nonCombatAdvisor.alternative.actionLabel}
                </Text>
              </View>
              <Text style={styles.advisorAlternativeTitle}>
                {completion.nonCombatAdvisor.alternative.title}
              </Text>
              <Text style={styles.advisorAlternativeDetail}>
                {completion.nonCombatAdvisor.alternative.detail}
              </Text>
              {nonCombatAlternativeAction ? (
                <Button
                  title={nonCombatAlternativeAction.ctaLabel}
                  onPress={handleNonCombatAlternativePress}
                  variant="secondary"
                  size="sm"
                />
              ) : null}
            </View>
          ) : null}
        </View>
        <Button
          title={nonCombatAction?.ctaLabel ?? 'Open plan'}
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
  supportMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  supportMetaText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  supportBlockerRow: {
    gap: spacing.xs,
  },
  supportBlockerProgressRow: {
    gap: spacing.xs,
  },
  supportBlockerProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  supportBlockerProgressLabel: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  supportBlockerProgressValue: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  supportBlockerDetail: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  advisorSection: {
    gap: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
  },
  advisorEyebrow: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  advisorTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  advisorDetail: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  advisorAlternativeCard: {
    gap: spacing.xs,
    marginTop: spacing.xs,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
  },
  advisorAlternativeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  advisorAlternativeEyebrow: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  advisorAlternativeTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  advisorAlternativeDetail: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    lineHeight: 17,
  },
});
