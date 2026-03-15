import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { SafeContainer } from '../components/layout/SafeContainer';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { RpgIcon } from '../components/common/RpgIcon';
import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import {
  CRAFTING_CATEGORIES,
  CRAFTING_RECIPE_IDS,
  CRAFTING_RECIPES,
  INFRASTRUCTURE_DEFINITIONS,
  ITEM_DEFINITIONS,
  RESOURCE_DEFINITIONS,
  SKILL_DEFINITIONS,
  skillSpeedMultiplier,
} from '@/game/data';
import { countItemInBag, getCraftingRecipeStatus } from '@/game/logic';
import type {
  BagState,
  CraftingCategory,
  CraftingCost,
  CraftingRecipe,
  CraftingRequirement,
  InfrastructureLevelsState,
  ResourceId,
  ResourcesState,
  SkillsState,
} from '@/game/types';
import { useGameStore } from '@/store';

const KEY_ORE_RESOURCE_IDS = new Set<ResourceId>([
  'copper_ore',
  'iron_ore',
  'coal',
  'mithril_ore',
  'adamantite_ore',
]);

const CATEGORY_META: Record<CraftingCategory, { label: string; icon: string; fallback: string }> = {
  tools: { label: 'Tools', icon: 'axe', fallback: '🪓' },
  infrastructure: { label: 'Infrastructure', icon: 'anvil', fallback: '🏗️' },
  weapons: { label: 'Weapons', icon: 'broadsword', fallback: '⚔️' },
  armor: { label: 'Armor', icon: 'helmet', fallback: '🛡️' },
};

