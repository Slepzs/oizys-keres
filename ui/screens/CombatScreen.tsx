import React, { useMemo, useRef } from 'react';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { ENEMY_DEFINITIONS, ZONE_DEFINITIONS } from '@/game/data';
import { scaleAttackIntervalSeconds } from '@/game/logic/combat/balance';
import type { EquipmentSlot, TrainingMode } from '@/game/types';
import {
  useActiveCombat,
  useBagFood,
  useBagPotions,
  useCombatActions,
  useCombatFeedback,
  useCombatSummary,
  useEquipment,
} from '@/store';
import { borderRadius, colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { EquipmentPanel } from '@/ui/components/game/EquipmentPanel';
import { SafeContainer } from '@/ui/components/layout/SafeContainer';

import { CombatBattleView } from './combat/CombatBattleView';
import { CombatHuntView } from './combat/CombatHuntView';
import { CombatProfileView } from './combat/CombatProfileView';
import { CombatScreenTabs } from './combat/CombatScreenTabs';
import { useCombatScreenView } from './combat/useCombatScreenView';

const AUTO_EAT_THRESHOLDS = [0.25, 0.5, 0.75] as const;

export function CombatScreen() {
  const combatSummary = useCombatSummary();
  const activeCombat = useActiveCombat();
  const combatFeedback = useCombatFeedback();
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
  const { activeView, setActiveView, views } = useCombatScreenView(!!activeCombat);
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
  const selectedZone = useMemo(() => {
    if (!combatSummary.selectedZoneId) {
      return null;
    }

    return ZONE_DEFINITIONS[combatSummary.selectedZoneId] ?? null;
  }, [combatSummary.selectedZoneId]);
  const selectedEnemy = useMemo(() => {
    if (!selectedZone) {
      return null;
    }

    const preferredEnemyId = combatSummary.selectedEnemyByZone?.[selectedZone.id];
    const unlockedEnemyId =
      selectedZone.enemies.find((enemyId) => {
        const enemy = ENEMY_DEFINITIONS[enemyId];
        return !!enemy && combatSummary.combatLevel >= enemy.combatLevelRequired;
      }) ?? selectedZone.enemies[0];
    const effectiveEnemyId =
      preferredEnemyId && selectedZone.enemies.includes(preferredEnemyId)
        ? preferredEnemyId
        : unlockedEnemyId;

    return effectiveEnemyId ? ENEMY_DEFINITIONS[effectiveEnemyId] ?? null : null;
  }, [combatSummary.combatLevel, combatSummary.selectedEnemyByZone, selectedZone]);
  const activeEnemy = activeCombat ? ENEMY_DEFINITIONS[activeCombat.enemyId] : null;

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
        <CombatScreenTabs
          activeView={activeView}
          views={views}
          onChange={setActiveView}
        />

        {activeView === 'combat-profile' ? (
          <CombatProfileView
            combatLevel={combatSummary.combatLevel}
            skills={combatSummary.skills}
            effectiveAttack={combatSummary.effectiveAttack}
            effectiveStrength={combatSummary.effectiveStrength}
            effectiveDefense={combatSummary.effectiveDefense}
            trainingMode={combatSummary.trainingMode}
            onTrainingModeChange={handleTrainingModeChange}
            activePet={combatSummary.activePet}
            petBonuses={combatSummary.petBonuses}
          />
        ) : null}

        {activeView === 'hunt-setup' ? (
          <CombatHuntView
            autoFight={combatSummary.autoFight}
            autoEat={combatSummary.autoEat}
            autoDrink={combatSummary.autoDrink}
            autoEatThresholdPercent={autoEatThresholdPercent}
            combatLevel={combatSummary.combatLevel}
            totalFoodCount={totalFoodCount}
            totalPotionCount={totalPotionCount}
            selectedZone={selectedZone}
            selectedEnemy={selectedEnemy}
            selectedZoneId={combatSummary.selectedZoneId}
            selectedEnemyByZone={combatSummary.selectedEnemyByZone}
            activeCombatZoneId={activeCombat?.zoneId ?? null}
            onToggleAutoFight={toggleAutoFight}
            onOpenSupplies={() => suppliesSheetRef.current?.present()}
            onOpenEquipment={() => equipmentSheetRef.current?.present()}
            onSelectZone={handleZoneSelect}
            onSelectEnemyForZone={selectEnemyForZone}
            onStartCombat={handleStartCombat}
          />
        ) : null}

        {activeView === 'battle-feed' ? (
          <CombatBattleView
            totalKills={combatSummary.totalKills}
            kdRatio={kdRatio}
            activeCombat={activeCombat}
            activeEnemyName={activeEnemy?.name ?? null}
            playerAttackIntervalSeconds={combatSummary.attackSpeed}
            enemyAttackIntervalSeconds={
              activeEnemy ? scaleAttackIntervalSeconds(activeEnemy.attackSpeed) : null
            }
            petAttackIntervalSeconds={combatSummary.activePet?.attackIntervalSeconds ?? null}
            onFleeCombat={fleeCombat}
            entries={combatFeedback.entries}
            killsThisSession={combatFeedback.killsThisSession}
          />
        ) : null}
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

          {combatSummary.potionBuffs.length > 0 ? (
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
          ) : null}

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
                      style={({ pressed }) => [styles.useButton, pressed && styles.useButtonPressed]}
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
                      style={({ pressed }) => [styles.useButton, pressed && styles.useButtonPressed]}
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
