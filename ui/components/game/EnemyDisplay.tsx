import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '@/constants/theme';
import { ProgressBar } from '../common/ProgressBar';
import { ENEMY_DEFINITIONS } from '@/game/data';
import { scaleEnemyMaxHp } from '@/game/logic/combat/balance';

interface EnemyDisplayProps {
  enemyId: string;
  enemyCurrentHp: number;
  playerCurrentHp: number;
  playerMaxHp: number;
}

export function EnemyDisplay({
  enemyId,
  enemyCurrentHp,
  playerCurrentHp,
  playerMaxHp,
}: EnemyDisplayProps) {
  const enemy = ENEMY_DEFINITIONS[enemyId];
  if (!enemy) return null;

  const enemyMaxHp = scaleEnemyMaxHp(enemy.maxHp);
  const enemyHpProgress = enemyMaxHp > 0 ? enemyCurrentHp / enemyMaxHp : 0;
  const playerHpProgress = playerMaxHp > 0 ? playerCurrentHp / playerMaxHp : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.enemyIdentity}>
          <View style={styles.enemyIconWrap}>
            <Text style={styles.enemyIcon}>{enemy.icon}</Text>
          </View>
          <View style={styles.enemyCopy}>
            <Text style={styles.kicker}>Encounter</Text>
            <Text style={styles.enemyName}>{enemy.name}</Text>
            <Text style={styles.enemySubline}>Battle is active</Text>
          </View>
        </View>
        <View style={styles.statusPill}>
          <Text style={styles.statusLabel}>YOU</Text>
          <Text style={styles.statusValue}>
            {playerCurrentHp}/{playerMaxHp}
          </Text>
        </View>
      </View>

      <View style={styles.bars}>
        <View style={styles.barBlock}>
          <View style={styles.barMeta}>
            <Text style={styles.barLabel}>You</Text>
            <Text style={styles.barValue}>
              {playerCurrentHp} / {playerMaxHp} HP
            </Text>
          </View>
          <ProgressBar
            progress={playerHpProgress}
            height={8}
            color={colors.healthBar}
            backgroundColor={colors.healthBarBg}
          />
        </View>

        <View style={styles.barBlock}>
          <View style={styles.barMeta}>
            <Text style={styles.barLabel}>{enemy.name}</Text>
            <Text style={styles.barValue}>
              {enemyCurrentHp} / {enemyMaxHp} HP
            </Text>
          </View>
          <ProgressBar
            progress={enemyHpProgress}
            height={8}
            color={colors.error}
            backgroundColor={colors.surfaceLight}
          />
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statChip}>
          <Text style={styles.statChipLabel}>ATK</Text>
          <Text style={styles.statChipValue}>{enemy.attack}</Text>
        </View>
        <View style={styles.statChip}>
          <Text style={styles.statChipLabel}>STR</Text>
          <Text style={styles.statChipValue}>{enemy.strength}</Text>
        </View>
        <View style={styles.statChip}>
          <Text style={styles.statChipLabel}>DEF</Text>
          <Text style={styles.statChipValue}>{enemy.defense}</Text>
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
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  enemyIdentity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  enemyIconWrap: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceLight,
  },
  enemyIcon: {
    fontSize: 28,
  },
  enemyCopy: {
    flex: 1,
    gap: 2,
  },
  kicker: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  enemyName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  enemySubline: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  statusPill: {
    minWidth: 76,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
  },
  statusLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  statusValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  bars: {
    gap: spacing.sm,
  },
  barBlock: {
    gap: spacing.xs,
  },
  barMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  barLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  barValue: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  statChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
  },
  statChipLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  statChipValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginTop: 2,
  },
});
