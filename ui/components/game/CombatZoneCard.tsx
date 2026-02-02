import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '@/constants/theme';
import { ZONE_DEFINITIONS, ENEMY_DEFINITIONS } from '@/game/data';

interface CombatZoneCardProps {
  zoneId: string;
  combatLevel: number;
  isSelected: boolean;
  isInCombat: boolean;
  onSelect: () => void;
  onStartCombat: () => void;
}

export function CombatZoneCard({
  zoneId,
  combatLevel,
  isSelected,
  isInCombat,
  onSelect,
  onStartCombat,
}: CombatZoneCardProps) {
  const zone = ZONE_DEFINITIONS[zoneId];
  if (!zone) return null;

  const isLocked = combatLevel < zone.combatLevelRequired;
  const enemies = zone.enemies.map((id) => ENEMY_DEFINITIONS[id]).filter(Boolean);

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
