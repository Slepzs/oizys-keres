import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { borderRadius, colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import type { CombatPlanningFocus, CombatRouteProjection } from '@/game/logic';
import { ZONE_IDS } from '@/game/data';
import { CombatZoneCard } from '@/ui/components/game/CombatZoneCard';
import { Card } from '@/ui/components/common';
import { formatNumber, formatPercent, formatTime } from '@/utils/format';
import { useAllZoneProjections } from '@/store';

interface SelectionSummary {
  id: string;
  icon: string;
  name: string;
  combatLevelRequired: number;
}

const FARM_FOCUS_OPTIONS: Array<{
  id: CombatPlanningFocus;
  label: string;
  description: string;
}> = [
  { id: 'xp', label: 'XP', description: 'Level fastest' },
  { id: 'value', label: 'Coins', description: 'Farm the best loot value' },
  { id: 'safe', label: 'Safe', description: 'Lower sustain pressure' },
];

function getRecommendationLabel(focus: CombatPlanningFocus) {
  switch (focus) {
    case 'value':
      return 'Best Value';
    case 'safe':
      return 'Safest Route';
    case 'xp':
    default:
      return 'Best XP';
  }
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
  routeProjection: CombatRouteProjection | null;
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

function formatProjectionCoins(value: number) {
  if (value >= 100) {
    return formatNumber(value);
  }

  return value.toFixed(1);
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
  routeProjection,
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
  const [farmFocus, setFarmFocus] = React.useState<CombatPlanningFocus>('xp');
  const { zoneProjections, enemyProjections, recommendedRoute, recommendedEnemyByZone } =
    useAllZoneProjections(farmFocus);
  const recommendationLabel = getRecommendationLabel(farmFocus);

  const handleApplyRecommendedRoute = () => {
    if (!recommendedRoute) {
      return;
    }

    if (selectedZoneId !== recommendedRoute.zoneId) {
      onSelectZone(recommendedRoute.zoneId);
    }

    onSelectEnemyForZone(recommendedRoute.zoneId, recommendedRoute.enemyId);
  };

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

        <View style={styles.advisorCard}>
          <View style={styles.advisorHeader}>
            <View style={styles.advisorCopy}>
              <Text style={styles.advisorTitle}>Farm Advisor</Text>
              <Text style={styles.advisorSubtitle}>
                Rank unlocked routes by the goal you care about right now.
              </Text>
            </View>
            <View style={styles.advisorBadge}>
              <Text style={styles.advisorBadgeText}>{recommendationLabel}</Text>
            </View>
          </View>

          <View style={styles.focusRow}>
            {FARM_FOCUS_OPTIONS.map((option) => {
              const isFocusSelected = option.id === farmFocus;
              return (
                <Pressable
                  key={option.id}
                  style={({ pressed }) => [
                    styles.focusChip,
                    isFocusSelected && styles.focusChipSelected,
                    pressed && styles.focusChipPressed,
                  ]}
                  onPress={() => setFarmFocus(option.id)}
                >
                  <Text
                    style={[
                      styles.focusChipLabel,
                      isFocusSelected && styles.focusChipLabelSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  <Text
                    style={[
                      styles.focusChipDescription,
                      isFocusSelected && styles.focusChipDescriptionSelected,
                    ]}
                  >
                    {option.description}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {recommendedRoute ? (
            <View style={styles.recommendationPanel}>
              <View style={styles.recommendationCopy}>
                <Text style={styles.recommendationLabel}>{recommendationLabel}</Text>
                <Text style={styles.recommendationValue}>
                  {recommendedRoute.zoneIcon} {recommendedRoute.zoneName} • {recommendedRoute.projection.enemyName}
                </Text>
                <Text style={styles.recommendationHint}>
                  {formatNumber(recommendedRoute.projection.xpPerMinute)} XP/min • 🪙{' '}
                  {formatProjectionCoins(recommendedRoute.projection.valuePerMinute)}/min •{' '}
                  {recommendedRoute.projection.risk.toUpperCase()}
                </Text>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.recommendationButton,
                  pressed && styles.recommendationButtonPressed,
                ]}
                onPress={handleApplyRecommendedRoute}
              >
                <Text style={styles.recommendationButtonText}>Use Route</Text>
              </Pressable>
            </View>
          ) : null}
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

        <View style={styles.projectionCard}>
          <View style={styles.projectionHeader}>
            <View>
              <Text style={styles.projectionTitle}>Route Projection</Text>
              <Text style={styles.projectionSubtitle}>
                {routeProjection
                  ? `Projected from your current gear, pet, stocked supplies, and expected loot against ${routeProjection.enemyName}.`
                  : 'Pick a target to estimate kill pace, pressure, sustain, and vendor value before starting.'}
              </Text>
            </View>
            {routeProjection ? (
              <View
                style={[
                  styles.riskBadge,
                  routeProjection.risk === 'safe'
                    ? styles.riskSafe
                    : routeProjection.risk === 'steady'
                      ? styles.riskSteady
                      : routeProjection.risk === 'risky'
                        ? styles.riskRisky
                        : styles.riskLethal,
                ]}
              >
                <Text style={styles.riskBadgeText}>{routeProjection.risk.toUpperCase()}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.projectionGrid}>
            <View style={styles.projectionMetric}>
              <Text style={styles.projectionMetricLabel}>Kill Pace</Text>
              <Text style={styles.projectionMetricValue}>
                {routeProjection ? formatTime(routeProjection.timeToKillSeconds * 1000) : '--'}
              </Text>
            </View>
            <View style={styles.projectionMetric}>
              <Text style={styles.projectionMetricLabel}>XP / Min</Text>
              <Text style={styles.projectionMetricValue}>
                {routeProjection ? formatNumber(routeProjection.xpPerMinute) : '--'}
              </Text>
            </View>
            <View style={styles.projectionMetric}>
              <Text style={styles.projectionMetricLabel}>HP Loss / Kill</Text>
              <Text style={styles.projectionMetricValue}>
                {routeProjection ? formatNumber(routeProjection.netDamagePerKill) : '--'}
              </Text>
            </View>
            <View style={styles.projectionMetric}>
              <Text style={styles.projectionMetricLabel}>Sustain</Text>
              <Text style={styles.projectionMetricValue}>
                {routeProjection
                  ? routeProjection.killsBeforeRestock === null
                    ? 'No food needed'
                    : routeProjection.killsBeforeRestock <= 0
                      ? 'Restock now'
                      : `~${formatNumber(routeProjection.killsBeforeRestock)} kills`
                  : '--'}
              </Text>
            </View>
            <View style={styles.projectionMetric}>
              <Text style={styles.projectionMetricLabel}>Value / Kill</Text>
              <Text style={styles.projectionMetricValue}>
                {routeProjection ? `🪙 ${formatProjectionCoins(routeProjection.totalValuePerKill)}` : '--'}
              </Text>
            </View>
            <View style={styles.projectionMetric}>
              <Text style={styles.projectionMetricLabel}>Value / Min</Text>
              <Text style={styles.projectionMetricValue}>
                {routeProjection ? `🪙 ${formatProjectionCoins(routeProjection.valuePerMinute)}` : '--'}
              </Text>
            </View>
          </View>

          {routeProjection ? (
            <>
              <Text style={styles.projectionNote}>
                {routeProjection.killsBeforeRestock === null
                  ? 'Passive regen and pet sustain cover this route without consuming stocked food.'
                  : routeProjection.totalFoodCount <= 0
                    ? 'No food is stocked for this route. Queue Cooking before leaving this on auto-fight.'
                    : `Current stock covers about ${formatNumber(routeProjection.foodPerKill ?? 0)} food per kill across ${formatNumber(routeProjection.totalFoodCount)} prepared meals.`}
              </Text>
              {routeProjection.notableDrops.length > 0 ? (
                <View style={styles.notableDropsSection}>
                  <Text style={styles.notableDropsTitle}>Top Drops</Text>
                  <View style={styles.notableDropsGrid}>
                    {routeProjection.notableDrops.map((drop) => (
                      <View key={drop.itemId} style={styles.notableDropChip}>
                        <Text style={styles.notableDropName}>
                          {drop.icon} {drop.name}
                        </Text>
                        <Text style={styles.notableDropMeta}>
                          {formatPercent(drop.chance, 0)} • 🪙 {formatProjectionCoins(drop.expectedValuePerKill)}/kill
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}
            </>
          ) : null}
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
            zoneProjection={zoneProjections[zoneId] ?? null}
            enemyProjections={enemyProjections}
            isRecommended={recommendedRoute?.zoneId === zoneId}
            recommendationLabel={recommendationLabel}
            recommendedEnemyId={recommendedEnemyByZone[zoneId] ?? null}
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
  advisorCard: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
    gap: spacing.md,
  },
  advisorHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  advisorCopy: {
    flex: 1,
  },
  advisorTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  advisorSubtitle: {
    marginTop: spacing.xs,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  advisorBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(251, 191, 36, 0.18)',
  },
  advisorBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.warning,
    textTransform: 'uppercase',
  },
  focusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  focusChip: {
    flexGrow: 1,
    flexBasis: '30%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.surface,
    backgroundColor: colors.surface,
    gap: 2,
  },
  focusChipSelected: {
    borderColor: colors.warning,
    backgroundColor: 'rgba(251, 191, 36, 0.12)',
  },
  focusChipPressed: {
    opacity: 0.85,
  },
  focusChipLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  focusChipLabelSelected: {
    color: colors.warning,
  },
  focusChipDescription: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  focusChipDescriptionSelected: {
    color: colors.text,
  },
  recommendationPanel: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
  },
  recommendationCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  recommendationLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  recommendationValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  recommendationHint: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  recommendationButton: {
    backgroundColor: colors.warning,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  recommendationButtonPressed: {
    opacity: 0.85,
  },
  recommendationButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.background,
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
  projectionCard: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceLight,
    gap: spacing.md,
  },
  projectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  projectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  projectionSubtitle: {
    marginTop: spacing.xs,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  riskBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  riskSafe: {
    backgroundColor: 'rgba(74, 222, 128, 0.18)',
  },
  riskSteady: {
    backgroundColor: 'rgba(74, 158, 255, 0.18)',
  },
  riskRisky: {
    backgroundColor: 'rgba(251, 191, 36, 0.18)',
  },
  riskLethal: {
    backgroundColor: 'rgba(248, 113, 113, 0.18)',
  },
  riskBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.text,
    textTransform: 'uppercase',
  },
  projectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  projectionMetric: {
    flexGrow: 1,
    flexBasis: '48%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  projectionMetricLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  projectionMetricValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  projectionNote: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  notableDropsSection: {
    gap: spacing.sm,
  },
  notableDropsTitle: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  notableDropsGrid: {
    gap: spacing.sm,
  },
  notableDropChip: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  notableDropName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  notableDropMeta: {
    fontSize: fontSize.xs,
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
