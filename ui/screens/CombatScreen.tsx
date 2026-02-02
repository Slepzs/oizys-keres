import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Pressable } from 'react-native';
import { SafeContainer } from '../components/layout/SafeContainer';
import { Card } from '../components/common/Card';
import { CombatStats } from '../components/game/CombatStats';
import { EnemyDisplay } from '../components/game/EnemyDisplay';
import { EquipmentPanel } from '../components/game/EquipmentPanel';
import { CombatZoneCard } from '../components/game/CombatZoneCard';
import { useCombatSummary, useActiveCombat, useEquipment, useCombatActions } from '@/store';
import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { ZONE_IDS } from '@/game/data';
import type { TrainingMode, EquipmentSlot } from '@/game/types';

export function CombatScreen() {
  const combatSummary = useCombatSummary();
  const activeCombat = useActiveCombat();
  const equipment = useEquipment();
  const {
    startCombat,
    fleeCombat,
    setTrainingMode,
    toggleAutoFight,
    unequipSlot,
    selectZone,
  } = useCombatActions();

  const handleTrainingModeChange = (mode: TrainingMode) => {
    setTrainingMode(mode);
  };

  const handleSlotPress = (slot: EquipmentSlot) => {
    // If there's equipment in the slot, unequip it
    if (equipment[slot]) {
      unequipSlot(slot);
    }
  };

  const handleZoneSelect = (zoneId: string) => {
    if (combatSummary.selectedZoneId === zoneId) {
      selectZone(null);
    } else {
      selectZone(zoneId);
    }
  };

  const handleStartCombat = () => {
    if (combatSummary.selectedZoneId) {
      startCombat(combatSummary.selectedZoneId);
    }
  };

  return (
    <SafeContainer padTop={false}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Combat</Text>

        {/* Active Combat Display */}
        {activeCombat && (
          <View style={styles.section}>
            <EnemyDisplay
              enemyId={activeCombat.enemyId}
              enemyCurrentHp={activeCombat.enemyCurrentHp}
              playerCurrentHp={activeCombat.playerCurrentHp}
              playerMaxHp={activeCombat.playerMaxHp}
            />
            <Pressable
              style={({ pressed }) => [
                styles.fleeButton,
                pressed && styles.fleeButtonPressed,
              ]}
              onPress={fleeCombat}
            >
              <Text style={styles.fleeButtonText}>Flee</Text>
            </Pressable>
          </View>
        )}

        {/* Combat Stats */}
        <View style={styles.section}>
          <CombatStats
            combatLevel={combatSummary.combatLevel}
            skills={combatSummary.skills}
            effectiveAttack={combatSummary.effectiveAttack}
            effectiveStrength={combatSummary.effectiveStrength}
            effectiveDefense={combatSummary.effectiveDefense}
            trainingMode={combatSummary.trainingMode}
            onTrainingModeChange={handleTrainingModeChange}
          />
        </View>

        {/* Auto-fight Toggle */}
        <Card style={styles.section}>
          <View style={styles.autoFightRow}>
            <View>
              <Text style={styles.autoFightLabel}>Auto-Fight</Text>
              <Text style={styles.autoFightDescription}>
                Automatically start new fights after kills
              </Text>
            </View>
            <Switch
              value={combatSummary.autoFight}
              onValueChange={toggleAutoFight}
              trackColor={{ false: colors.surfaceLight, true: colors.primaryDark }}
              thumbColor={combatSummary.autoFight ? colors.primary : colors.textMuted}
            />
          </View>
        </Card>

        {/* Stats Summary */}
        <Card style={styles.section}>
          <View style={styles.statsSummary}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{combatSummary.totalKills}</Text>
              <Text style={styles.statLabel}>Kills</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{combatSummary.totalDeaths}</Text>
              <Text style={styles.statLabel}>Deaths</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {combatSummary.totalKills > 0
                  ? (combatSummary.totalKills / Math.max(1, combatSummary.totalDeaths)).toFixed(1)
                  : '0.0'}
              </Text>
              <Text style={styles.statLabel}>K/D</Text>
            </View>
          </View>
        </Card>

        {/* Equipment */}
        <View style={styles.section}>
          <EquipmentPanel equipment={equipment} onSlotPress={handleSlotPress} />
        </View>

        {/* Zone Selection */}
        <Text style={styles.sectionTitle}>Combat Zones</Text>
        <View style={styles.zonesContainer}>
          {ZONE_IDS.map((zoneId) => (
            <CombatZoneCard
              key={zoneId}
              zoneId={zoneId}
              combatLevel={combatSummary.combatLevel}
              isSelected={combatSummary.selectedZoneId === zoneId}
              isInCombat={activeCombat?.zoneId === zoneId}
              onSelect={() => handleZoneSelect(zoneId)}
              onStartCombat={handleStartCombat}
            />
          ))}
        </View>
      </ScrollView>
    </SafeContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginVertical: spacing.md,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  fleeButton: {
    backgroundColor: colors.error,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
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
  autoFightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  autoFightLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  autoFightDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  zonesContainer: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
});
