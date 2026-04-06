import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

import { borderRadius, colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { ProgressBar } from '@/ui/components/common';

import type { BattleSceneModel } from './battle-scene.model';

interface CombatBattleSceneProps {
  scene: BattleSceneModel;
  onFleeCombat: () => void;
}

function formatAttackWindow(nextAttackAt: number, now: number) {
  const remainingMs = Math.max(0, nextAttackAt - now);
  if (remainingMs <= 0) {
    return 'ready';
  }

  return `${(remainingMs / 1000).toFixed(1)}s`;
}

function PlaceholderActor({
  label,
  hpLabel,
  hpProgress,
  variant,
  telegraphState = 'idle',
  icon,
}: {
  label: string;
  hpLabel: string;
  hpProgress: number;
  variant: 'player' | 'enemy' | 'preview';
  telegraphState?: 'idle' | 'charging' | 'imminent';
  icon?: string;
}) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (variant !== 'enemy') {
      pulse.stopAnimation();
      pulse.setValue(1);
      return;
    }

    const targetScale = telegraphState === 'imminent' ? 1.08 : telegraphState === 'charging' ? 1.03 : 1;
    const duration = telegraphState === 'imminent' ? 420 : 900;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: targetScale,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
      pulse.stopAnimation();
    };
  }, [pulse, telegraphState, variant]);

  const actorStyle = useMemo(() => {
    if (variant === 'player') {
      return [styles.actorSquare, styles.playerSquare];
    }

    if (variant === 'preview') {
      return [styles.actorSquare, styles.previewSquare];
    }

    return [
      styles.actorSquare,
      styles.enemySquare,
      telegraphState === 'imminent' ? styles.enemySquareImminent : null,
    ];
  }, [telegraphState, variant]);

  return (
    <View style={styles.actor}>
      <Text style={styles.actorLabel}>{label}</Text>
      <Animated.View style={[actorStyle, variant === 'enemy' ? { transform: [{ scale: pulse }] } : null]}>
        <Text style={styles.actorIcon}>{icon ?? '□'}</Text>
      </Animated.View>
      <Text style={styles.actorHpLabel}>{hpLabel}</Text>
      <ProgressBar
        progress={hpProgress}
        height={10}
        color={variant === 'enemy' ? colors.error : colors.healthBar}
        backgroundColor={colors.surfaceLight}
      />
    </View>
  );
}

