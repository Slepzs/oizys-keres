import React, { type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { borderRadius, colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { Card } from '@/ui/components/common';
import { CombatLogCard } from '@/ui/components/game/CombatLogCard';
import { CombatRhythmCard } from '@/ui/components/game/CombatRhythmCard';
import { EnemyDisplay } from '@/ui/components/game/EnemyDisplay';

type CombatLogProps = ComponentProps<typeof CombatLogCard>;
type EnemyDisplayProps = ComponentProps<typeof EnemyDisplay>;
type CombatRhythmProps = ComponentProps<typeof CombatRhythmCard>;

interface ActiveCombatState extends EnemyDisplayProps {
  playerNextAttackAt: number;
  enemyNextAttackAt: number;
  petNextAttackAt: number | null;
}

interface CombatBattleViewProps extends CombatLogProps {
  totalKills: number;
  kdRatio: string;
  activeCombat: ActiveCombatState | null;
  activeEnemyName: string | null;
  playerAttackIntervalSeconds: number;
  enemyAttackIntervalSeconds: number | null;
  petAttackIntervalSeconds: number | null;
  onFleeCombat: () => void;
}

export function CombatBattleView({
  totalKills,
  kdRatio,
  activeCombat,
  activeEnemyName,
  playerAttackIntervalSeconds,
  enemyAttackIntervalSeconds,
  petAttackIntervalSeconds,
  onFleeCombat,
  entries,
  killsThisSession,
}: CombatBattleViewProps) {
  return (
    <View style={styles.content}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionKicker}>Live Updates</Text>
        <Text style={styles.sectionTitle}>Battle Feed</Text>
        <Text style={styles.sectionSubtitle}>
          {activeCombat
            ? 'The active encounter and event stream stay together here.'
            : 'No fight is active. Recent combat output will collect here once a hunt starts.'}
        </Text>
      </View>

      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Kills</Text>
          <Text style={styles.summaryValue}>{totalKills}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>K/D Ratio</Text>
          <Text style={styles.summaryValue}>{kdRatio}</Text>
        </View>
      </View>

      {activeCombat ? (
        <>
          <View style={styles.section}>
            <EnemyDisplay
              enemyId={activeCombat.enemyId}
              enemyCurrentHp={activeCombat.enemyCurrentHp}
              playerCurrentHp={activeCombat.playerCurrentHp}
              playerMaxHp={activeCombat.playerMaxHp}
            />
            <Pressable
              style={({ pressed }) => [styles.fleeButton, pressed && styles.fleeButtonPressed]}
              onPress={onFleeCombat}
            >
              <Text style={styles.fleeButtonText}>Flee</Text>
            </Pressable>
          </View>

          {activeEnemyName && enemyAttackIntervalSeconds ? (
            <View style={styles.section}>
              <CombatRhythmCard
                enemyName={activeEnemyName}
                playerNextAttackAt={activeCombat.playerNextAttackAt}
                enemyNextAttackAt={activeCombat.enemyNextAttackAt}
                petNextAttackAt={activeCombat.petNextAttackAt}
                playerAttackIntervalSeconds={playerAttackIntervalSeconds}
                enemyAttackIntervalSeconds={enemyAttackIntervalSeconds}
                petAttackIntervalSeconds={petAttackIntervalSeconds}
              />
            </View>
          ) : null}
        </>
      ) : (
        <Card style={styles.idleCard}>
          <Text style={styles.idleTitle}>Awaiting Encounter</Text>
          <Text style={styles.idleCopy}>
            Start a hunt from the setup screen and this panel will jump into the active battle.
          </Text>
        </Card>
      )}

      <View style={styles.section}>
        <CombatLogCard entries={entries} killsThisSession={killsThisSession} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
  },
  sectionHeader: {
    gap: spacing.xs,
  },
  sectionKicker: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  summaryCard: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  summaryLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  section: {
    marginBottom: spacing.sm,
  },
  fleeButton: {
    backgroundColor: colors.error,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  fleeButtonPressed: {
    opacity: 0.8,
  },
  fleeButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  idleCard: {
    backgroundColor: colors.surface,
  },
  idleTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  idleCopy: {
    marginTop: spacing.xs,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
