import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeContainer } from '../components/layout/SafeContainer';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { SkillProgressBar } from '../components/game/SkillProgressBar';
import { TreeSelector } from '../components/game/TreeSelector';
import { RockSelector } from '../components/game/RockSelector';
import { FishingSpotSelector } from '../components/game/FishingSpotSelector';
import { CookingRecipeSelector } from '../components/game/CookingRecipeSelector';
import { HerbloreRecipeSelector } from '../components/game/HerbloreRecipeSelector';
import { SummoningSkillPanel } from '../components/game/SummoningSkillPanel';
import { useGame } from '@/hooks/useGame';
import {
  useGameActions,
  useMiningRocks,
  useSummoningSummary,
  useWoodcuttingTrees,
  useFishingSpots,
  useCookingRecipes,
  useHerbloreRecipes,
} from '@/store';
import { borderRadius, colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { SKILL_DEFINITIONS, SKILL_IDS } from '@/game/data';
import type { SkillId } from '@/game/types';

export function SkillsScreen() {
  const { state, setActiveSkill, toggleAutomation } = useGame();
  const {
    setActiveTree,
    setActiveRock,
    setActivePet,
    setActiveFishingSpot,
    setActiveCookingRecipe,
    setActiveHerbloreRecipe,
  } = useGameActions();
  const [expandedSkillId, setExpandedSkillId] = useState<SkillId | null>(null);
  const [showTreeSelector, setShowTreeSelector] = useState(false);
  const [showRockSelector, setShowRockSelector] = useState(false);
  const [showFishingSpotSelector, setShowFishingSpotSelector] = useState(false);
  const [showCookingRecipeSelector, setShowCookingRecipeSelector] = useState(false);
  const [showHerbloreRecipeSelector, setShowHerbloreRecipeSelector] = useState(false);
  const woodcuttingTrees = useWoodcuttingTrees();
  const miningRocks = useMiningRocks();
  const fishingSpots = useFishingSpots();
  const cookingRecipes = useCookingRecipes();
  const herbloreRecipes = useHerbloreRecipes();
  const summoning = useSummoningSummary();

  const toggleExpandedSkill = (skillId: SkillId) => {
    setExpandedSkillId((current) => (current === skillId ? null : skillId));
  };

  const handlePrimaryAction = (skillId: SkillId) => {
    if (skillId === 'crafting') {
      router.push('/crafting');
      return;
    }

    if (state.activeSkill === skillId) {
      setActiveSkill(null);
    } else {
      setActiveSkill(skillId);
    }
  };

  const getTargetLabel = (skillId: SkillId) => {
    switch (skillId) {
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
        return summoning.activePet ? `${summoning.activePet.icon} ${summoning.activePet.name}` : null;
      default:
        return null;
    }
  };

  const getShortcutConfig = (skillId: SkillId) => {
    if (skillId === 'crafting') {
      return {
        label: 'Crafting',
        description: 'Recipe queue and automation',
        title: 'Open',
        onPress: () => router.push('/crafting'),
      };
    }

    if (skillId === 'cooking' || skillId === 'herblore') {
      return {
        label: 'Combat',
        description: 'Food and potion loadout',
        title: 'Open',
        onPress: () => router.push('/combat'),
      };
    }

    return null;
  };

  const woodcuttingSkill = state.skills.woodcutting;
  const miningSkill = state.skills.mining;
  const fishingSkill = state.skills.fishing;
  const cookingSkill = state.skills.cooking;
  const herbloreSkill = state.skills.herblore;

  return (
    <SafeContainer padTop={false}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Skills</Text>

        {SKILL_IDS.map((skillId) => {
          const skill = state.skills[skillId];
          const definition = SKILL_DEFINITIONS[skillId];
          const isTraining = skillId !== 'crafting' && state.activeSkill === skillId;
          const isExpanded = expandedSkillId === skillId;
          const targetLabel = getTargetLabel(skillId);
          const shortcut = getShortcutConfig(skillId);
          const cardStyle = isTraining
            ? { ...styles.skillCard, ...styles.activeCard }
            : styles.skillCard;

          if (skillId === 'summoning') {
            return (
              <SummoningSkillPanel
                key={skillId}
                skill={skill}
                skillXpRequired={summoning.skillXpRequired}
                isActive={isTraining}
                expanded={isExpanded}
                ritualsCompleted={summoning.ritualsCompleted}
                essenceAmount={summoning.essenceAmount}
                pets={summoning.pets}
                onToggleExpanded={() => toggleExpandedSkill(skillId)}
                onToggleTraining={() => handlePrimaryAction(skillId)}
                onToggleAutomation={() => toggleAutomation(skillId)}
                onSelectPet={setActivePet}
              />
            );
          }

          return (
            <Card key={skillId} style={cardStyle}>
              <View style={styles.summarySection}>
                <View style={styles.header}>
                  <Pressable onPress={() => toggleExpandedSkill(skillId)} style={styles.summaryMain}>
                    <View style={styles.titleGroup}>
                      <Text style={styles.icon}>{definition.icon}</Text>
                      <View style={styles.info}>
                        <View style={styles.nameRow}>
                          <Text style={styles.name}>{definition.name}</Text>
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

                          {targetLabel && (
                            <View style={styles.badge}>
                              <Text style={styles.badgeText}>{targetLabel}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  </Pressable>

                  <Button
                    title={skillId === 'crafting' ? 'Open' : isTraining ? 'Stop' : 'Train'}
                    onPress={() => handlePrimaryAction(skillId)}
                    variant={skillId === 'crafting' || isTraining ? 'secondary' : 'primary'}
                    size="sm"
                    style={styles.headerButton}
                  />
                </View>

                <Pressable onPress={() => toggleExpandedSkill(skillId)}>
                  <SkillProgressBar
                    skill={skill}
                    skillId={skillId}
                    isActive={isTraining}
                    showNumbers={isExpanded}
                  />
                </Pressable>
              </View>

              {isExpanded && (
                <View style={styles.expandedSection}>
                  {shortcut && (
                    <View style={styles.detailRow}>
                      <View style={styles.detailText}>
                        <Text style={styles.detailLabel}>{shortcut.label}</Text>
                        <Text style={styles.detailValue}>{shortcut.description}</Text>
                      </View>
                      <Button
                        title={shortcut.title}
                        onPress={shortcut.onPress}
                        variant="secondary"
                        size="sm"
                      />
                    </View>
                  )}

                  {skillId === 'woodcutting' && (
                    <View style={styles.detailRow}>
                      <View style={styles.detailText}>
                        <Text style={styles.detailLabel}>Tree</Text>
                        <Text style={styles.detailValue}>
                          {`${woodcuttingTrees.active.icon} ${woodcuttingTrees.active.name}`}
                        </Text>
                      </View>
                      <Button title="Change" onPress={() => setShowTreeSelector(true)} variant="secondary" size="sm" />
                    </View>
                  )}

                  {skillId === 'mining' && (
                    <View style={styles.detailRow}>
                      <View style={styles.detailText}>
                        <Text style={styles.detailLabel}>Rock</Text>
                        <Text style={styles.detailValue}>
                          {`${miningRocks.active.icon} ${miningRocks.active.name}`}
                        </Text>
                      </View>
                      <Button title="Change" onPress={() => setShowRockSelector(true)} variant="secondary" size="sm" />
                    </View>
                  )}

                  {skillId === 'fishing' && (
                    <View style={styles.detailRow}>
                      <View style={styles.detailText}>
                        <Text style={styles.detailLabel}>Spot</Text>
                        <Text style={styles.detailValue}>
                          {`${fishingSpots.active.icon} ${fishingSpots.active.name}`}
                        </Text>
                      </View>
                      <Button title="Change" onPress={() => setShowFishingSpotSelector(true)} variant="secondary" size="sm" />
                    </View>
                  )}

                  {skillId === 'cooking' && (
                    <View style={styles.detailRow}>
                      <View style={styles.detailText}>
                        <Text style={styles.detailLabel}>Recipe</Text>
                        <Text style={styles.detailValue}>
                          {`${cookingRecipes.active.icon} ${cookingRecipes.active.name}`}
                        </Text>
                      </View>
                      <Button title="Change" onPress={() => setShowCookingRecipeSelector(true)} variant="secondary" size="sm" />
                    </View>
                  )}

                  {skillId === 'herblore' && (
                    <View style={styles.detailRow}>
                      <View style={styles.detailText}>
                        <Text style={styles.detailLabel}>Recipe</Text>
                        <Text style={styles.detailValue}>
                          {`${herbloreRecipes.active.icon} ${herbloreRecipes.active.name}`}
                        </Text>
                      </View>
                      <Button title="Change" onPress={() => setShowHerbloreRecipeSelector(true)} variant="secondary" size="sm" />
                    </View>
                  )}

                  {skill.automationUnlocked ? (
                    <View style={styles.automationRow}>
                      <View style={styles.detailText}>
                        <Text style={styles.detailLabel}>Automation</Text>
                        <Text style={styles.detailValue}>
                          {skill.automationEnabled ? 'Running in the background.' : 'Ready when you want idle progress.'}
                        </Text>
                      </View>
                      <Switch
                        value={skill.automationEnabled}
                        onValueChange={() => toggleAutomation(skillId)}
                        trackColor={{ false: colors.surfaceLight, true: colors.primaryDark }}
                        thumbColor={skill.automationEnabled ? colors.primary : colors.textMuted}
                      />
                    </View>
                  ) : (
                    <View style={styles.lockRow}>
                      <Text style={styles.lockText}>
                        Automation unlocks at level {definition.automationUnlockLevel}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </Card>
          );
        })}
      </ScrollView>

      {showTreeSelector && (
        <TreeSelector
          currentLevel={woodcuttingSkill.level}
          activeTreeId={woodcuttingTrees.activeTreeId}
          onSelectTree={setActiveTree}
          onClose={() => setShowTreeSelector(false)}
        />
      )}

      {showRockSelector && (
        <RockSelector
          currentLevel={miningSkill.level}
          activeRockId={miningRocks.activeRockId}
          onSelectRock={setActiveRock}
          onClose={() => setShowRockSelector(false)}
        />
      )}

      {showFishingSpotSelector && (
        <FishingSpotSelector
          currentLevel={fishingSkill.level}
          activeFishingSpotId={fishingSpots.activeFishingSpotId}
          onSelectSpot={setActiveFishingSpot}
          onClose={() => setShowFishingSpotSelector(false)}
        />
      )}

      {showCookingRecipeSelector && (
        <CookingRecipeSelector
          currentLevel={cookingSkill.level}
          activeCookingRecipeId={cookingRecipes.activeCookingRecipeId}
          onSelectRecipe={setActiveCookingRecipe}
          onClose={() => setShowCookingRecipeSelector(false)}
        />
      )}

      {showHerbloreRecipeSelector && (
        <HerbloreRecipeSelector
          currentLevel={herbloreSkill.level}
          activeHerbloreRecipeId={herbloreRecipes.activeHerbloreRecipeId}
          onSelectRecipe={setActiveHerbloreRecipe}
          onClose={() => setShowHerbloreRecipeSelector(false)}
        />
      )}
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
  skillCard: {
    marginBottom: spacing.sm,
  },
  activeCard: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  summarySection: {
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  summaryMain: {
    flex: 1,
  },
  titleGroup: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerButton: {
    minWidth: 64,
  },
  icon: {
    fontSize: 24,
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
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
  expandedSection: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  detailText: {
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
  automationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  lockRow: {
    paddingTop: spacing.xs,
  },
  lockText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