export function CombatBattleScene({ scene, onFleeCombat }: CombatBattleSceneProps) {
  const now = Date.now();

  return (
    <View style={styles.content}>
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Kills</Text>
          <Text style={styles.summaryValue}>{scene.summary.totalKills}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Deaths</Text>
          <Text style={styles.summaryValue}>{scene.summary.totalDeaths}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Battle State</Text>
          <Text style={styles.summaryValue}>{scene.state === 'active' ? 'Live' : 'Idle'}</Text>
        </View>
      </View>

      <View style={styles.sceneShell}>
        <View style={styles.sceneTopbar}>
          <Text style={styles.sceneKicker}>
            {scene.state === 'active' ? 'Live Encounter' : 'Battle Lane'}
          </Text>
          <Text style={styles.sceneMeta}>
            {scene.state === 'active'
              ? `You ${formatAttackWindow(scene.player.nextAttackAt, now)} • Enemy ${formatAttackWindow(scene.enemy.nextAttackAt, now)}`
              : 'Start a hunt to populate the lane'}
          </Text>
        </View>

        <View style={styles.battlefield}>
          <View style={styles.backgroundGlow} />
          <View style={styles.groundLine} />

          {scene.state === 'active' ? (
            <>
              <View style={styles.actorRow}>
                <PlaceholderActor
                  label={scene.player.label}
                  hpLabel={`${scene.player.hp.current} / ${scene.player.hp.max} HP`}
                  hpProgress={scene.player.hp.progress}
                  variant="player"
                />

                <View style={styles.castStrip}>
                  <View style={[styles.castTile, styles.castTilePlayer]} />
                  <View style={[styles.castTile, styles.castTileNeutral]} />
                  <View style={[styles.castTile, styles.castTileEnemy]} />
                </View>

                <PlaceholderActor
                  label={scene.enemy.name}
                  hpLabel={`${scene.enemy.hp.current} / ${scene.enemy.hp.max} HP`}
                  hpProgress={scene.enemy.hp.progress}
                  variant="enemy"
                  telegraphState={scene.enemy.telegraphState}
                  icon={scene.enemy.icon}
                />
              </View>

              <View style={styles.previewRow}>
                <PlaceholderActor
                  label="Next Mob"
                  hpLabel="queue preview"
                  hpProgress={0}
                  variant="preview"
                />
              </View>

              <Pressable
                style={({ pressed }) => [styles.fleeButton, pressed && styles.fleeButtonPressed]}
                onPress={onFleeCombat}
              >
                <Text style={styles.fleeButtonText}>Flee</Text>
              </Pressable>
            </>
          ) : (
            <View style={styles.idleState}>
              <View style={styles.idleActors}>
                <PlaceholderActor
                  label="Player"
                  hpLabel="ready"
                  hpProgress={1}
                  variant="player"
                />
                <PlaceholderActor
                  label="Enemy Slot"
                  hpLabel="awaiting hunt"
                  hpProgress={0}
                  variant="preview"
                />
              </View>
              <Text style={styles.idleTitle}>{scene.idleTitle}</Text>
              <Text style={styles.idleCopy}>{scene.idleBody}</Text>
            </View>
          )}
        </View>

        <View style={styles.actionBar}>
          {scene.actionSlots.map((slot) => (
            <View key={slot.id} style={styles.actionTile}>
              <View
                style={[
                  styles.actionIcon,
                  slot.tone === 'attack'
                    ? styles.actionIconAttack
                    : slot.tone === 'defense'
                      ? styles.actionIconDefense
                      : styles.actionIconSupport,
                ]}
              />
              <Text style={styles.actionLabel}>{slot.label}</Text>
              <Text style={styles.actionMeta}>Soon</Text>
            </View>
          ))}
        </View>

        {scene.state === 'active' && scene.bossPrompt ? (
          <View style={styles.promptShell}>
            <Text style={styles.promptTitle}>Boss Prompt</Text>
            <Text style={styles.promptCopy}>A boss decision window will render here later.</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
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
  sceneShell: {
    overflow: 'hidden',
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
  },
  sceneTopbar: {
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceLight,
  },
  sceneKicker: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  sceneMeta: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  battlefield: {
    position: 'relative',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    minHeight: 320,
    gap: spacing.lg,
  },
  backgroundGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primaryDark,
    opacity: 0.12,
  },
  groundLine: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: 104,
    height: 3,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    opacity: 0.45,
  },
  actorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: spacing.md,
    zIndex: 1,
  },
  previewRow: {
    alignItems: 'flex-end',
    zIndex: 1,
  },
  actor: {
    flex: 1,
    gap: spacing.xs,
    maxWidth: 124,
  },
  actorLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  actorSquare: {
    height: 78,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerSquare: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primary,
  },
  enemySquare: {
    backgroundColor: colors.error + '22',
    borderColor: colors.error,
  },
  enemySquareImminent: {
    shadowColor: colors.error,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  previewSquare: {
    backgroundColor: colors.surfaceLight,
    borderColor: colors.textMuted,
    borderStyle: 'dashed',
  },
  actorIcon: {
    fontSize: 28,
    color: colors.text,
  },
  actorHpLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  castStrip: {
    alignSelf: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
    backgroundColor: colors.background,
    flexDirection: 'row',
    gap: spacing.xs,
  },
  castTile: {
    width: 18,
    height: 18,
    borderRadius: 6,
  },
  castTilePlayer: {
    backgroundColor: colors.primary,
  },
  castTileNeutral: {
    backgroundColor: colors.textMuted,
  },
  castTileEnemy: {
    backgroundColor: colors.error,
  },
  idleState: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
  },
  idleActors: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  idleTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  idleCopy: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  fleeButton: {
    alignSelf: 'flex-end',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.error,
    zIndex: 1,
  },
  fleeButtonPressed: {
    opacity: 0.82,
  },
  fleeButtonText: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  actionBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
    backgroundColor: colors.background,
  },
  actionTile: {
    flex: 1,
    minHeight: 72,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
  },
  actionIcon: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
  },
  actionIconAttack: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryDark,
  },
  actionIconDefense: {
    borderColor: colors.healthBar,
    backgroundColor: colors.healthBarBg,
  },
  actionIconSupport: {
    borderColor: colors.textMuted,
    backgroundColor: colors.surfaceLight,
  },
  actionLabel: {
    fontSize: fontSize.xs,
    color: colors.text,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
  },
  actionMeta: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  promptShell: {
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
    backgroundColor: colors.surfaceLight,
  },
  promptTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  promptCopy: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
