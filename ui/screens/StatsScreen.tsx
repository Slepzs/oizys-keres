import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeContainer } from '../components/layout/SafeContainer';
import { Card } from '../components/common/Card';
import { ProgressBar } from '../components/common/ProgressBar';
import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { getAllStatDefinitions } from '@/game/systems';
import type { AttributeStatDefinition, SkillStatDefinition, StatDefinition } from '@/game/types';
import { usePlayerSummary, useSkillSummaries } from '@/store';

const SHOW_SUMMARY = true;

export function StatsScreen() {
  const playerSummary = usePlayerSummary();
  const skillSummaries = useSkillSummaries();

  const visibleStats = useMemo(() => {
    return getAllStatDefinitions()
      .filter((stat) => stat.visibility !== 'hidden')
      .sort((a, b) => a.order - b.order);
  }, []);

  const attributes = visibleStats.filter(
    (stat): stat is AttributeStatDefinition => stat.category === 'attribute'
  );
  const skills = visibleStats.filter(
    (stat): stat is SkillStatDefinition => stat.category === 'skill'
  );

  const renderAttributeValue = (stat: AttributeStatDefinition) => {
    switch (stat.id) {
      case 'player_level':
        return `Level ${playerSummary.level}`;
      case 'player_xp':
        return playerSummary.xpRequired > 0
          ? `${playerSummary.xp} / ${playerSummary.xpRequired} XP`
          : `${playerSummary.xp} XP`;
      case 'player_health':
        return `${playerSummary.currentHealth} / ${playerSummary.maxHealth}`;
      case 'player_mana':
        return `${playerSummary.currentMana} / ${playerSummary.maxMana}`;
      default:
        return '—';
    }
  };

  const getStatIcon = (stat: StatDefinition) => {
    if (stat.icon) {
      return stat.icon;
    }
    return stat.category === 'attribute' ? '📌' : '⭐️';
  };

  return (
    <SafeContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        {SHOW_SUMMARY && (
          <Card style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>Vitals</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Health</Text>
              <Text style={styles.summaryValue}>
                {playerSummary.currentHealth} / {playerSummary.maxHealth}
              </Text>
            </View>
            <ProgressBar
              progress={playerSummary.healthProgress}
              color={colors.healthBar}
              backgroundColor={colors.healthBarBg}
              height={10}
            />

            <View style={[styles.summaryRow, styles.secondarySummaryRow]}>
              <Text style={styles.summaryLabel}>Mana</Text>
              <Text style={styles.summaryValue}>
                {playerSummary.currentMana} / {playerSummary.maxMana}
              </Text>
            </View>
            <ProgressBar
              progress={playerSummary.manaProgress}
              color={colors.manaBar}
              backgroundColor={colors.manaBarBg}
              height={10}
            />
          </Card>
        )}

        <Text style={styles.sectionTitle}>Attributes</Text>
        {attributes.map((stat) => (
          <Card key={stat.id} style={styles.statCard}>
            <View style={styles.statRow}>
              <View style={styles.statLabelRow}>
                <Text style={styles.statIcon}>{getStatIcon(stat)}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
              <Text style={styles.statValue}>{renderAttributeValue(stat)}</Text>
            </View>
          </Card>
        ))}

        <Text style={styles.sectionTitle}>Skills</Text>
        {skills.map((stat) => {
          const summary = skillSummaries[stat.skillId];
          const skillColor = (colors as Record<string, string>)[stat.skillId] ?? colors.primary;

          return (
            <Card key={stat.id} style={styles.statCard}>
              <View style={styles.statRow}>
                <View style={styles.statLabelRow}>
                  <Text style={styles.statIcon}>{getStatIcon(stat)}</Text>
                  <View>
                    <Text style={styles.statLabel}>{stat.label}</Text>
                    <Text style={styles.statSubLabel}>Level {summary.level}</Text>
                  </View>
                </View>
                <Text style={styles.statValue}>
                  {summary.xpRequired > 0
                    ? `${summary.xp} / ${summary.xpRequired} XP`
                    : `${summary.xp} XP`}
                </Text>
              </View>
              <ProgressBar
                progress={summary.progress}
                color={skillColor}
                backgroundColor={colors.xpBarBg}
                height={6}
                style={styles.skillProgress}
              />
            </Card>
          );
        })}
      </ScrollView>
    </SafeContainer>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    marginBottom: spacing.lg,
  },
  summaryHeader: {
    marginBottom: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  secondarySummaryRow: {
    marginTop: spacing.md,
  },
  summaryTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  summaryLabel: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  statCard: {
    marginBottom: spacing.sm,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statIcon: {
    fontSize: fontSize.lg,
  },
  statLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  statSubLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  skillProgress: {
    marginTop: spacing.xs,
  },
});
