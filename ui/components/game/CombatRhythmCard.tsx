import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../common/Card';
import { ProgressBar } from '../common/ProgressBar';
import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { TICK_RATE_MS } from '@/game/data';

interface CombatRhythmCardProps {
  enemyName: string;
  playerNextAttackAt: number;
  enemyNextAttackAt: number;
  petNextAttackAt?: number | null;
  playerAttackIntervalSeconds: number;
  enemyAttackIntervalSeconds: number;
  petAttackIntervalSeconds?: number | null;
}

interface RhythmRow {
  key: string;
  label: string;
  nextAttackAt: number;
  intervalMs: number;
  color: string;
}

function clampProgress(value: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

function formatRemainingMs(remainingMs: number): string {
  if (remainingMs <= 0) {
    return 'ready';
  }

  return `${(remainingMs / 1000).toFixed(1)}s`;
}

export function CombatRhythmCard({
  enemyName,
  playerNextAttackAt,
  enemyNextAttackAt,
  petNextAttackAt = null,
  playerAttackIntervalSeconds,
  enemyAttackIntervalSeconds,
  petAttackIntervalSeconds = null,
}: CombatRhythmCardProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, TICK_RATE_MS);

    return () => clearInterval(interval);
  }, []);

  const rows = useMemo(() => {
    const baseRows: RhythmRow[] = [
      {
        key: 'player',
        label: 'You',
        nextAttackAt: playerNextAttackAt,
        intervalMs: playerAttackIntervalSeconds * 1000,
        color: colors.primary,
      },
      {
        key: 'enemy',
        label: enemyName,
        nextAttackAt: enemyNextAttackAt,
        intervalMs: enemyAttackIntervalSeconds * 1000,
        color: colors.error,
      },
    ];

    if (petNextAttackAt && petAttackIntervalSeconds) {
      baseRows.push({
        key: 'pet',
        label: 'Pet',
        nextAttackAt: petNextAttackAt,
        intervalMs: petAttackIntervalSeconds * 1000,
        color: colors.success,
      });
    }

    return baseRows;
  }, [
    enemyAttackIntervalSeconds,
    enemyName,
    enemyNextAttackAt,
    petAttackIntervalSeconds,
    petNextAttackAt,
    playerAttackIntervalSeconds,
    playerNextAttackAt,
  ]);

  return (
    <Card>
      <View style={styles.header}>
        <Text style={styles.title}>Combat Rhythm</Text>
        <Text style={styles.subtitle}>Track the next attack from each combatant</Text>
      </View>

      <View style={styles.rows}>
        {rows.map((row) => {
          const remainingMs = Math.max(0, row.nextAttackAt - now);
          const progress = row.intervalMs > 0
            ? clampProgress(1 - remainingMs / row.intervalMs)
            : 1;

          return (
            <View key={row.key} style={styles.row}>
              <View style={styles.rowHeader}>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Text style={styles.rowTime}>{formatRemainingMs(remainingMs)}</Text>
              </View>
              <ProgressBar
                progress={progress}
                color={row.color}
                backgroundColor={colors.surfaceLight}
                height={10}
              />
            </View>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  rows: {
    gap: spacing.md,
  },
  row: {
    gap: spacing.xs,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  rowTime: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
});
