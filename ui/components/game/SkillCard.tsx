import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../common/Card';
import { SkillProgressBar } from './SkillProgressBar';
import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import type { SkillId, SkillState } from '@/game/types';
import { SKILL_DEFINITIONS, WOODCUTTING_TREES } from '@/game/data';

interface SkillCardProps {
  skillId: SkillId;
  skill: SkillState;
  isActive: boolean;
  onPress: () => void;
  onSelectTree?: () => void;
}

export function SkillCard({ skillId, skill, isActive, onPress, onSelectTree }: SkillCardProps) {
  const definition = SKILL_DEFINITIONS[skillId];

  const cardStyle = isActive
    ? { ...styles.card, ...styles.activeCard }
    : styles.card;

  // Get active tree for woodcutting
  const activeTree = skillId === 'woodcutting' && skill.activeTreeId
    ? WOODCUTTING_TREES[skill.activeTreeId]
    : null;

  return (
    <Card
      onPress={onPress}
      style={cardStyle}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{definition.icon}</Text>
        <View style={styles.titleContainer}>
          <Text style={styles.name}>{definition.name}</Text>
          <Text style={styles.level}>Level {skill.level}</Text>
        </View>
        {isActive && (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>ACTIVE</Text>
          </View>
        )}
      </View>

      <SkillProgressBar skill={skill} skillId={skillId} isActive={isActive} />

      {skillId === 'woodcutting' && onSelectTree && (
        <TouchableOpacity onPress={onSelectTree} style={styles.treeRow}>
          <Text style={styles.treeLabel}>Tree:</Text>
          <Text style={styles.treeValue}>
            {activeTree ? `${activeTree.icon} ${activeTree.name}` : '🌳 Normal Tree'}
          </Text>
          <Text style={styles.treeChangeHint}>(tap to change)</Text>
        </TouchableOpacity>
      )}

      {skill.automationUnlocked && (
        <View style={styles.automationRow}>
          <Text style={styles.automationText}>
            Automation: {skill.automationEnabled ? 'ON' : 'OFF'}
          </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  icon: {
    fontSize: fontSize.xxl,
    marginRight: spacing.sm,
  },
  titleContainer: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  level: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  activeBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
  },
  activeBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  treeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
  },
  treeLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  treeValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
    flex: 1,
  },
  treeChangeHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  automationRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
  },
  automationText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