export function CraftingScreen() {
  const [activeCategory, setActiveCategory] = useState<CraftingCategory>('tools');

  const { skills, resources, bag, crafting } = useGameStore(
    useShallow((state) => ({
      skills: state.skills,
      resources: state.resources,
      bag: state.bag,
      crafting: state.crafting,
    }))
  );

  const craftRecipe = useGameStore((state) => state.craftRecipe);
  const setAutoCraftRecipe = useGameStore((state) => state.setAutoCraftRecipe);
  const clearAutoCraftRecipe = useGameStore((state) => state.clearAutoCraftRecipe);

  const recipeList = useMemo(() => {
    return CRAFTING_RECIPE_IDS
      .map((recipeId) => CRAFTING_RECIPES[recipeId])
      .filter((recipe) => recipe.category === activeCategory);
  }, [activeCategory]);

  const builtInfrastructureCount = useMemo(() => {
    return Object.values(crafting.infrastructureLevels).filter((level) => level > 0).length;
  }, [crafting.infrastructureLevels]);
  const totalInfrastructureCount = useMemo(() => {
    return Object.keys(INFRASTRUCTURE_DEFINITIONS).length;
  }, []);

  const activeBonuses = useMemo(() => {
    const bonuses: { infrastructureName: string; label: string; value: string }[] = [];
    for (const infra of Object.values(INFRASTRUCTURE_DEFINITIONS)) {
      const level = crafting.infrastructureLevels[infra.id] ?? 0;
      if (level <= 0) {
        continue;
      }
      for (const bonus of infra.bonuses) {
        bonuses.push({
          infrastructureName: infra.name,
          label: formatBonusTarget(bonus.target),
          value: bonus.type === 'additive'
            ? `+${Math.round(bonus.value * 100)}%`
            : `${bonus.value.toFixed(2)}x`,
        });
      }
    }
    return bonuses;
  }, [crafting.infrastructureLevels]);

  const craftingState = useMemo(
    () => ({ skills, resources, bag, crafting }),
    [skills, resources, bag, crafting]
  );

  const upcomingGoals = useMemo(() => {
    const { skills: s, resources: r, crafting: c } = craftingState;

    const results: {
      recipe: CraftingRecipe;
      totalSkillGap: number;
      hasInfraBlocker: boolean;
      keyBlocker: string;
      oreCosts: { name: string; current: number; required: number }[];
    }[] = [];

    for (const recipeId of CRAFTING_RECIPE_IDS) {
      const recipe = CRAFTING_RECIPES[recipeId];
      if (recipe.category === 'infrastructure') continue;

      const status = getCraftingRecipeStatus(craftingState, recipeId);
      if (status.unlocked || status.atInfrastructureCap) continue;

      let totalSkillGap = 0;
      let keyBlocker = '';
      let keyBlockerGap = -1;
      let hasInfraBlocker = false;

      for (const req of recipe.requirements) {
        if (req.type === 'skill_level') {
          const current = s[req.skillId]?.level ?? 0;
          const gap = Math.max(0, req.level - current);
          totalSkillGap += gap;
          if (gap > keyBlockerGap) {
            keyBlockerGap = gap;
            keyBlocker = `${SKILL_DEFINITIONS[req.skillId].name} ${current}\u2192${req.level}`;
          }
        } else {
          const current = c.infrastructureLevels[req.infrastructureId] ?? 0;
          if (current < req.level) {
            hasInfraBlocker = true;
            if (keyBlocker === '') {
              keyBlocker = `Build ${INFRASTRUCTURE_DEFINITIONS[req.infrastructureId].name}`;
            }
          }
        }
      }

      const oreCosts: { name: string; current: number; required: number }[] = [];
      for (const cost of recipe.costs) {
        if (cost.type !== 'resource') continue;
        if (!KEY_ORE_RESOURCE_IDS.has(cost.resourceId)) continue;
        oreCosts.push({
          name: RESOURCE_DEFINITIONS[cost.resourceId].name,
          current: r[cost.resourceId]?.amount ?? 0,
          required: cost.amount,
        });
      }

      results.push({ recipe, totalSkillGap, hasInfraBlocker, keyBlocker, oreCosts });
    }

    return results
      .sort((a, b) => {
        if (a.hasInfraBlocker !== b.hasInfraBlocker) return a.hasInfraBlocker ? 1 : -1;
        return a.totalSkillGap - b.totalSkillGap;
      })
      .slice(0, 3);
  }, [craftingState]);
  const autoRecipe = useMemo(() => {
    const recipeId = crafting.automation.recipeId;
    if (!recipeId) {
      return null;
    }

    return CRAFTING_RECIPES[recipeId] ?? null;
  }, [crafting.automation.recipeId]);
  const autoProgress = useMemo(() => {
    const craftingSkill = skills.crafting;
    if (!crafting.automation.recipeId || !craftingSkill.automationEnabled) {
      return 0;
    }

    const speedMult = skillSpeedMultiplier(Math.max(1, craftingSkill.level));
    const ticksPerCraft = Math.max(1, SKILL_DEFINITIONS.crafting.ticksPerAction / speedMult);
    return Math.min(1, (crafting.automation.tickProgress ?? 0) / ticksPerCraft);
  }, [skills.crafting, crafting.automation.recipeId, crafting.automation.tickProgress]);

  return (
    <SafeContainer padTop={false}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Crafting</Text>
        <Text style={styles.subtitle}>Convert gathered materials into permanent progression.</Text>

        <Card style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Infrastructure Progress</Text>
            <Text style={styles.summaryValue}>{builtInfrastructureCount}/{totalInfrastructureCount} built</Text>
          </View>
          <View style={styles.summaryAutoRow}>
            <Text style={styles.summaryAutoLabel}>Auto Craft</Text>
            <Text style={styles.summaryAutoValue}>
              {skills.crafting.automationEnabled ? 'ON' : 'OFF'} · {autoRecipe ? `${autoRecipe.name} x${crafting.automation.quantity}` : 'No recipe selected'}
            </Text>
          </View>
          {skills.crafting.automationEnabled && autoRecipe && (
            <Text style={styles.summaryAutoHint}>
              Progress: {Math.round(autoProgress * 100)}%
            </Text>
          )}
          <View style={styles.infrastructureGrid}>
            {Object.values(INFRASTRUCTURE_DEFINITIONS).map((infrastructure) => {
              const level = crafting.infrastructureLevels[infrastructure.id] ?? 0;
              const built = level > 0;

              return (
                <View key={infrastructure.id} style={styles.infrastructureChip}>
                  <RpgIcon
                    name={infrastructure.icon}
                    fallback={infrastructure.fallbackIcon}
                    size={16}
                    color={built ? colors.success : colors.textMuted}
                  />
                  <Text style={[styles.infrastructureChipText, built && styles.infrastructureBuiltText]}>
                    {infrastructure.name}
                  </Text>
                </View>
              );
            })}
          </View>

          {activeBonuses.length > 0 && (
            <View style={styles.activeBonusesSection}>
              <Text style={styles.activeBonusesTitle}>Active Bonuses</Text>
              {activeBonuses.map((bonus, index) => (
                <View key={index} style={styles.activeBonusRow}>
                  <Text style={styles.activeBonusValue}>{bonus.value}</Text>
                  <Text style={styles.activeBonusLabel}>{bonus.label}</Text>
                  <Text style={styles.activeBonusSource}>{bonus.infrastructureName}</Text>
                </View>
              ))}
            </View>
          )}

          {upcomingGoals.length > 0 && (
            <View style={styles.upcomingSection}>
              <Text style={styles.upcomingTitle}>Nearest Goals</Text>
              {upcomingGoals.map(({ recipe, keyBlocker, oreCosts }) => (
                <View key={recipe.id} style={styles.upcomingGoalRow}>
                  <View style={styles.upcomingGoalHeader}>
                    <Text style={styles.upcomingGoalName}>{recipe.name}</Text>
                    <Text style={styles.upcomingGoalBlocker}>{keyBlocker}</Text>
                  </View>
                  {oreCosts.length > 0 && (
                    <View style={styles.upcomingOreCosts}>
                      {oreCosts.map((cost) => (
                        <Text
                          key={cost.name}
                          style={[
                            styles.upcomingOreCostText,
                            cost.current >= cost.required
                              ? styles.upcomingOreMet
                              : styles.upcomingOreMissing,
                          ]}
                        >
                          {cost.name}: {Math.floor(cost.current)}/{cost.required}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </Card>

        <View style={styles.categoryRow}>
          {CRAFTING_CATEGORIES.map((category) => {
            const meta = CATEGORY_META[category];
            const isActive = category === activeCategory;

            return (
              <Button
                key={category}
                title={meta.label}
                variant={isActive ? 'primary' : 'secondary'}
                size="sm"
                onPress={() => setActiveCategory(category)}
                style={styles.categoryButton}
              />
            );
          })}
        </View>

        {recipeList.map((recipe) => {
          const status = getCraftingRecipeStatus(craftingState, recipe.id);
          const recommendedQuantity = recipe.output.type === 'infrastructure'
            ? 1
            : Math.min(5, Math.max(1, status.maxCraftable));
          const isAutoSelected = crafting.automation.recipeId === recipe.id;

          const canCraft = status.maxCraftable > 0;
          const isDisabled = !status.unlocked || status.atInfrastructureCap || !canCraft;

          let buttonLabel = 'Craft';
          if (recipe.output.type === 'infrastructure') {
            buttonLabel = status.atInfrastructureCap ? 'Built' : 'Build';
          } else if (!status.unlocked) {
            buttonLabel = 'Locked';
          } else if (!canCraft) {
            buttonLabel = 'Need Mats';
          } else if (recommendedQuantity > 1) {
            buttonLabel = `Craft x${recommendedQuantity}`;
          }

          return (
            <Card key={recipe.id} style={styles.recipeCard}>
              <View style={styles.recipeHeader}>
                <RpgIcon
                  name={recipe.icon}
                  fallback={recipe.fallbackIcon}
                  size={22}
                  color={colors.primary}
                />
                <View style={styles.recipeHeaderText}>
                  <Text style={styles.recipeTitle}>{recipe.name}</Text>
                  <Text style={styles.recipeDescription}>{recipe.description}</Text>
                </View>
              </View>

              <View style={styles.sectionRow}>
                <Text style={styles.sectionLabel}>Requirements</Text>
                <Text style={styles.sectionHint}>{status.unlocked ? 'Met' : 'Missing'}</Text>
              </View>
              <View style={styles.detailList}>
                {recipe.requirements.map((requirement, index) => {
                  const met = isRequirementMet(requirement, skills, crafting.infrastructureLevels);
                  return (
                    <Text key={index} style={[styles.detailText, met ? styles.metText : styles.missingText]}>
                      {met ? '✓' : '•'} {formatRequirement(requirement, skills, crafting.infrastructureLevels)}
                    </Text>
                  );
                })}
              </View>

              <View style={styles.sectionRow}>
                <Text style={styles.sectionLabel}>Costs</Text>
                <Text style={styles.sectionHint}>Per craft</Text>
              </View>
              <View style={styles.detailList}>
                {recipe.costs.map((cost, index) => {
                  const available = getAvailableForCost(cost, resources, bag);
                  const affordable = available >= cost.amount;
                  return (
                    <Text key={index} style={[styles.detailText, affordable ? styles.metText : styles.missingText]}>
                      {affordable ? '✓' : '•'} {formatCost(cost, available)}
                    </Text>
                  );
                })}
              </View>

              <View style={styles.sectionRow}>
                <Text style={styles.sectionLabel}>Output</Text>
                <Text style={styles.sectionHint}>
                  {recipe.output.type === 'item' ? `Bag space: ${status.maxCraftable}` : 'Permanent unlock'}
                </Text>
              </View>
              <Text style={styles.outputText}>{formatOutput(recipe)}</Text>

              {status.atInfrastructureCap && (
                <Text style={styles.completedText}>Infrastructure already built.</Text>
              )}

              <View style={styles.actionRow}>
                <Button
                  title={buttonLabel}
                  onPress={() => craftRecipe(recipe.id, recommendedQuantity)}
                  disabled={isDisabled}
                  size="sm"
                  style={styles.actionButton}
                />
                <Button
                  title={isAutoSelected ? `Auto x${crafting.automation.quantity}` : `Set Auto x${recommendedQuantity}`}
                  onPress={() => setAutoCraftRecipe(recipe.id, recommendedQuantity)}
                  disabled={!status.unlocked || status.atInfrastructureCap}
                  variant={isAutoSelected ? 'primary' : 'secondary'}
                  size="sm"
                  style={styles.actionButton}
                />
              </View>
              {isAutoSelected && (
                <Button
                  title="Stop Auto"
                  onPress={clearAutoCraftRecipe}
                  variant="ghost"
                  size="sm"
                  style={styles.stopAutoButton}
                />
              )}
            </Card>
          );
        })}
      </ScrollView>
    </SafeContainer>
  );
}

function formatBonusTarget(target: string): string {
  switch (target) {
    case 'xp': return 'Global XP';
    case 'drops': return 'Drop Chance';
    case 'all_skills': return 'All Skills XP';
    case 'woodcutting': return 'Woodcutting XP';
    case 'mining': return 'Mining XP';
    case 'crafting': return 'Crafting XP';
    case 'attack': return 'Attack XP';
    case 'strength': return 'Strength XP';
    case 'defense': return 'Defense XP';
    case 'summoning': return 'Summoning XP';
    default: return `${target} XP`;
  }
}

function isRequirementMet(
  requirement: CraftingRequirement,
  skills: SkillsState,
  infrastructureLevels: InfrastructureLevelsState
): boolean {
  if (requirement.type === 'skill_level') {
    return (skills[requirement.skillId]?.level ?? 0) >= requirement.level;
  }

  return (infrastructureLevels[requirement.infrastructureId] ?? 0) >= requirement.level;
}

function formatRequirement(
  requirement: CraftingRequirement,
  skills: SkillsState,
  infrastructureLevels: InfrastructureLevelsState
): string {
  if (requirement.type === 'skill_level') {
    const current = skills[requirement.skillId]?.level ?? 0;
    return `${SKILL_DEFINITIONS[requirement.skillId].name} Lv ${current}/${requirement.level}`;
  }

  const current = infrastructureLevels[requirement.infrastructureId] ?? 0;
  return `${INFRASTRUCTURE_DEFINITIONS[requirement.infrastructureId].name} Lv ${current}/${requirement.level}`;
}

function getAvailableForCost(
  cost: CraftingCost,
  resources: ResourcesState,
  bag: BagState
): number {
  if (cost.type === 'resource') {
    return resources[cost.resourceId]?.amount ?? 0;
  }

  return countItemInBag(bag, cost.itemId);
}

function formatCost(
  cost: CraftingCost,
  available: number
): string {
  if (cost.type === 'resource') {
    return `${RESOURCE_DEFINITIONS[cost.resourceId].name} ${available}/${cost.amount}`;
  }

  return `${ITEM_DEFINITIONS[cost.itemId].name} ${available}/${cost.amount}`;
}

function formatOutput(recipe: CraftingRecipe): string {
  if (recipe.output.type === 'item') {
    const itemDef = ITEM_DEFINITIONS[recipe.output.itemId];
    return `${itemDef.icon} ${itemDef.name} x${recipe.output.quantity}`;
  }

  const infrastructure = INFRASTRUCTURE_DEFINITIONS[recipe.output.infrastructureId];
  const bonusSummary = infrastructure.bonuses
    .map((bonus) => {
      if (bonus.type === 'additive') {
        return `+${Math.round(bonus.value * 100)}% ${bonus.target}`;
      }

      return `${bonus.value.toFixed(2)}x ${bonus.target}`;
    })
    .join(', ');

  return `${infrastructure.fallbackIcon} ${infrastructure.name} (${bonusSummary})`;
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginVertical: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  summaryCard: {
    marginBottom: spacing.md,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  summaryValue: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  summaryAutoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryAutoLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  summaryAutoValue: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  summaryAutoHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  infrastructureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  infrastructureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
    borderRadius: 999,
  },
  infrastructureChipText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  infrastructureBuiltText: {
    color: colors.success,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  categoryButton: {
    minWidth: 90,
  },
  recipeCard: {
    marginBottom: spacing.md,
  },
  recipeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  recipeHeaderText: {
    flex: 1,
  },
  recipeTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  recipeDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  sectionRow: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  sectionHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  detailList: {
    marginBottom: spacing.xs,
  },
  detailText: {
    fontSize: fontSize.sm,
    marginBottom: spacing.xs,
  },
  metText: {
    color: colors.success,
  },
  missingText: {
    color: colors.warning,
  },
  outputText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  completedText: {
    fontSize: fontSize.xs,
    color: colors.success,
    marginBottom: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  stopAutoButton: {
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
  activeBonusesSection: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
    paddingTop: spacing.sm,
  },
  activeBonusesTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  activeBonusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 2,
  },
  activeBonusValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.success,
    minWidth: 44,
  },
  activeBonusLabel: {
    fontSize: fontSize.sm,
    color: colors.text,
    flex: 1,
  },
  activeBonusSource: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  upcomingSection: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
    paddingTop: spacing.sm,
  },
  upcomingTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  upcomingGoalRow: {
    marginBottom: spacing.sm,
  },
  upcomingGoalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  upcomingGoalName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    flex: 1,
  },
  upcomingGoalBlocker: {
    fontSize: fontSize.xs,
    color: colors.warning,
    textAlign: 'right',
  },
  upcomingOreCosts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  upcomingOreCostText: {
    fontSize: fontSize.xs,
  },
  upcomingOreMet: {
    color: colors.success,
  },
  upcomingOreMissing: {
    color: colors.textMuted,
  },
});
