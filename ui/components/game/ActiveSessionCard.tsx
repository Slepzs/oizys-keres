import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { Card } from '../common/Cards/Card';
import { ProgressBar } from '../common/ProgressBar';
import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { useGameStore, useActiveCombat, useCombatTracker } from '@/store';
import { SKILL_DEFINITIONS, CRAFTING_RECIPES, skillSpeedMultiplier } from '@/game/data';
import { xpForSkillLevel } from '@/game/data';
import type { SkillId } from '@/game/types';

// ─── Skill row ───────────────────────────────────────────────────────────────

interface ActiveSkillRowProps {
  skillId: SkillId;
  onPress: () => void;
}

function ActiveSkillRow({ skillId, onPress }: ActiveSkillRowProps) {
  const { level, xp, tickProgress } = useGameStore(
    useShallow((state) => ({
      level: state.skills[skillId].level,
      xp: state.skills[skillId].xp,
      tickProgress: state.skills[skillId].tickProgress ?? 0,
    }))
  );

  const { name, icon, ticksPerAction } = SKILL_DEFINITIONS[skillId];

  const { xpProgress, actionProgress } = useMemo(() => {
    const xpRequired = xpForSkillLevel(level + 1);
    return {
      xpProgress: xpRequired > 0 ? xp / xpRequired : 1,
      actionProgress: ticksPerAction > 0
        ? Math.min(1, tickProgress / (ticksPerAction / Math.max(1, skillSpeedMultiplier(level))))
        : 0,
    };
  }, [level, xp, tickProgress, ticksPerAction]);

  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowIcon}>{icon}</Text>
        <View>
          <Text style={styles.rowTitle}>{name}</Text>
          <Text style={styles.rowSub}>Level {level} · Training</Text>
        </View>
      </View>
      <View style={styles.rowBars}>
        <ProgressBar
          progress={actionProgress}
          color={colors.warning}
          backgroundColor={colors.surfaceLight}
          height={4}
          style={styles.barAction}
        />
        <ProgressBar
          progress={xpProgress}
          color={colors.xpBar}
          backgroundColor={colors.xpBarBg}
          height={4}
        />
      </View>
    </Pressable>
  );
}

// ─── Combat row ──────────────────────────────────────────────────────────────

interface ActiveCombatRowProps {
  onPress: () => void;
}

function ActiveCombatRow({ onPress }: ActiveCombatRowProps) {
  const tracker = useCombatTracker();

  if (!tracker) return null;

  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowIcon}>{tracker.enemyIcon}</Text>
        <View>
          <Text style={styles.rowTitle}>{tracker.enemyName}</Text>
          <Text style={styles.rowSub}>⚔️ In combat</Text>
        </View>
      </View>
      <View style={styles.rowBars}>
        <View style={styles.hpRow}>
          <Text style={styles.hpLabel}>You</Text>
          <ProgressBar
            progress={tracker.playerProgress}
            color={colors.healthBar}
            backgroundColor={colors.healthBarBg}
            height={4}
            style={styles.hpBar}
          />
        </View>
        <View style={styles.hpRow}>
          <Text style={styles.hpLabel}>Enemy</Text>
          <ProgressBar
            progress={tracker.enemyProgress}
            color={colors.error}
            backgroundColor={colors.surfaceLight}
            height={4}
            style={styles.hpBar}
          />
        </View>
      </View>
    </Pressable>
  );
}

// ─── AutoCraft row ───────────────────────────────────────────────────────────

interface AutoCraftRowProps {
  onPress: () => void;
}

function AutoCraftRow({ onPress }: AutoCraftRowProps) {
  const { recipeId, tickProgress, craftingLevel, craftingAuto } = useGameStore(
    useShallow((state) => ({
      recipeId: state.crafting.automation.recipeId,
      tickProgress: state.crafting.automation.tickProgress ?? 0,
      craftingLevel: state.skills.crafting.level,
      craftingAuto: state.skills.crafting.automationEnabled,
    }))
  );

  const { recipe, progress } = useMemo(() => {
    if (!recipeId || !craftingAuto) return { recipe: null, progress: 0 };
    const r = CRAFTING_RECIPES[recipeId] ?? null;
    const speedMult = skillSpeedMultiplier(Math.max(1, craftingLevel));
    const ticksPerCraft = Math.max(1, SKILL_DEFINITIONS.crafting.ticksPerAction / speedMult);
    return {
      recipe: r,
      progress: Math.min(1, tickProgress / ticksPerCraft),
    };
  }, [recipeId, tickProgress, craftingLevel, craftingAuto]);

  if (!recipe) return null;

  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={styles.rowLeft}>
        <Text style={styles.rowIcon}>{recipe.fallbackIcon}</Text>
        <View>
          <Text style={styles.rowTitle}>{recipe.name}</Text>
          <Text style={styles.rowSub}>🔨 Auto-crafting</Text>
        </View>
      </View>
      <View style={styles.rowBars}>
        <ProgressBar
          progress={progress}
          color={colors.primary}
          backgroundColor={colors.surfaceLight}
          height={4}
        />
      </View>
    </Pressable>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function ActiveSessionCard() {
  const router = useRouter();

  const { activeSkillId, hasCombat, hasAutoCraft } = useGameStore(
    useShallow((state) => ({
      activeSkillId: state.activeSkill,
      hasCombat: !!state.combat.activeCombat,
      hasAutoCraft:
        !!state.crafting.automation.recipeId && state.skills.crafting.automationEnabled,
    }))
  );

  const hasAnything = activeSkillId !== null || hasCombat || hasAutoCraft;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Active Session</Text>
        {hasAnything && <View style={styles.activeDot} />}
      </View>

      {!hasAnything && (
        <Text style={styles.idleText}>Nothing active. Open Skills to start training.</Text>
      )}

      {activeSkillId && (
        <ActiveSkillRow
          skillId={activeSkillId as SkillId}
          onPress={() => router.push('/skills')}
        />
      )}

      {hasCombat && (
        <>
          {(activeSkillId || hasAutoCraft) && <View style={styles.divider} />}
          <ActiveCombatRow onPress={() => router.push('/combat')} />
        </>
      )}

      {hasAutoCraft && (
        <>
          {(activeSkillId || hasCombat) && <View style={styles.divider} />}
          <AutoCraftRow onPress={() => router.push('/crafting')} />
        </>
      )}
    </Card>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.success,
  },
  idleText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    width: 140,
  },
  rowIcon: {
    fontSize: 22,
  },
  rowTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  rowSub: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  rowBars: {
    flex: 1,
    gap: spacing.xs,
    justifyContent: 'center',
  },
  barAction: {
    marginBottom: 2,
  },
  hpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  hpLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    width: 36,
    textAlign: 'right',
  },
  hpBar: {
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceLight,
    marginVertical: spacing.xs,
  },
});
