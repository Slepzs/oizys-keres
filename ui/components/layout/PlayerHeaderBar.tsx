import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { usePlayerSummary } from '@/store';
import { Card } from '@/ui/components/common';

import { ProgressBar } from '../common/ProgressBar';

import { PLAYER_HEADER_BAR_MIN_HEIGHT } from './SafeContainer.metrics';
import { PlayerCard } from '../common/Cards/PlayerCard';

export function PlayerHeaderBar() {
  const router = useRouter();
  const playerSummary = usePlayerSummary();

  return (
    <PlayerCard style={styles.card} onPress={() => router.push('/stats')}>
      <View style={styles.header}>
        <Text style={styles.title}>Player</Text>
        <View style={styles.levelRow}>
          <Text style={styles.level}>Level {playerSummary.level}</Text>
          <Text style={styles.chevron}>{'\u2192'}</Text>
        </View>
      </View>

      <ProgressBar
        progress={playerSummary.progress}
        color={colors.primary}
        height={8}
      />

      <View style={styles.stats}>
        <Text style={styles.statText}>
          {'\u2764\uFE0F'} {playerSummary.currentHealth}/{playerSummary.maxHealth}
        </Text>
        <Text style={styles.statText}>
          {'\u2728'} {playerSummary.currentMana}/{playerSummary.maxMana}
        </Text>
      </View>
    </PlayerCard>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: PLAYER_HEADER_BAR_MIN_HEIGHT,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  levelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  level: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  chevron: {
    fontSize: fontSize.lg,
    color: colors.textMuted,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  statText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
