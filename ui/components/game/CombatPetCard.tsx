import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../common/Card';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '@/constants/theme';

interface CombatPetCardProps {
  pet: {
    icon: string;
    name: string;
    level: number;
    role: string;
    stageIcon: string;
    stageName: string;
    damage: number;
    attackIntervalSeconds: number;
    passiveSummary: string;
  };
  bonuses: {
    attackBonus: number;
    strengthBonus: number;
    defenseBonus: number;
    maxHpBonus: number;
    attackSpeedMultiplier: number;
    damageReduction: number;
  };
}

export function CombatPetCard({ pet, bonuses }: CombatPetCardProps) {
  const bonusLines = [
    bonuses.attackBonus > 0 ? `ATK +${bonuses.attackBonus}` : null,
    bonuses.strengthBonus > 0 ? `STR +${bonuses.strengthBonus}` : null,
    bonuses.defenseBonus > 0 ? `DEF +${bonuses.defenseBonus}` : null,
    bonuses.maxHpBonus > 0 ? `HP +${bonuses.maxHpBonus}` : null,
    bonuses.damageReduction > 0 ? `Block ${bonuses.damageReduction}` : null,
    bonuses.attackSpeedMultiplier > 1 ? `${Math.round((bonuses.attackSpeedMultiplier - 1) * 100)}% tempo` : null,
  ].filter(Boolean);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.identity}>
          <Text style={styles.icon}>{pet.icon}</Text>
          <View>
            <Text style={styles.name}>
              {pet.name} {pet.stageIcon}
            </Text>
            <Text style={styles.meta}>
              Level {pet.level} {pet.stageName} {pet.role}
            </Text>
          </View>
        </View>
        <View style={styles.damageBox}>
          <Text style={styles.damageValue}>{pet.damage}</Text>
          <Text style={styles.damageLabel}>pet dmg</Text>
        </View>
      </View>

      <Text style={styles.passive}>{pet.passiveSummary}</Text>

      <View style={styles.timingRow}>
        <Text style={styles.timingText}>Strikes every {pet.attackIntervalSeconds.toFixed(1)}s</Text>
        <Text style={styles.timingText}>{bonusLines.join(' • ') || 'No passive stat bonuses'}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#132538',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  identity: {
    flex: 1,
    flexDirection: 'row',
  },
  icon: {
    fontSize: 28,
    marginRight: spacing.sm,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  meta: {
    marginTop: spacing.xs,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  damageBox: {
    minWidth: 74,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  damageValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  damageLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  passive: {
    marginTop: spacing.md,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  timingRow: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  timingText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});
