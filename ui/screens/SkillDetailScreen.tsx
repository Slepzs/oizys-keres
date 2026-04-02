import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { SafeContainer } from '../components/layout/SafeContainer';
import { Card } from '../components/common/Cards/Card';
import { Button } from '../components/common/Button';
import { SkillProgressBar } from '../components/game/SkillProgressBar';
import { TreeSelector } from '../components/game/TreeSelector';
import { RockSelector } from '../components/game/RockSelector';
import { FishingSpotSelector } from '../components/game/FishingSpotSelector';
import { CookingRecipeSelector } from '../components/game/CookingRecipeSelector';
import { HerbloreRecipeSelector } from '../components/game/HerbloreRecipeSelector';
import { borderRadius, colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { RESOURCE_DEFINITIONS, SKILL_DEFINITIONS } from '@/game/data';
import type { PetId, SkillId } from '@/game/types';
import {
  useCookingRecipes,
  useFishingSpots,
  useGameActions,
  useGameStore,
  useHerbloreRecipes,
  useMiningRocks,
  useSummoningSummary,
  useWoodcuttingTrees,
} from '@/store';
import { formatNumber } from '@/utils/format';
import {
  getSkillPrimaryAction,
  getSkillSecondaryAction,
  getSkillSelectionLabel,
  isSkillIdParam,
} from './skill-detail.config';

const FALLBACK_SKILL_ID: SkillId = 'woodcutting';

export function SkillDetailScreen() {
  const params = useLocalSearchParams<{ skillId?: string | string[] }>();
  const rawSkillId = Array.isArray(params.skillId) ? params.skillId[0] : params.skillId;
  const skillId = rawSkillId && isSkillIdParam(rawSkillId) ? rawSkillId : null;
  const resolvedSkillId = skillId ?? FALLBACK_SKILL_ID;

  const { skill, activeSkill } = useGameStore(
    useShallow((state) => ({
      skill: state.skills[resolvedSkillId],
      activeSkill: state.activeSkill,
    }))
  );

  const {
    setActiveSkill,
    toggleAutomation,
    setActiveTree,
    setActiveRock,
    setActiveFishingSpot,
    setActiveCookingRecipe,
    setActiveHerbloreRecipe,
    setActivePet,
  } = useGameActions();

  const woodcuttingTrees = useWoodcuttingTrees();
  const miningRocks = useMiningRocks();
  const fishingSpots = useFishingSpots();
  const cookingRecipes = useCookingRecipes();
  const herbloreRecipes = useHerbloreRecipes();
  const summoning = useSummoningSummary();

  const [showTreeSelector, setShowTreeSelector] = useState(false);
  const [showRockSelector, setShowRockSelector] = useState(false);
  const [showFishingSpotSelector, setShowFishingSpotSelector] = useState(false);
  const [showCookingRecipeSelector, setShowCookingRecipeSelector] = useState(false);
  const [showHerbloreRecipeSelector, setShowHerbloreRecipeSelector] = useState(false);

  const definition = SKILL_DEFINITIONS[resolvedSkillId];
  const isTraining = skillId !== null && skillId !== 'crafting' && activeSkill === skillId;

  const primaryAction = useMemo(
    () => getSkillPrimaryAction(resolvedSkillId, isTraining),
    [resolvedSkillId, isTraining]
  );
  const secondaryAction = useMemo(
    () => getSkillSecondaryAction(resolvedSkillId),
    [resolvedSkillId]
  );
  const selectionLabel = useMemo(
    () => getSkillSelectionLabel(resolvedSkillId),
    [resolvedSkillId]
  );

  const selectionValue = useMemo(() => {
    switch (resolvedSkillId) {
      case 'woodcutting':
        return `${woodcuttingTrees.active.icon} ${woodcuttingTrees.active.name}`;
      case 'mining':
        return `${miningRocks.active.icon} ${miningRocks.active.name}`;
      case 'fishing':
        return `${fishingSpots.active.icon} ${fishingSpots.active.name}`;
      case 'cooking':
        return `${cookingRecipes.active.icon} ${cookingRecipes.active.name}`;
      case 'herblore':
        return `${herbloreRecipes.active.icon} ${herbloreRecipes.active.name}`;
      case 'summoning':
        return summoning.activePet ? `${summoning.activePet.icon} ${summoning.activePet.name}` : 'No companion set';
      case 'crafting':
        return null;
      default:
        return null;
    }
  }, [
    resolvedSkillId,
    woodcuttingTrees.active.icon,
    woodcuttingTrees.active.name,
    miningRocks.active.icon,
    miningRocks.active.name,
    fishingSpots.active.icon,
    fishingSpots.active.name,
    cookingRecipes.active.icon,
    cookingRecipes.active.name,
    herbloreRecipes.active.icon,
    herbloreRecipes.active.name,
    summoning.activePet,
  ]);

  const primaryOutput = useMemo(() => {
    switch (resolvedSkillId) {
      case 'crafting':
        return 'Tools, gear, and workshop upgrades';
      case 'cooking':
        return 'Prepared food for combat sustain';
      case 'herblore':
        return 'Potions for combat buffs';
      default: {
        const resourceDefinition = RESOURCE_DEFINITIONS[definition.resourceProduced];
        return `${resourceDefinition.icon} ${resourceDefinition.name}`;
      }
    }
  }, [definition.resourceProduced, resolvedSkillId]);

  const metaRows = useMemo(() => {
    const cadenceSeconds = (definition.ticksPerAction / 10).toFixed(1);

    return [
      {
        label: 'Automation',
        value: `Unlocks at level ${definition.automationUnlockLevel}`,
      },
      {
        label: 'Cadence',
        value: `${cadenceSeconds}s per action`,
      },
      {
        label: 'Base XP',
        value: `${formatNumber(definition.baseXpPerAction)} XP/action`,
      },
    ];
  }, [definition]);

  const handlePrimaryAction = () => {
    if (!skillId) {
      return;
    }

    if (primaryAction.kind === 'navigate') {
      router.push(primaryAction.href);
      return;
    }

    setActiveSkill(isTraining ? null : skillId);
  };

  const handleSelectionPress = () => {
    switch (resolvedSkillId) {
      case 'woodcutting':
        setShowTreeSelector(true);
        break;
      case 'mining':
        setShowRockSelector(true);
        break;
      case 'fishing':
        setShowFishingSpotSelector(true);
        break;
      case 'cooking':
        setShowCookingRecipeSelector(true);
        break;
      case 'herblore':
        setShowHerbloreRecipeSelector(true);
        break;
      default:
        break;
    }
  };

  if (!skillId) {
    return (
      <SafeContainer>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>{'\u2190'}</Text>
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Unknown Skill</Text>
            <Text style={styles.subtitle}>That skill route does not exist.</Text>
          </View>
        </View>

        <Card>
          <Text style={styles.emptyText}>Choose a skill from the skills tab and try again.</Text>
          <Button title="Back" onPress={() => router.back()} variant="secondary" />
        </Card>
      </SafeContainer>
    );
  }

  return (
    <SafeContainer>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>{'\u2190'}</Text>
        </Pressable>
        <View style={styles.headerCopy}>
          <Text style={styles.title}>
            {definition.icon} {definition.name}
          </Text>
          <Text style={styles.subtitle}>Skill details, actions, and progression</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Card style={isTraining ? styles.activeCard : undefined}>
          <View style={styles.summaryTopRow}>
            <View style={styles.summaryCopy}>
              <View style={styles.nameRow}>
                <Text style={styles.skillName}>{definition.name}</Text>
                <Text style={styles.levelPill}>Lv {skill.level}</Text>
              </View>

              <View style={styles.badgeRow}>
                {isTraining && (
                  <View style={[styles.badge, styles.badgeActive]}>
                    <Text style={[styles.badgeText, styles.badgeActiveText]}>Training</Text>
                  </View>
                )}
                {skill.automationUnlocked && skill.automationEnabled && (
                  <View style={[styles.badge, styles.badgeAuto]}>
                    <Text style={styles.badgeText}>Auto On</Text>
                  </View>
                )}
                {selectionValue && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{selectionValue}</Text>
                  </View>
                )}
              </View>
            </View>

            <Button
              title={primaryAction.title}
              onPress={handlePrimaryAction}
              variant={primaryAction.variant}
              size="sm"
              style={styles.primaryButton}
            />
          </View>

          <Text style={styles.description}>{definition.description}</Text>
          <SkillProgressBar
            skill={skill}
            skillId={resolvedSkillId}
            isActive={isTraining}
            showNumbers
          />
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>What this skill does</Text>
          <View style={styles.detailRow}>
            <View style={styles.detailCopy}>
              <Text style={styles.detailLabel}>Primary Output</Text>
              <Text style={styles.detailValue}>{primaryOutput}</Text>
            </View>
          </View>

          {metaRows.map((row) => (
            <View key={row.label} style={styles.detailRow}>
              <View style={styles.detailCopy}>
                <Text style={styles.detailLabel}>{row.label}</Text>
                <Text style={styles.detailValue}>{row.value}</Text>
              </View>
            </View>
          ))}
        </Card>

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Available Actions</Text>

          {selectionLabel && selectionValue && resolvedSkillId !== 'summoning' && (
            <View style={styles.actionRow}>
              <View style={styles.detailCopy}>
                <Text style={styles.detailLabel}>{selectionLabel}</Text>
                <Text style={styles.detailValue}>{selectionValue}</Text>
              </View>
              <Button title="Change" onPress={handleSelectionPress} variant="secondary" size="sm" />
            </View>
          )}

          {secondaryAction && (
            <View style={styles.actionRow}>
              <View style={styles.detailCopy}>
                <Text style={styles.detailLabel}>{secondaryAction.label}</Text>
                <Text style={styles.detailValue}>{secondaryAction.description}</Text>
              </View>
              <Button
                title={secondaryAction.title}
                onPress={() => router.push(secondaryAction.href)}
                variant="secondary"
                size="sm"
              />
            </View>
          )}

          {skill.automationUnlocked ? (
            <View style={styles.automationRow}>
              <View style={styles.detailCopy}>
                <Text style={styles.detailLabel}>Automation</Text>
                <Text style={styles.detailValue}>
                  {skill.automationEnabled
                    ? 'Running in the background.'
                    : 'Ready whenever you want idle progress.'}
                </Text>
              </View>
              <Switch
                value={skill.automationEnabled}
                onValueChange={() => toggleAutomation(resolvedSkillId)}
                trackColor={{ false: colors.surfaceLight, true: colors.primaryDark }}
                thumbColor={skill.automationEnabled ? colors.primary : colors.textMuted}
              />
            </View>
          ) : (
            <View style={styles.detailRow}>
              <View style={styles.detailCopy}>
                <Text style={styles.detailLabel}>Automation Locked</Text>
                <Text style={styles.detailValue}>
                  Reach level {definition.automationUnlockLevel} to automate this skill.
                </Text>
              </View>
            </View>
          )}
        </Card>

        {resolvedSkillId === 'summoning' && (
          <Card style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Companion Roster</Text>
            <View style={styles.metricGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{formatNumber(summoning.essenceAmount)}</Text>
                <Text style={styles.metricLabel}>Essence</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>{formatNumber(summoning.ritualsCompleted)}</Text>
                <Text style={styles.metricLabel}>Rituals</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricValue}>
                  {summoning.pets.filter((pet) => pet.unlocked).length}
                </Text>
                <Text style={styles.metricLabel}>Unlocked</Text>
              </View>
            </View>

            {summoning.pets.map((pet) => {
              const isUnlocked = pet.unlocked;
              const isActivePet = pet.isActive;
              const petCardStyle = isActivePet
                ? { ...styles.petCard, ...styles.petCardActive }
                : styles.petCard;

              return (
                <Card key={pet.id} style={petCardStyle}>
                  <View style={styles.petHeader}>
                    <View style={styles.petIdentity}>
                      <Text style={styles.petIcon}>{pet.icon}</Text>
                      <View style={styles.petCopy}>
                        <Text style={styles.petName}>
                          {pet.name} {pet.stage.icon}
                        </Text>
                        <Text style={styles.petMeta}>
                          {isUnlocked
                            ? `${pet.stage.name} · Bond ${pet.level} · ${pet.role}`
                            : `Unlock at level ${pet.unlockLevel} and ${pet.unlockRituals} rituals`}
                        </Text>
                      </View>
                    </View>

                    {isUnlocked && (
                      <Button
                        title={isActivePet ? 'Active' : 'Set Active'}
                        onPress={() => setActivePet(pet.id as PetId)}
                        variant={isActivePet ? 'secondary' : 'primary'}
                        size="sm"
                        disabled={isActivePet}
                      />
                    )}
                  </View>

                  <Text style={styles.petDescription}>
                    {isUnlocked ? pet.passiveSummary : pet.description}
                  </Text>

                  {isUnlocked && (
                    <View style={styles.petStatsRow}>
                      <Text style={styles.petStat}>Rituals {formatNumber(pet.ritualsChanneled)}</Text>
                      <Text style={styles.petStat}>Kills {formatNumber(pet.combatKills)}</Text>
                      <Text style={styles.petStat}>
                        Damage {pet.combatProfile?.damage ?? 0}
                      </Text>
                    </View>
                  )}
                </Card>
              );
            })}
          </Card>
        )}
      </ScrollView>

      {showTreeSelector && (
        <TreeSelector
          currentLevel={woodcuttingTrees.level}
          activeTreeId={woodcuttingTrees.activeTreeId}
          onSelectTree={setActiveTree}
          onClose={() => setShowTreeSelector(false)}
        />
      )}

      {showRockSelector && (
        <RockSelector
          currentLevel={miningRocks.level}
          activeRockId={miningRocks.activeRockId}
          onSelectRock={setActiveRock}
          onClose={() => setShowRockSelector(false)}
        />
      )}

      {showFishingSpotSelector && (
        <FishingSpotSelector
          currentLevel={fishingSpots.level}
          ownedRodIds={fishingSpots.ownedRodIds}
          activeFishingSpotId={fishingSpots.activeFishingSpotId}
          onSelectSpot={setActiveFishingSpot}
          onClose={() => setShowFishingSpotSelector(false)}
        />
      )}

      {showCookingRecipeSelector && (
        <CookingRecipeSelector
          currentLevel={cookingRecipes.level}
          activeCookingRecipeId={cookingRecipes.activeCookingRecipeId}
          onSelectRecipe={setActiveCookingRecipe}
          onClose={() => setShowCookingRecipeSelector(false)}
        />
      )}

      {showHerbloreRecipeSelector && (
        <HerbloreRecipeSelector
          currentLevel={herbloreRecipes.level}
          activeHerbloreRecipeId={herbloreRecipes.activeHerbloreRecipeId}
          onSelectRecipe={setActiveHerbloreRecipe}
          onClose={() => setShowHerbloreRecipeSelector(false)}
        />
      )}
    </SafeContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  backText: {
    fontSize: fontSize.lg,
    color: colors.text,
    fontWeight: fontWeight.bold,
  },
  headerCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSize.xxl,
    color: colors.text,
    fontWeight: fontWeight.bold,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  summaryCopy: {
    flex: 1,
    gap: spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  skillName: {
    fontSize: fontSize.xl,
    color: colors.text,
    fontWeight: fontWeight.semibold,
  },
  levelPill: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  primaryButton: {
    minWidth: 112,
  },
  description: {
    fontSize: fontSize.md,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  sectionCard: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    color: colors.text,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  detailRow: {
    paddingVertical: spacing.xs,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  automationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  detailCopy: {
    flex: 1,
  },
  detailLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },
  detailValue: {
    marginTop: spacing.xs,
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: fontWeight.semibold,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  badge: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeActive: {
    backgroundColor: colors.primaryDark,
  },
  badgeAuto: {
    backgroundColor: colors.xpBarBg,
  },
  badgeText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  badgeActiveText: {
    color: colors.text,
  },
  activeCard: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  metricGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  metricValue: {
    fontSize: fontSize.lg,
    color: colors.text,
    fontWeight: fontWeight.bold,
  },
  metricLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  petCard: {
    marginTop: spacing.sm,
    backgroundColor: colors.surfaceLight,
  },
  petCardActive: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  petHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  petIdentity: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  petIcon: {
    fontSize: 28,
  },
  petCopy: {
    flex: 1,
    gap: spacing.xs,
  },
  petName: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: fontWeight.semibold,
  },
  petMeta: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  petDescription: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  petStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  petStat: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
});
