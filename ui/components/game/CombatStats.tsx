import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '@/constants/theme';
import { ProgressBar } from '../common/ProgressBar';
import { formatNumber } from '@/utils/format';
import type { CombatSkillId, TrainingMode } from '@/game/types';
import { COMBAT_SKILL_IDS } from '@/game/types';

interface CombatSkillSummary {
  id: CombatSkillId;
  name: string;
  icon: string;
  level: number;
  xp: number;
  xpRequired: number;
  progress: number;
}

interface CombatStatsProps {
  combatLevel: number;
  skills: Record<CombatSkillId, CombatSkillSummary>;
  effectiveAttack: number;
  effectiveStrength: number;
  effectiveDefense: number;
  trainingMode: TrainingMode;
  onTrainingModeChange: (mode: TrainingMode) => void;
}

const TRAINING_MODES: { mode: TrainingMode; label: string }[] = [
  { mode: 'attack', label: 'Attack' },
  { mode: 'strength', label: 'Strength' },
  { mode: 'defense', label: 'Defense' },
  { mode: 'balanced', label: 'Balanced' },
];

export function CombatStats({
  combatLevel,
  skills,
  effectiveAttack,
  effectiveStrength,
  effectiveDefense,
  trainingMode,
  onTrainingModeChange,
}: CombatStatsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.kicker}>Combat Profile</Text>
          <Text style={styles.headerTitle}>Combat Level {combatLevel}</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeLabel}>Focus</Text>
          <Text style={styles.headerBadgeValue}>{trainingMode}</Text>
        </View>
      </View>

      <View style={styles.effectiveStats}>
        <View style={styles.statChip}>
          <Text style={styles.statChipLabel}>ATK</Text>
          <Text style={styles.statChipValue}>{effectiveAttack}</Text>
        </View>
        <View style={styles.statChip}>
          <Text style={styles.statChipLabel}>STR</Text>
          <Text style={styles.statChipValue}>{effectiveStrength}</Text>
        </View>
        <View style={styles.statChip}>
          <Text style={styles.statChipLabel}>DEF</Text>
          <Text style={styles.statChipValue}>{effectiveDefense}</Text>
        </View>
      </View>

      <View style={styles.trainingModeContainer}>
        <Text style={styles.trainingLabel}>Training Focus</Text>
        <View style={styles.trainingButtons}>
          {TRAINING_MODES.map(({ mode, label }) => (
            <Pressable
              key={mode}
              style={({ pressed }) => [
                styles.trainingButton,
                trainingMode === mode && styles.trainingButtonActive,
                pressed && styles.trainingButtonPressed,
              ]}
              onPress={() => onTrainingModeChange(mode)}
            >
              <Text
                style={[
                  styles.trainingButtonText,
                  trainingMode === mode && styles.trainingButtonTextActive,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.skillsContainer}>
        {COMBAT_SKILL_IDS.map((skillId) => {
          const skill = skills[skillId];
          const isTraining = trainingMode === skillId || trainingMode === 'balanced';
          return (
            <View key={skillId} style={styles.skillRow}>
              <View style={styles.skillTopRow}>
                <View style={styles.skillIdentity}>
                  <Text style={styles.skillIcon}>{skill.icon}</Text>
                  <View>
                    <Text style={[styles.skillName, isTraining && styles.trainingSkill]}>
                      {skill.name}
                    </Text>
                    <Text style={styles.skillXpInline}>
                      {formatNumber(skill.xp)} / {formatNumber(skill.xpRequired)} XP
                    </Text>
                  </View>
                </View>
                <Text style={styles.skillLevel}>Lv {skill.level}</Text>
              </View>
              <ProgressBar
                progress={skill.progress}
                height={4}
                color={isTraining ? colors.primary : colors.xpBar}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  kicker: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  headerBadge: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 74,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
  },
  headerBadgeLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  headerBadgeValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    textTransform: 'capitalize',
  },
  effectiveStats: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statChip: {
    flex: 1,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
  },
  statChipLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  statChipValue: {
    marginTop: 2,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  skillsContainer: {
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  skillRow: {
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
  },
  skillTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  skillIdentity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  skillIcon: {
    fontSize: 18,
  },
  skillName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  trainingSkill: {
    color: colors.primary,
  },
  skillXpInline: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  skillLevel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  trainingModeContainer: {
    gap: spacing.sm,
  },
  trainingLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  trainingButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  trainingButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trainingButtonPressed: {
    opacity: 0.85,
  },
  trainingButtonText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  trainingButtonActive: {
    backgroundColor: colors.primaryDark,
  },
  trainingButtonTextActive: {
    color: colors.text,
  },
});
