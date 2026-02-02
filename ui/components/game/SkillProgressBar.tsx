import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProgressBar } from '../common/ProgressBar';
import { colors, fontSize, spacing } from '@/constants/theme';
import { formatNumber } from '@/utils/format';
import { skillXpProgress, skillXpRequired } from '@/game/logic';
import type { SkillState } from '@/game/types';

interface SkillProgressBarProps {
  skill: SkillState;
  showNumbers?: boolean;
}

export function SkillProgressBar({ skill, showNumbers = true }: SkillProgressBarProps) {
  const xpRequired = skillXpRequired(skill);
  const progress = skillXpProgress(skill);

  return (
    <View style={styles.container}>
      <ProgressBar progress={progress} height={6} />
      {showNumbers && (
        <View style={styles.numbers}>
          <Text style={styles.xp}>
            {formatNumber(skill.xp)} / {formatNumber(xpRequired)} XP
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  numbers: {
    marginTop: spacing.xs,
    alignItems: 'flex-end',
  },
  xp: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
});
