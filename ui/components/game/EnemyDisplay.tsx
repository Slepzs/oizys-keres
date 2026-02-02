import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '@/constants/theme';
import { ProgressBar } from '../common/ProgressBar';
import { ENEMY_DEFINITIONS } from '@/game/data';

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

  const enemyHpProgress = enemy.maxHp > 0 ? enemyCurrentHp / enemy.maxHp : 0;
  const playerHpProgress = playerMaxHp > 0 ? playerCurrentHp / playerMaxHp : 0;

  return (
    <View style={styles.container}>
      <View style={styles.combatants}>
        {/* Player side */}
        <View style={styles.combatant}>
          <Text style={styles.combatantIcon}>🧑</Text>
          <Text style={styles.combatantName}>You</Text>
          <ProgressBar
            progress={playerHpProgress}
            height={8}
            color={colors.healthBar}
            backgroundColor={colors.healthBarBg}
          />
          <Text style={styles.hpText}>
            {playerCurrentHp} / {playerMaxHp} HP
          </Text>
        </View>

        {/* VS indicator */}
        <View style={styles.vsContainer}>
          <Text style={styles.vsText}>VS</Text>
        </View>

        {/* Enemy side */}
        <View style={styles.combatant}>
          <Text style={styles.combatantIcon}>{enemy.icon}</Text>
          <Text style={styles.combatantName}>{enemy.name}</Text>
          <ProgressBar
            progress={enemyHpProgress}
            height={8}
            color={colors.error}
            backgroundColor={colors.surfaceLight}
          />
          <Text style={styles.hpText}>
            {enemyCurrentHp} / {enemy.maxHp} HP
          </Text>
        </View>
      </View>

      <View style={styles.enemyStats}>
        <Text style={styles.statsLabel}>Enemy Stats:</Text>
        <View style={styles.statsRow}>
          <Text style={styles.statItem}>ATK: {enemy.attack}</Text>
          <Text style={styles.statItem}>STR: {enemy.strength}</Text>
          <Text style={styles.statItem}>DEF: {enemy.defense}</Text>
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
  combatants: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  combatant: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  combatantIcon: {
    fontSize: 48,
    marginBottom: spacing.xs,
  },
  combatantName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  hpText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  vsContainer: {
    paddingHorizontal: spacing.sm,
  },
  vsText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
  },
  enemyStats: {
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
    paddingTop: spacing.sm,
  },
  statsLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  statItem: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
