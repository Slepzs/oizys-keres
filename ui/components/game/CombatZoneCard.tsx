import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '@/constants/theme';
import { ZONE_DEFINITIONS, ENEMY_DEFINITIONS } from '@/game/data';
import type { CombatRouteProjection } from '@/game/logic';
import { formatNumber } from '@/utils/format';

interface CombatZoneCardProps {
  zoneId: string;
  combatLevel: number;
  isSelected: boolean;
  isInCombat: boolean;
  selectedEnemyId: string | null;
  zoneProjection?: CombatRouteProjection | null;
  enemyProjections?: Record<string, CombatRouteProjection>;
  onSelect: () => void;
  onSelectEnemy: (enemyId: string) => void;
  onStartCombat: () => void;
}

const RISK_COLORS: Record<string, string> = {
  safe: 'rgba(74, 222, 128, 0.18)',
  steady: 'rgba(74, 158, 255, 0.18)',
  risky: 'rgba(251, 191, 36, 0.18)',
  lethal: 'rgba(248, 113, 113, 0.18)',
};

const RISK_TEXT_COLORS: Record<string, string> = {
  safe: colors.success,
  steady: colors.primary,
  risky: colors.warning,
  lethal: colors.error,
};

export function CombatZoneCard({
  zoneId,
  combatLevel,
  isSelected,
  isInCombat,
  selectedEnemyId,
  zoneProjection,
  enemyProjections,
  onSelect,
  onSelectEnemy,
  onStartCombat,
}: CombatZoneCardProps) {
  const zone = ZONE_DEFINITIONS[zoneId];
  if (!zone) return null;

  const isLocked = combatLevel < zone.combatLevelRequired;
  const enemies = zone.enemies.map((id) => ENEMY_DEFINITIONS[id]).filter(Boolean);
  const isSelectionEnabled = isSelected && !isLocked && !isInCombat;

  const defaultEnemyId =
    zone.enemies.find((id) => {
      const enemy = ENEMY_DEFINITIONS[id];
      return !!enemy && combatLevel >= enemy.combatLevelRequired;
    }) ?? zone.enemies[0];

  const effectiveSelectedEnemyId =
    (selectedEnemyId && zone.enemies.includes(selectedEnemyId) ? selectedEnemyId : null) ??
    defaultEnemyId;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        isSelected && styles.selected,
        isLocked && styles.locked,
        pressed && !isLocked && styles.pressed,
      ]}
      onPress={isLocked ? undefined : onSelect}
      disabled={isLocked}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{zone.icon}</Text>
        <View style={styles.titleContainer}>
          <Text style={[styles.name, isLocked && styles.lockedText]}>{zone.name}</Text>
          <Text style={[styles.description, isLocked && styles.lockedText]}>
            {zone.description}
          </Text>
        </View>
      </View>

      <View style={styles.info}>
        <Text style={[styles.requirement, isLocked && styles.lockedText]}>
          {isLocked
            ? `Requires Combat Lv. ${zone.combatLevelRequired}`
            : `Combat Lv. ${zone.combatLevelRequired}+`}
        </Text>
        <View style={styles.enemies}>
          {enemies.map((enemy) => (
            <Text key={enemy.id} style={styles.enemyIcon}>
              {enemy.icon}
            </Text>
          ))}
        </View>
      </View>

      {!isLocked && zoneProjection ? (
        <View style={styles.projectionStrip}>
          <View style={styles.projectionStat}>
            <Text style={styles.projectionStatLabel}>XP/min</Text>
            <Text style={styles.projectionStatValue}>
              {formatNumber(zoneProjection.xpPerMinute)}
            </Text>
          </View>
          <View style={styles.projectionStat}>
            <Text style={styles.projectionStatLabel}>🪙/min</Text>
            <Text style={styles.projectionStatValue}>
              {zoneProjection.valuePerMinute < 100
                ? zoneProjection.valuePerMinute.toFixed(1)
                : formatNumber(zoneProjection.valuePerMinute)}
            </Text>
          </View>
          <View
            style={[
              styles.riskBadge,
              { backgroundColor: RISK_COLORS[zoneProjection.risk] ?? RISK_COLORS.lethal },
            ]}
          >
            <Text
              style={[
                styles.riskBadgeText,
                { color: RISK_TEXT_COLORS[zoneProjection.risk] ?? colors.error },
              ]}
            >
              {zoneProjection.risk.toUpperCase()}
            </Text>
          </View>
        </View>
      ) : null}

      {isSelected && (
        <View style={styles.enemyPicker}>
          {enemies.map((enemy) => {
            const enemyLocked = combatLevel < enemy.combatLevelRequired;
            const isEnemySelected = effectiveSelectedEnemyId === enemy.id;
            return (
              <Pressable
                key={enemy.id}
                style={({ pressed }) => [
                  styles.enemyOption,
                  isEnemySelected && styles.enemyOptionSelected,
                  enemyLocked && styles.enemyOptionLocked,
                  pressed && isSelectionEnabled && styles.enemyOptionPressed,
                ]}
                onPress={isSelectionEnabled && !enemyLocked ? () => onSelectEnemy(enemy.id) : undefined}
                disabled={!isSelectionEnabled || enemyLocked}
              >
                <Text style={styles.enemyOptionIcon}>{enemy.icon}</Text>
                <Text style={styles.enemyOptionName}>{enemy.name}</Text>
                <Text style={styles.enemyOptionReq}>
                  Lv {enemy.combatLevelRequired}
                </Text>
                {!enemyLocked && enemyProjections?.[enemy.id] ? (
                  <View style={styles.enemyStats}>
                    <Text style={styles.enemyStat}>
                      {formatNumber(enemyProjections[enemy.id].xpPerMinute)} xp/m
                    </Text>
                    <Text style={styles.enemyStat}>
                      🪙{' '}
                      {enemyProjections[enemy.id].valuePerMinute < 100
                        ? enemyProjections[enemy.id].valuePerMinute.toFixed(1)
                        : formatNumber(enemyProjections[enemy.id].valuePerMinute)}
                      /m
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      )}

      {isSelected && !isInCombat && (
        <Pressable
          style={({ pressed }) => [
            styles.fightButton,
            pressed && styles.fightButtonPressed,
          ]}
          onPress={onStartCombat}
        >
          <Text style={styles.fightButtonText}>Start Combat</Text>
        </Pressable>
      )}

      {isSelected && isInCombat && (
        <View style={styles.inCombatBadge}>
          <Text style={styles.inCombatText}>In Combat</Text>
        </View>
      )}

      {isLocked && (
        <View style={styles.lockOverlay}>
          <Text style={styles.lockIcon}>🔒</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  selected: {
    borderColor: colors.primary,
  },
  locked: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  icon: {
    fontSize: 32,
  },
  titleContainer: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  lockedText: {
    color: colors.textMuted,
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  requirement: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  enemies: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  enemyIcon: {
    fontSize: 20,
  },
  projectionStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
  },
  projectionStat: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  projectionStatLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  projectionStatValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  riskBadge: {
    marginLeft: 'auto',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  riskBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  enemyStats: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
    marginTop: 2,
  },
  enemyStat: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  enemyPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  enemyOption: {
    flexGrow: 1,
    flexBasis: '48%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
    gap: spacing.xs,
  },
  enemyOptionSelected: {
    borderColor: colors.primary,
  },
  enemyOptionLocked: {
    opacity: 0.6,
  },
  enemyOptionPressed: {
    opacity: 0.85,
  },
  enemyOptionIcon: {
    fontSize: 18,
  },
  enemyOptionName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  enemyOptionReq: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  fightButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  fightButtonPressed: {
    backgroundColor: colors.primaryDark,
  },
  fightButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  inCombatBadge: {
    backgroundColor: colors.success,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  inCombatText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  lockOverlay: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  lockIcon: {
    fontSize: 20,
  },
});
