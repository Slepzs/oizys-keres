import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { borderRadius, colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { ZONE_IDS } from '@/game/data';
import { CombatZoneCard } from '@/ui/components/game/CombatZoneCard';
import { Card } from '@/ui/components/common';

interface SelectionSummary {
  id: string;
  icon: string;
  name: string;
  combatLevelRequired: number;
}

interface CombatHuntViewProps {
  autoFight: boolean;
  autoEat: boolean;
  autoDrink: boolean;
  autoEatThresholdPercent: number;
  combatLevel: number;
  totalFoodCount: number;
  totalPotionCount: number;
  selectedZone: SelectionSummary | null;
  selectedEnemy: SelectionSummary | null;
  selectedZoneId: string | null;
  selectedEnemyByZone: Record<string, string> | null | undefined;
  activeCombatZoneId: string | null;
  onToggleAutoFight: (value: boolean) => void;
  onOpenSupplies: () => void;
  onOpenEquipment: () => void;
  onSelectZone: (zoneId: string) => void;
  onSelectEnemyForZone: (zoneId: string, enemyId: string) => void;
  onStartCombat: () => void;
}

export function CombatHuntView({
  autoFight,
  autoEat,
  autoDrink,
  autoEatThresholdPercent,
  combatLevel,
  totalFoodCount,
  totalPotionCount,
  selectedZone,
  selectedEnemy,
  selectedZoneId,
  selectedEnemyByZone,
  activeCombatZoneId,
  onToggleAutoFight,
  onOpenSupplies,
  onOpenEquipment,
  onSelectZone,
  onSelectEnemyForZone,
  onStartCombat,
}: CombatHuntViewProps) {
  const isInCombat = activeCombatZoneId !== null;

  return (
    <View style={styles.content}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionKicker}>Plan The Run</Text>
        <Text style={styles.sectionTitle}>Hunt Setup</Text>
        <Text style={styles.sectionSubtitle}>
          Pick the route, target, and sustain loop before you drop into battle.
        </Text>
      </View>

      <Card style={styles.section}>
        <View style={styles.setupHeader}>
          <View style={styles.setupCopy}>
            <Text style={styles.cardTitle}>Preparation</Text>
            <Text style={styles.cardSubtitle}>
              {isInCombat
                ? 'The current encounter stays in Battle so setup decisions remain readable.'
                : 'Choose where to farm next and queue the support tools you need.'}
            </Text>
          </View>
          <View style={styles.autoFightToggle}>
            <Text style={styles.toggleLabel}>Auto-Fight</Text>
            <Switch
              value={autoFight}
              onValueChange={onToggleAutoFight}
              trackColor={{ false: colors.surfaceLight, true: colors.primaryDark }}
              thumbColor={autoFight ? colors.primary : colors.textMuted}
            />
          </View>
        </View>

        <View style={styles.selectionGrid}>
          <View style={styles.selectionCard}>
            <Text style={styles.selectionLabel}>Selected Zone</Text>
            <Text style={styles.selectionValue}>
              {selectedZone ? `${selectedZone.icon} ${selectedZone.name}` : 'None'}
            </Text>
            <Text style={styles.selectionHint}>
              {selectedZone
                ? `Requires Combat Lv. ${selectedZone.combatLevelRequired}`
                : 'Choose a zone below to unlock enemy targeting.'}
            </Text>
          </View>
          <View style={styles.selectionCard}>
            <Text style={styles.selectionLabel}>Target</Text>
            <Text style={styles.selectionValue}>
              {selectedEnemy ? `${selectedEnemy.icon} ${selectedEnemy.name}` : 'No mob selected'}
            </Text>
            <Text style={styles.selectionHint}>
              {selectedEnemy
                ? `Enemy unlocks at Combat Lv. ${selectedEnemy.combatLevelRequired}`
                : 'Select a zone to choose which enemy should be farmed there.'}
            </Text>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryChip}>
            <Text style={styles.summaryLabel}>Food</Text>
            <Text style={styles.summaryValue}>{totalFoodCount}</Text>
          </View>
          <View style={styles.summaryChip}>
            <Text style={styles.summaryLabel}>Potions</Text>
            <Text style={styles.summaryValue}>{totalPotionCount}</Text>
          </View>
          <View style={styles.summaryChip}>
            <Text style={styles.summaryLabel}>Auto-Eat</Text>
            <Text style={styles.summaryValue}>{autoEat ? `${autoEatThresholdPercent}%` : 'Off'}</Text>
          </View>
          <View style={styles.summaryChip}>
            <Text style={styles.summaryLabel}>Auto-Drink</Text>
            <Text style={styles.summaryValue}>{autoDrink ? 'On' : 'Off'}</Text>
          </View>
        </View>

        <View style={styles.manageActions}>
          <Pressable
            style={({ pressed }) => [
              styles.manageButton,
              pressed && styles.manageButtonPressed,
            ]}
            onPress={onOpenSupplies}
          >
            <Text style={styles.manageButtonLabel}>Supplies</Text>
            <Text style={styles.manageButtonHint}>Food, potions, automation</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.manageButton,
              pressed && styles.manageButtonPressed,
            ]}
            onPress={onOpenEquipment}
          >
            <Text style={styles.manageButtonLabel}>Equipment</Text>
            <Text style={styles.manageButtonHint}>Manage your loadout</Text>
          </Pressable>
        </View>
      </Card>

      <View style={styles.zonesContainer}>
        {ZONE_IDS.map((zoneId) => (
          <CombatZoneCard
            key={zoneId}
            zoneId={zoneId}
            combatLevel={combatLevel}
            isSelected={selectedZoneId === zoneId}
            isInCombat={activeCombatZoneId === zoneId}
            selectedEnemyId={selectedEnemyByZone?.[zoneId] ?? null}
            onSelect={() => onSelectZone(zoneId)}
            onSelectEnemy={(enemyId) => onSelectEnemyForZone(zoneId, enemyId)}
            onStartCombat={onStartCombat}
          />
        ))}
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
  setupHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  setupCopy: {
    flex: 1,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  cardSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  autoFightToggle: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  toggleLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  selectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  selectionCard: {
    flexGrow: 1,
    flexBasis: '48%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  selectionLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  selectionValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  selectionHint: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  summaryChip: {
    minWidth: '30%',
    flexGrow: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
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
    marginTop: spacing.xs,
  },
  manageActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  manageButton: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
  },
  manageButtonPressed: {
    opacity: 0.85,
  },
  manageButtonLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  manageButtonHint: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  zonesContainer: {
    gap: spacing.md,
  },
});
