import React from 'react';
import { View, Text, StyleSheet, Switch, Pressable } from 'react-native';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ProgressBar } from '../common/ProgressBar';
import { borderRadius, colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import type { PetEvolutionStageId, PetId, PetRole, SkillState } from '@/game/types';
import { formatNumber } from '@/utils/format';

interface SummoningPetSummary {
  id: PetId;
  name: string;
  description: string;
  icon: string;
  role: PetRole;
  affinity: string;
  passiveSummary: string;
  unlockLevel: number;
  unlockRituals: number;
  unlocked: boolean;
  level: number;
  xp: number;
  xpRequired: number;
  ritualsChanneled: number;
  combatKills: number;
  isActive: boolean;
  stage: {
    id: PetEvolutionStageId;
    name: string;
    icon: string;
  };
  combatProfile: {
    damage: number;
    attackIntervalSeconds: number;
  } | null;
}

interface SummoningSkillPanelProps {
  skill: SkillState;
  skillXpRequired: number;
  isActive: boolean;
  expanded: boolean;
  ritualsCompleted: number;
  essenceAmount: number;
  pets: SummoningPetSummary[];
  onToggleExpanded: () => void;
  onToggleTraining: () => void;
  onToggleAutomation: () => void;
  onSelectPet: (petId: PetId) => void;
}

export function SummoningSkillPanel({
  skill,
  skillXpRequired,
  isActive,
  expanded,
  ritualsCompleted,
  essenceAmount,
  pets,
  onToggleExpanded,
  onToggleTraining,
  onToggleAutomation,
  onSelectPet,
}: SummoningSkillPanelProps) {
  const activePet = pets.find((pet) => pet.isActive) ?? null;
  const unlockedPetCount = pets.filter((pet) => pet.unlocked).length;
  const skillProgress = skill.level >= 99 ? 1 : skill.xp / Math.max(1, skillXpRequired);
  const cardStyle = isActive ? { ...styles.card, ...styles.activeCard } : styles.card;

  return (
    <Card style={cardStyle}>
      <View style={styles.summarySection}>
        <View style={styles.header}>
          <Pressable onPress={onToggleExpanded} style={styles.summaryMain}>
            <View style={styles.titleGroup}>
              <Text style={styles.icon}>🔮</Text>
              <View style={styles.info}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>Summoning</Text>
                  <Text style={styles.levelPill}>Lv {skill.level}</Text>
                </View>

                <View style={styles.badgeRow}>
                  {isActive && (
                    <View style={[styles.badge, styles.badgeActive]}>
                      <Text style={[styles.badgeText, styles.badgeActiveText]}>Training</Text>
                    </View>
                  )}

                  {skill.automationUnlocked && skill.automationEnabled && (
                    <View style={[styles.badge, styles.badgeAuto]}>
                      <Text style={styles.badgeText}>Auto On</Text>
                    </View>
                  )}

                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {activePet ? `${activePet.icon} ${activePet.name}` : 'No companion'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </Pressable>

          <Button
            title={isActive ? 'Stop' : 'Train'}
            onPress={onToggleTraining}
            variant={isActive ? 'secondary' : 'primary'}
            size="sm"
            style={styles.headerButton}
          />
        </View>

        <Pressable onPress={onToggleExpanded}>
          <ProgressBar progress={skillProgress} height={8} color={colors.primary} />
          {expanded && (
            <Text style={styles.progressText}>
              {formatNumber(skill.xp)} / {formatNumber(skillXpRequired)} XP
            </Text>
          )}
        </Pressable>
      </View>

      {expanded && (
        <View style={styles.expandedSection}>
          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{formatNumber(essenceAmount)}</Text>
              <Text style={styles.metricLabel}>Essence</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{formatNumber(ritualsCompleted)}</Text>
              <Text style={styles.metricLabel}>Rituals</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{unlockedPetCount}</Text>
              <Text style={styles.metricLabel}>Companions</Text>
            </View>
          </View>

          {activePet && (
            <View style={styles.activePetPanel}>
              <Text style={styles.activePetTitle}>Active Companion</Text>
              <Text style={styles.activePetHeadline}>
                {activePet.icon} {activePet.name} {activePet.stage.icon}
              </Text>
              <Text style={styles.activePetText}>{activePet.passiveSummary}</Text>
            </View>
          )}

          <View style={styles.automationRow}>
            <View style={styles.automationTextWrap}>
              <Text style={styles.automationLabel}>Automation</Text>
              <Text style={styles.automationHint}>
                {skill.automationUnlocked
                  ? 'Run rituals in the background at reduced efficiency.'
                  : 'Unlocks at level 12'}
              </Text>
            </View>
            <Switch
              value={skill.automationEnabled}
              onValueChange={onToggleAutomation}
              disabled={!skill.automationUnlocked}
              trackColor={{ false: colors.surfaceLight, true: colors.primaryDark }}
              thumbColor={skill.automationEnabled ? colors.primary : colors.textMuted}
            />
          </View>

          <Text style={styles.collectionTitle}>Companion Roster</Text>
          <View style={styles.petList}>
            {pets.map((pet) => {
              const progress = pet.level >= 50 ? 1 : pet.xp / Math.max(1, pet.xpRequired);
              const petCardStyle = pet.unlocked
                ? (pet.isActive ? { ...styles.petCard, ...styles.petCardActive } : styles.petCard)
                : { ...styles.petCard, ...styles.petCardLocked };

              return (
                <Card
                  key={pet.id}
                  style={petCardStyle}
                  onPress={pet.unlocked ? () => onSelectPet(pet.id) : undefined}
                >
                  <View style={styles.petHeader}>
                    <View style={styles.petIdentity}>
                      <Text style={styles.petIcon}>{pet.icon}</Text>
                      <View style={styles.petIdentityText}>
                        <Text style={styles.petName}>{pet.name}</Text>
                        <Text style={styles.petMeta}>
                          {pet.unlocked
                            ? `${pet.stage.icon} ${pet.stage.name} ${pet.role}`
                            : `Unlock at level ${pet.unlockLevel} and ${pet.unlockRituals} rituals`}
                        </Text>
                      </View>
                    </View>
                    {pet.isActive && <Text style={styles.activeBadge}>ACTIVE</Text>}
                  </View>

                  {pet.unlocked ? (
                    <>
                      <Text style={styles.petPassive}>{pet.passiveSummary}</Text>
                      <ProgressBar progress={progress} height={6} color={colors.success} />
                      <View style={styles.petStatsRow}>
                        <Text style={styles.petStat}>Bond {pet.level}</Text>
                        <Text style={styles.petStat}>Damage {pet.combatProfile?.damage ?? 0}</Text>
                        <Text style={styles.petStat}>Kills {formatNumber(pet.combatKills)}</Text>
                      </View>
                    </>
                  ) : (
                    <Text style={styles.petLockedText}>{pet.description}</Text>
                  )}
                </Card>
              );
            })}
          </View>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
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
  progressText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'right',
  },
  expandedSection: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
    gap: spacing.sm,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metric: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  metricValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  metricLabel: {
    marginTop: spacing.xs,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  activePetPanel: {
    backgroundColor: '#132538',
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  activePetTitle: {
    fontSize: fontSize.xs,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  activePetHeadline: {
    marginTop: spacing.xs,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  activePetText: {
    marginTop: spacing.xs,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  automationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  automationTextWrap: {
    flex: 1,
  },
  automationLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
  },
  automationHint: {
    marginTop: spacing.xs,
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: fontWeight.semibold,
  },
  collectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  petList: {
    gap: spacing.sm,
  },
  petCard: {
    backgroundColor: colors.surfaceLight,
  },
  petCardActive: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  petCardLocked: {
    opacity: 0.72,
  },
  petHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  petIdentity: {
    flex: 1,
    flexDirection: 'row',
  },
  petIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  petIdentityText: {
    flex: 1,
  },
  petName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  petMeta: {
    marginTop: spacing.xs,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  activeBadge: {
    alignSelf: 'flex-start',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  petPassive: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.success,
  },
  petStatsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
  petStat: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  petLockedText: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
