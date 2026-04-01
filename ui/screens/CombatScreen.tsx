import React, { useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Pressable } from 'react-native';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { SafeContainer } from '../components/layout/SafeContainer';
import { Card } from '../components/common/Card';
import { CombatStats } from '../components/game/CombatStats';
import { CombatPetCard } from '../components/game/CombatPetCard';
import { EnemyDisplay } from '../components/game/EnemyDisplay';
import { EquipmentPanel } from '../components/game/EquipmentPanel';
import { CombatZoneCard } from '../components/game/CombatZoneCard';
import {
  useCombatSummary,
  useActiveCombat,
  useEquipment,
  useCombatActions,
  useBagFood,
  useBagPotions,
} from '@/store';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '@/constants/theme';
import { ZONE_IDS } from '@/game/data';
import type { TrainingMode, EquipmentSlot } from '@/game/types';

const AUTO_EAT_THRESHOLDS = [0.25, 0.5, 0.75] as const;

export function CombatScreen() {
  const combatSummary = useCombatSummary();
  const activeCombat = useActiveCombat();
  const equipment = useEquipment();
  const {
    startCombat,
    fleeCombat,
    setTrainingMode,
    toggleAutoFight,
    toggleAutoEat,
    toggleAutoDrink,
    setAutoEatThreshold,
    unequipSlot,
    selectZone,
    selectEnemyForZone,
    eatFood,
    drinkPotion,
  } = useCombatActions();
  const bagFood = useBagFood();
  const bagPotions = useBagPotions();
  const suppliesSheetRef = useRef<BottomSheetModal>(null);
  const equipmentSheetRef = useRef<BottomSheetModal>(null);
  const autoEatThresholdPercent = Math.round(combatSummary.autoEatThreshold * 100);
  const sheetSnapPoints = useMemo(() => ['60%', '88%'], []);
  const totalFoodCount = useMemo(
    () => bagFood.reduce((sum, item) => sum + item.quantity, 0),
    [bagFood]
  );
  const totalPotionCount = useMemo(
    () => bagPotions.reduce((sum, item) => sum + item.quantity, 0),
    [bagPotions]
  );
  const kdRatio = useMemo(() => {
    if (combatSummary.totalKills <= 0) {
      return '0.0';
    }

    return (combatSummary.totalKills / Math.max(1, combatSummary.totalDeaths)).toFixed(1);
  }, [combatSummary.totalDeaths, combatSummary.totalKills]);

  const handleTrainingModeChange = (mode: TrainingMode) => {
    setTrainingMode(mode);
  };

  const handleSlotPress = (slot: EquipmentSlot) => {
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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.title}>Combat</Text>

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

        <Card style={styles.section}>
          <View style={styles.setupHeader}>
            <View style={styles.setupCopy}>
              <Text style={styles.cardTitle}>Combat Setup</Text>
              <Text style={styles.cardSubtitle}>
                Keep supplies and gear tucked away until you need them.
              </Text>
            </View>
            <View style={styles.autoFightToggle}>
              <Text style={styles.toggleLabel}>Auto-Fight</Text>
              <Switch
                value={combatSummary.autoFight}
                onValueChange={toggleAutoFight}
                trackColor={{ false: colors.surfaceLight, true: colors.primaryDark }}
                thumbColor={combatSummary.autoFight ? colors.primary : colors.textMuted}
              />
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
              <Text style={styles.summaryValue}>
                {combatSummary.autoEat ? `${autoEatThresholdPercent}%` : 'Off'}
              </Text>
            </View>
            <View style={styles.summaryChip}>
              <Text style={styles.summaryLabel}>Auto-Drink</Text>
              <Text style={styles.summaryValue}>{combatSummary.autoDrink ? 'On' : 'Off'}</Text>
            </View>
            <View style={styles.summaryChip}>
              <Text style={styles.summaryLabel}>Kills</Text>
              <Text style={styles.summaryValue}>{combatSummary.totalKills}</Text>
            </View>
            <View style={styles.summaryChip}>
              <Text style={styles.summaryLabel}>K/D</Text>
              <Text style={styles.summaryValue}>{kdRatio}</Text>
            </View>
          </View>

          <View style={styles.manageActions}>
            <Pressable
              style={({ pressed }) => [
                styles.manageButton,
                pressed && styles.manageButtonPressed,
              ]}
              onPress={() => suppliesSheetRef.current?.present()}
            >
              <Text style={styles.manageButtonLabel}>Supplies</Text>
              <Text style={styles.manageButtonHint}>Food, potions, automation</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.manageButton,
                pressed && styles.manageButtonPressed,
              ]}
              onPress={() => equipmentSheetRef.current?.present()}
            >
              <Text style={styles.manageButtonLabel}>Equipment</Text>
              <Text style={styles.manageButtonHint}>Manage your loadout</Text>
            </Pressable>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Combat Zones</Text>
        <View style={styles.zonesContainer}>
          {ZONE_IDS.map((zoneId) => (
            <CombatZoneCard
              key={zoneId}
              zoneId={zoneId}
              combatLevel={combatSummary.combatLevel}
              isSelected={combatSummary.selectedZoneId === zoneId}
              isInCombat={activeCombat?.zoneId === zoneId}
              selectedEnemyId={combatSummary.selectedEnemyByZone?.[zoneId] ?? null}
              onSelect={() => handleZoneSelect(zoneId)}
              onSelectEnemy={(enemyId) => selectEnemyForZone(zoneId, enemyId)}
              onStartCombat={handleStartCombat}
            />
          ))}
        </View>

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

        {combatSummary.activePet && (
          <View style={styles.section}>
            <CombatPetCard pet={combatSummary.activePet} bonuses={combatSummary.petBonuses} />
          </View>
        )}
      </ScrollView>

      <BottomSheetModal
        ref={suppliesSheetRef}
        index={0}
        snapPoints={sheetSnapPoints}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.sheetHandle}
      >
        <BottomSheetScrollView
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sheetTitle}>Supplies</Text>
          <Text style={styles.sheetSubtitle}>
            Manual consumables and automation settings for longer runs.
          </Text>

          <View style={styles.sheetBlock}>
            <View style={styles.autoRow}>
              <View style={styles.autoCopy}>
                <Text style={styles.autoLabel}>Auto-Eat</Text>
                <Text style={styles.autoDescription}>
                  Automatically eat when HP drops below {autoEatThresholdPercent}%.
                </Text>
              </View>
              <Switch
                value={combatSummary.autoEat}
                onValueChange={toggleAutoEat}
                trackColor={{ false: colors.surfaceLight, true: colors.primaryDark }}
                thumbColor={combatSummary.autoEat ? colors.primary : colors.textMuted}
              />
            </View>

            <View style={styles.thresholdRow}>
              {AUTO_EAT_THRESHOLDS.map((threshold) => {
                const isSelected = combatSummary.autoEatThreshold === threshold;
                return (
                  <Pressable
                    key={threshold}
                    style={({ pressed }) => [
                      styles.thresholdButton,
                      isSelected && styles.thresholdButtonSelected,
                      pressed && styles.thresholdButtonPressed,
                    ]}
                    onPress={() => setAutoEatThreshold(threshold)}
                  >
                    <Text
                      style={[
                        styles.thresholdButtonText,
                        isSelected && styles.thresholdButtonTextSelected,
                      ]}
                    >
                      {Math.round(threshold * 100)}%
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.sheetBlock}>
            <View style={styles.autoRow}>
              <View style={styles.autoCopy}>
                <Text style={styles.autoLabel}>Auto-Drink</Text>
                <Text style={styles.autoDescription}>
                  Automatically drink potions when entering combat.
                </Text>
              </View>
              <Switch
                value={combatSummary.autoDrink}
                onValueChange={toggleAutoDrink}
                trackColor={{ false: colors.surfaceLight, true: colors.primaryDark }}
                thumbColor={combatSummary.autoDrink ? colors.primary : colors.textMuted}
              />
            </View>
          </View>

          {combatSummary.potionBuffs.length > 0 && (
            <View style={styles.sheetBlock}>
              <Text style={styles.sheetSectionTitle}>Active Buffs</Text>
              <View style={styles.activeBuffsRow}>
                {combatSummary.potionBuffs.map((buff) => {
                  const remaining = Math.max(0, buff.expiresAt - Date.now());
                  const minutes = Math.floor(remaining / 60000);
                  const seconds = Math.floor((remaining % 60000) / 1000);
                  return (
                    <View key={buff.buffType} style={styles.activeBuff}>
                      <Text style={styles.activeBuffText}>
                        +{buff.value} {buff.buffType}
                      </Text>
                      <Text style={styles.activeBuffTimer}>
                        {minutes}:{seconds.toString().padStart(2, '0')}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          <View style={styles.sheetBlock}>
            <Text style={styles.sheetSectionTitle}>Food</Text>
            <Text style={styles.sheetSectionSubtitle}>
              Manual healing for emergencies and long idle sessions.
            </Text>
            {bagFood.length > 0 ? (
              <View style={styles.itemList}>
                {bagFood.map((food) => (
                  <View key={food.itemId} style={styles.itemRow}>
                    <Text style={styles.itemIcon}>{food.icon}</Text>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{food.name}</Text>
                      <Text style={styles.itemMeta}>+{food.healAmount} HP</Text>
                    </View>
                    <Text style={styles.itemQty}>x{food.quantity}</Text>
                    <Pressable
                      style={({ pressed }) => [
                        styles.useButton,
                        pressed && styles.useButtonPressed,
                      ]}
                      onPress={() => eatFood(food.itemId)}
                    >
                      <Text style={styles.useButtonText}>Eat</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyStateText}>
                No cooked food stocked. Train Cooking to prepare food for combat.
              </Text>
            )}
          </View>

          <View style={styles.sheetBlock}>
            <Text style={styles.sheetSectionTitle}>Potions</Text>
            <Text style={styles.sheetSectionSubtitle}>
              Herblore buffs for stronger combat loops.
            </Text>
            {bagPotions.length > 0 ? (
              <View style={styles.itemList}>
                {bagPotions.map((potion) => (
                  <View key={potion.itemId} style={styles.itemRow}>
                    <Text style={styles.itemIcon}>{potion.icon}</Text>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{potion.name}</Text>
                      <Text style={styles.itemMeta}>
                        +{potion.buffValue} {potion.buffType}
                      </Text>
                    </View>
                    <Text style={styles.itemQty}>x{potion.quantity}</Text>
                    <Pressable
                      style={({ pressed }) => [
                        styles.useButton,
                        pressed && styles.useButtonPressed,
                      ]}
                      onPress={() => drinkPotion(potion.itemId)}
                    >
                      <Text style={styles.useButtonText}>Drink</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyStateText}>
                No potions in bag. Train Herblore to brew potions.
              </Text>
            )}
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>

      <BottomSheetModal
        ref={equipmentSheetRef}
        index={0}
        snapPoints={sheetSnapPoints}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.sheetHandle}
      >
        <BottomSheetScrollView
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sheetTitle}>Equipment</Text>
          <Text style={styles.sheetSubtitle}>
            Tap any equipped slot to unequip it and keep your setup lean.
          </Text>

          <View style={styles.sheetBlock}>
            <EquipmentPanel equipment={equipment} onSlotPress={handleSlotPress} />
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    </SafeContainer>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: spacing.xl,
  },
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
    marginBottom: spacing.md,
  },
  sheetBackground: {
    backgroundColor: colors.surface,
  },
  sheetHandle: {
    backgroundColor: colors.textMuted,
  },
  sheetContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  sheetTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  sheetSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  sheetBlock: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  sheetSectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  sheetSectionSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  autoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  autoCopy: {
    flex: 1,
  },
  autoLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  autoDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  thresholdRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  thresholdButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surface,
  },
  thresholdButtonSelected: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primary,
  },
  thresholdButtonPressed: {
    opacity: 0.85,
  },
  thresholdButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  thresholdButtonTextSelected: {
    color: colors.text,
  },
  activeBuffsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  activeBuff: {
    backgroundColor: colors.primaryDark,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: 'center',
  },
  activeBuffText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    textTransform: 'capitalize',
  },
  activeBuffTimer: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemList: {
    gap: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.surface,
  },
  itemIcon: {
    fontSize: 24,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  itemMeta: {
    fontSize: fontSize.xs,
    color: colors.success,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  itemQty: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  useButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  useButtonPressed: {
    opacity: 0.8,
  },
  useButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  emptyStateText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
