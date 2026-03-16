import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeContainer } from '../components/layout/SafeContainer';
import { Card } from '../components/common/Card';
import { ProgressBar } from '../components/common/ProgressBar';
import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { getAllStatDefinitions } from '@/game/systems';
import type { AttributeStatDefinition, SkillStatDefinition, StatDefinition } from '@/game/types';
import { usePlayerSummary, useSkillSummaries, useCombatSummary, useActiveMultipliers, useAchievements } from '@/store';
import { ACHIEVEMENT_DEFINITIONS, COMBAT_SKILL_DEFINITIONS } from '@/game/data';
import { COMBAT_SKILL_IDS } from '@/game/types';

const SHOW_SUMMARY = true;

export function StatsScreen() {
  const playerSummary = usePlayerSummary();
  const skillSummaries = useSkillSummaries();
  const combatSummary = useCombatSummary();
  const activeMultipliers = useActiveMultipliers();
  const achievements = useAchievements();

  const totalAchievements = Object.keys(ACHIEVEMENT_DEFINITIONS).length;
  const unlockedAchievements = achievements.unlocked.length;

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

        <Pressable onPress={() => router.push('/achievements')}>
          <Card style={styles.achievementsCard}>
            <View style={styles.achievementsRow}>
              <Text style={styles.achievementsIcon}>🏆</Text>
              <View style={styles.achievementsInfo}>
                <Text style={styles.achievementsTitle}>Achievements</Text>
                <Text style={styles.achievementsSubtitle}>
                  {unlockedAchievements} / {totalAchievements} unlocked
                </Text>
              </View>
              <Text style={styles.achievementsChevron}>›</Text>
            </View>
            <ProgressBar
              progress={totalAchievements > 0 ? unlockedAchievements / totalAchievements : 0}
              color={colors.warning}
              height={4}
              style={styles.achievementsProgress}
            />
          </Card>
        </Pressable>

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

        <Text style={styles.sectionTitle}>Combat</Text>
        <Card style={styles.statCard}>
          <View style={styles.statRow}>
            <View style={styles.statLabelRow}>
              <Text style={styles.statIcon}>⚔️</Text>
              <View>
                <Text style={styles.statLabel}>Combat Level</Text>
                <Text style={styles.statSubLabel}>
                  {combatSummary.totalKills} kills · {combatSummary.totalDeaths} deaths
                </Text>
              </View>
            </View>
            <Text style={styles.statValue}>Level {combatSummary.combatLevel}</Text>
          </View>
        </Card>
        {COMBAT_SKILL_IDS.map((skillId) => {
          const skill = combatSummary.skills[skillId];
          const def = COMBAT_SKILL_DEFINITIONS[skillId];
          return (
            <Card key={skillId} style={styles.statCard}>
              <View style={styles.statRow}>
                <View style={styles.statLabelRow}>
                  <Text style={styles.statIcon}>{def.icon}</Text>
                  <View>
                    <Text style={styles.statLabel}>{def.name}</Text>
                    <Text style={styles.statSubLabel}>Level {skill.level}</Text>
                  </View>
                </View>
                <Text style={styles.statValue}>
                  {skill.xpRequired > 0
                    ? `${skill.xp} / ${skill.xpRequired} XP`
                    : `${skill.xp} XP`}
                </Text>
              </View>
              <ProgressBar
                progress={skill.progress}
                color={colors.error}
                backgroundColor={colors.xpBarBg}
                height={6}
                style={styles.skillProgress}
              />
            </Card>
          );
        })}

        {activeMultipliers.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Bonuses</Text>
            {activeMultipliers.map((multiplier) => (
              <Card key={multiplier.id} style={styles.statCard}>
                <View style={styles.statRow}>
                  <View style={styles.statLabelRow}>
                    <Text style={styles.statIcon}>✨</Text>
                    <View>
                      <Text style={styles.statLabel}>{formatMultiplierTarget(multiplier.target)}</Text>
                      <Text style={styles.statSubLabel}>{formatMultiplierSource(multiplier.source)}</Text>
                    </View>
                  </View>
                  <Text style={[styles.statValue, styles.bonusValue]}>
                    {multiplier.type === 'additive'
                      ? `+${Math.round(multiplier.value * 100)}%`
                      : `${multiplier.value.toFixed(2)}x`}
                  </Text>
                </View>
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    </SafeContainer>
  );
}

function formatMultiplierTarget(target: string): string {
  switch (target) {
    case 'xp': return 'Global XP';
    case 'drops': return 'Drop Chance';
    case 'all_skills': return 'All Skills XP';
    case 'woodcutting': return 'Woodcutting XP';
    case 'mining': return 'Mining XP';
    case 'crafting': return 'Crafting XP';
    case 'attack': return 'Attack XP';
    case 'strength': return 'Strength XP';
    case 'defense': return 'Defense XP';
    case 'summoning': return 'Summoning XP';
    default: return `${target} XP`;
  }
}

function formatMultiplierSource(source: string): string {
  switch (source) {
    case 'infrastructure': return 'Infrastructure';
    case 'achievement': return 'Achievement';
    case 'upgrade': return 'Upgrade';
    case 'equipment': return 'Equipment';
    case 'perk': return 'Perk';
    default: return source;
  }
}

const styles = StyleSheet.create({
  achievementsCard: {
    marginBottom: spacing.lg,
  },
  achievementsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  achievementsIcon: {
    fontSize: 28,
  },
  achievementsInfo: {
    flex: 1,
  },
  achievementsTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  achievementsSubtitle: {
    fontSize: fontSize.sm,
    color: colors.warning,
    marginTop: spacing.xs,
  },
  achievementsChevron: {
    fontSize: fontSize.xl,
    color: colors.textMuted,
  },
  achievementsProgress: {
    marginTop: spacing.sm,
  },
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
  bonusValue: {
    color: colors.success,
    fontWeight: fontWeight.bold,
  },
});
