import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ProgressBar } from '../common/ProgressBar';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '@/constants/theme';
import type { PetId, PetRole, PetEvolutionStageId, SkillState } from '@/game/types';
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
  ritualsCompleted: number;
  essenceAmount: number;
  pets: SummoningPetSummary[];
  onToggleTraining: () => void;
  onToggleAutomation: () => void;
  onSelectPet: (petId: PetId) => void;
}

export function SummoningSkillPanel({
  skill,
  skillXpRequired,
  isActive,
  ritualsCompleted,
  essenceAmount,
  pets,
  onToggleTraining,
  onToggleAutomation,
  onSelectPet,
}: SummoningSkillPanelProps) {
  const activePet = pets.find((pet) => pet.isActive) ?? null;
  const skillProgress = skill.level >= 99 ? 1 : skill.xp / Math.max(1, skillXpRequired);
  const cardStyle = isActive
    ? { ...styles.card, ...styles.activeCard }
    : styles.card;

  return (
    <Card style={cardStyle}>
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.icon}>🔮</Text>
          <View style={styles.headerText}>
            <Text style={styles.name}>Summoning</Text>
            <Text style={styles.description}>
              Bind rare companions, deepen their bond, and turn rituals into combat power.
            </Text>
          </View>
        </View>
        <Button
          title={isActive ? 'Channeling' : 'Train'}
          onPress={onToggleTraining}
          variant={isActive ? 'secondary' : 'primary'}
          size="sm"
        />
      </View>

      <View style={styles.topline}>
        <Text style={styles.level}>Level {skill.level}</Text>
        <Text style={styles.subtle}>
          {activePet ? `${activePet.icon} ${activePet.name}` : 'No active companion'}
        </Text>
      </View>

      <ProgressBar progress={skillProgress} height={8} color={colors.primary} />
      <Text style={styles.progressText}>
        {formatNumber(skill.xp)} / {formatNumber(skillXpRequired)} XP
      </Text>

      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{formatNumber(essenceAmount)}</Text>
          <Text style={styles.metricLabel}>Spirit Essence</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{formatNumber(ritualsCompleted)}</Text>
          <Text style={styles.metricLabel}>Rituals</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricValue}>{pets.filter((pet) => pet.unlocked).length}</Text>
          <Text style={styles.metricLabel}>Companions</Text>
        </View>
      </View>

      {activePet && (
        <View style={styles.activePetPanel}>
          <Text style={styles.activePetTitle}>Active Companion</Text>
          <Text style={styles.activePetHeadline}>
            {activePet.icon} {activePet.name} {activePet.stage.icon}
          </Text>
          <Text style={styles.activePetText}>
            {activePet.stage.name} {activePet.role} with {activePet.combatProfile?.damage ?? 0} damage per strike at{' '}
            {(activePet.combatProfile?.attackIntervalSeconds ?? 0).toFixed(1)}s cadence.
          </Text>
        </View>
      )}

      <View style={styles.automationRow}>
        <View style={styles.automationTextWrap}>
          <Text style={styles.automationLabel}>Automation</Text>
          <Text style={styles.automationHint}>
            {skill.automationUnlocked
              ? 'Run rituals in the background at reduced efficiency.'
              : `Unlocks at level 12`}
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

              <Text style={styles.petDescription}>{pet.description}</Text>

              {pet.unlocked ? (
                <>
                  <Text style={styles.petPassive}>{pet.passiveSummary}</Text>
                  <ProgressBar progress={progress} height={6} color={colors.success} />
                  <View style={styles.petStatsRow}>
                    <Text style={styles.petStat}>Bond {pet.level}</Text>
                    <Text style={styles.petStat}>Kills {formatNumber(pet.combatKills)}</Text>
                    <Text style={styles.petStat}>Rituals {formatNumber(pet.ritualsChanneled)}</Text>
                  </View>
                  <Text style={styles.petCombatLine}>
                    {pet.affinity} affinity, {pet.combatProfile?.damage ?? 0} damage, {(pet.combatProfile?.attackIntervalSeconds ?? 0).toFixed(1)}s attack speed
                  </Text>
                </>
              ) : (
                <Text style={styles.petLockedText}>
                  Locked companions stay visible so you can plan your next bond breakpoints.
                </Text>
              )}
            </Card>
          );
        })}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  activeCard: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
  },
  icon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  description: {
    marginTop: spacing.xs,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  topline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  level: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  subtle: {
    fontSize: fontSize.sm,
    color: colors.success,
  },
  progressText: {
    marginTop: spacing.xs,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'right',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  metric: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  metricValue: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  metricLabel: {
    marginTop: spacing.xs,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  activePetPanel: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: '#132538',
    borderRadius: borderRadius.md,
  },
  activePetTitle: {
    fontSize: fontSize.xs,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  activePetHeadline: {
    marginTop: spacing.xs,
    fontSize: fontSize.lg,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
  },
  automationTextWrap: {
    flex: 1,
    marginRight: spacing.md,
  },
  automationLabel: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: fontWeight.semibold,
  },
  automationHint: {
    marginTop: spacing.xs,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  collectionTitle: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
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
    fontSize: 28,
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
  petDescription: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  petPassive: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.success,
  },
  petStatsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  petStat: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  petCombatLine: {
    marginTop: spacing.xs,
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  petLockedText: {
    marginTop: spacing.sm,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});
