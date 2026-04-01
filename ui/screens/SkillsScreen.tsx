import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { useShallow } from 'zustand/react/shallow';
import { SafeContainer } from '../components/layout/SafeContainer';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { SkillProgressBar } from '../components/game/SkillProgressBar';
import { borderRadius, colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { SKILL_DEFINITIONS, SKILL_IDS } from '@/game/data';
import { useGameStore, useSummoningSummary, useWoodcuttingTrees, useMiningRocks, useFishingSpots, useCookingRecipes, useHerbloreRecipes } from '@/store';
import { getSkillDetailHref } from './skill-detail.config';

export function SkillsScreen() {
  const { skills, activeSkill } = useGameStore(
    useShallow((state) => ({
      skills: state.skills,
      activeSkill: state.activeSkill,
    }))
  );

  const woodcuttingTrees = useWoodcuttingTrees();
  const miningRocks = useMiningRocks();
  const fishingSpots = useFishingSpots();
  const cookingRecipes = useCookingRecipes();
  const herbloreRecipes = useHerbloreRecipes();
  const summoning = useSummoningSummary();

  const targetLabels = useMemo(() => {
    return {
      woodcutting: `${woodcuttingTrees.active.icon} ${woodcuttingTrees.active.name}`,
      mining: `${miningRocks.active.icon} ${miningRocks.active.name}`,
      fishing: `${fishingSpots.active.icon} ${fishingSpots.active.name}`,
      cooking: `${cookingRecipes.active.icon} ${cookingRecipes.active.name}`,
      herblore: `${herbloreRecipes.active.icon} ${herbloreRecipes.active.name}`,
      summoning: summoning.activePet
        ? `${summoning.activePet.icon} ${summoning.activePet.name}`
        : 'No companion',
      crafting: null,
    };
  }, [
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

  return (
    <SafeContainer padTop={false}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Skills</Text>
        <Text style={styles.subtitle}>
          Tap any skill to view details, change targets, and manage automation.
        </Text>

        {SKILL_IDS.map((skillId) => {
          const skill = skills[skillId];
          const definition = SKILL_DEFINITIONS[skillId];
          const isTraining = skillId !== 'crafting' && activeSkill === skillId;
          const targetLabel = targetLabels[skillId];

          return (
            <Card key={skillId} style={isTraining ? { ...styles.skillCard, ...styles.activeCard } : styles.skillCard}>
              <View style={styles.summarySection}>
                <Pressable
                  onPress={() => router.push(getSkillDetailHref(skillId))}
                  style={styles.summaryMain}
                >
                  <View style={styles.header}>
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

                    <Text style={styles.chevron}>{'\u2192'}</Text>
                  </View>

                  <Text style={styles.description}>{definition.description}</Text>
                  <SkillProgressBar
                    skill={skill}
                    skillId={skillId}
                    isActive={isTraining}
                    showNumbers={false}
                  />
                </Pressable>

                <Button
                  title="Open"
                  onPress={() => router.push(getSkillDetailHref(skillId))}
                  variant="secondary"
                  size="sm"
                  style={styles.openButton}
                />
              </View>
            </Card>
          );
        })}
      </ScrollView>
    </SafeContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginTop: spacing.md,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
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
  summaryMain: {
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  titleGroup: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
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
    flexWrap: 'wrap',
    gap: spacing.sm,
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
  chevron: {
    fontSize: fontSize.lg,
    color: colors.textMuted,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  openButton: {
    alignSelf: 'flex-start',
  },
});
