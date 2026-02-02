import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
        <Text style={styles.combatLevel}>Combat Level {combatLevel}</Text>
        <View style={styles.effectiveStats}>
          <Text style={styles.statLabel}>ATK: {effectiveAttack}</Text>
          <Text style={styles.statLabel}>STR: {effectiveStrength}</Text>
          <Text style={styles.statLabel}>DEF: {effectiveDefense}</Text>
        </View>
      </View>

      <View style={styles.skillsContainer}>
        {COMBAT_SKILL_IDS.map((skillId) => {
          const skill = skills[skillId];
          const isTraining = trainingMode === skillId || trainingMode === 'balanced';
          return (
            <View key={skillId} style={styles.skillRow}>
              <View style={styles.skillHeader}>
                <Text style={styles.skillIcon}>{skill.icon}</Text>
                <Text style={[styles.skillName, isTraining && styles.trainingSkill]}>
                  {skill.name}
                </Text>
                <Text style={styles.skillLevel}>Lv. {skill.level}</Text>
              </View>
              <ProgressBar
                progress={skill.progress}
                height={4}
                color={isTraining ? colors.primary : colors.xpBar}
              />
              <Text style={styles.xpText}>
                {formatNumber(skill.xp)} / {formatNumber(skill.xpRequired)} XP
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.trainingModeContainer}>
        <Text style={styles.trainingLabel}>Training Focus:</Text>
        <View style={styles.trainingButtons}>
          {TRAINING_MODES.map(({ mode, label }) => (
            <Text
              key={mode}
              style={[
                styles.trainingButton,
                trainingMode === mode && styles.trainingButtonActive,
              ]}
              onPress={() => onTrainingModeChange(mode)}
            >
              {label}
            </Text>
          ))}
        </View>
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
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  combatLevel: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  effectiveStats: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  skillsContainer: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  skillRow: {
    gap: spacing.xs,
  },
  skillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  skillIcon: {
    fontSize: 18,
  },
  skillName: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
  },
  trainingSkill: {
    color: colors.primary,
  },
  skillLevel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  xpText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'right',
  },
  trainingModeContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
    paddingTop: spacing.md,
  },
  trainingLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  trainingButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  trainingButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    textAlign: 'center',
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    overflow: 'hidden',
  },
  trainingButtonActive: {
    backgroundColor: colors.primaryDark,
    color: colors.text,
  },
});
