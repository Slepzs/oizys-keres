import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { SafeContainer } from '../components/layout/SafeContainer';
import { Card } from '../components/common/Card';
import { SkillProgressBar } from '../components/game/SkillProgressBar';
import { useGame } from '@/hooks/useGame';
import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { SKILL_DEFINITIONS, SKILL_IDS } from '@/game/data';
import type { SkillId } from '@/game/types';

export function SkillsScreen() {
  const { state, setActiveSkill, toggleAutomation } = useGame();

  const handleSkillPress = (skillId: SkillId) => {
    if (state.activeSkill === skillId) {
      setActiveSkill(null);
    } else {
      setActiveSkill(skillId);
    }
  };

  return (
    <SafeContainer padTop={false}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Skills</Text>

        {SKILL_IDS.map((skillId) => {
          const skill = state.skills[skillId];
          const definition = SKILL_DEFINITIONS[skillId];
          const isActive = state.activeSkill === skillId;

          const cardStyle = isActive
            ? { ...styles.skillCard, ...styles.activeCard }
            : styles.skillCard;

          return (
            <Card
              key={skillId}
              onPress={() => handleSkillPress(skillId)}
              style={cardStyle}
            >
              <View style={styles.header}>
                <Text style={styles.icon}>{definition.icon}</Text>
                <View style={styles.info}>
                  <Text style={styles.name}>{definition.name}</Text>
                  <Text style={styles.description}>{definition.description}</Text>
                </View>
              </View>

              <View style={styles.levelRow}>
                <Text style={styles.level}>Level {skill.level}</Text>
                {isActive && (
                  <Text style={styles.activeText}>Training...</Text>
                )}
              </View>

              <SkillProgressBar skill={skill} skillId={skillId} isActive={isActive} />

              {/* Automation Toggle */}
              {skill.automationUnlocked ? (
                <View style={styles.automationRow}>
                  <Text style={styles.automationLabel}>Automation</Text>
                  <Switch
                    value={skill.automationEnabled}
                    onValueChange={() => toggleAutomation(skillId)}
                    trackColor={{ false: colors.surfaceLight, true: colors.primaryDark }}
                    thumbColor={skill.automationEnabled ? colors.primary : colors.textMuted}
                  />
                </View>
              ) : (
                <View style={styles.automationRow}>
                  <Text style={styles.lockText}>
                    Unlocks automation at level {definition.automationUnlockLevel}
                  </Text>
                </View>
              )}
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
    marginVertical: spacing.md,
  },
  skillCard: {
    marginBottom: spacing.md,
  },
  activeCard: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  icon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  level: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  activeText: {
    fontSize: fontSize.sm,
    color: colors.success,
    fontWeight: fontWeight.medium,
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
  automationLabel: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  lockText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
});
