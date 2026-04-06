import React, { type ComponentProps, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import type { CombatAbilityCooldowns, CombatAbilityEffects, CombatAbilityId } from '@/game/types';
import { CombatLogCard } from '@/ui/components/game/CombatLogCard';
import { TICK_RATE_MS } from '@/game/data';

import { buildBattleSceneModel } from './battle-scene.model';
import { CombatBattleScene } from './CombatBattleScene';

type CombatLogProps = ComponentProps<typeof CombatLogCard>;

interface ActiveCombatState {
  zoneId: string;
  enemyId: string;
  enemyCurrentHp: number;
  playerCurrentHp: number;
  playerMaxHp: number;
  playerNextAttackAt: number;
  enemyNextAttackAt: number;
  petNextAttackAt: number | null;
}

interface CombatBattleViewProps extends CombatLogProps {
  totalKills: number;
  totalDeaths: number;
  activeCombat: ActiveCombatState | null;
  playerAttackIntervalSeconds: number;
  enemyAttackIntervalSeconds: number | null;
  abilityCooldowns: CombatAbilityCooldowns;
  abilityEffects: CombatAbilityEffects;
  onFleeCombat: () => void;
  onUseAbility: (abilityId: CombatAbilityId) => void;
}

export function CombatBattleView({
  totalKills,
  totalDeaths,
  activeCombat,
  playerAttackIntervalSeconds,
  enemyAttackIntervalSeconds,
  abilityCooldowns,
  abilityEffects,
  onFleeCombat,
  onUseAbility,
  entries,
  killsThisSession,
}: CombatBattleViewProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, TICK_RATE_MS);

    return () => clearInterval(interval);
  }, []);

  const scene = useMemo(() => {
    return buildBattleSceneModel({
      activeCombat,
      totalKills,
      totalDeaths,
      playerAttackIntervalSeconds,
      enemyAttackIntervalSeconds,
      abilityCooldowns,
      abilityEffects,
      now,
    });
  }, [
    activeCombat,
    abilityCooldowns,
    abilityEffects,
    enemyAttackIntervalSeconds,
    now,
    playerAttackIntervalSeconds,
    totalDeaths,
    totalKills,
  ]);

  return (
    <View style={styles.content}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionKicker}>Live Updates</Text>
        <Text style={styles.sectionTitle}>Battle Theater</Text>
        <Text style={styles.sectionSubtitle}>
          {activeCombat
            ? 'The side-view lane carries the encounter while the log keeps the latest outcomes readable.'
            : 'No fight is active. The lane stays ready here and recent combat output will collect below once a hunt starts.'}
        </Text>
      </View>

      <CombatBattleScene scene={scene} onFleeCombat={onFleeCombat} onUseAbility={onUseAbility} />

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
  section: {
    marginBottom: spacing.sm,
  },
});
