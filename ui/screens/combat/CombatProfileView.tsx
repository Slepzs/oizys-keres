import React, { type ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { borderRadius, colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { CombatPetCard } from '@/ui/components/game/CombatPetCard';
import { CombatStats } from '@/ui/components/game/CombatStats';

type CombatStatsProps = ComponentProps<typeof CombatStats>;
type CombatPetProps = ComponentProps<typeof CombatPetCard>;

interface CombatProfileViewProps extends CombatStatsProps {
  activePet: CombatPetProps['pet'] | null;
  petBonuses: CombatPetProps['bonuses'];
}

export function CombatProfileView({
  activePet,
  petBonuses,
  ...combatStatsProps
}: CombatProfileViewProps) {
  return (
    <View style={styles.content}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionKicker}>Persistent Stats</Text>
        <Text style={styles.sectionTitle}>Combat Profile</Text>
        <Text style={styles.sectionSubtitle}>
          Training focus, permanent combat levels, and companion bonuses stay here.
        </Text>
      </View>

      <View style={styles.section}>
        <CombatStats {...combatStatsProps} />
      </View>

      {activePet ? (
        <View style={styles.companionBlock}>
          <View style={styles.companionHeader}>
            <Text style={styles.companionTitle}>Companion</Text>
            <Text style={styles.companionSubtitle}>
              Summoning support stays with your long-term combat profile.
            </Text>
          </View>
          <CombatPetCard pet={activePet} bonuses={petBonuses} />
        </View>
      ) : null}
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
  companionBlock: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  companionHeader: {
    gap: spacing.xs,
  },
  companionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  companionSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
