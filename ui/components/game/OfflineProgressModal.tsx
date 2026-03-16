import React, { useMemo } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../common/Button';
import { colors, borderRadius, fontSize, fontWeight, spacing } from '@/constants/theme';
import { SKILL_DEFINITIONS, RESOURCE_DEFINITIONS, ITEM_DEFINITIONS, COMBAT_SKILL_DEFINITIONS } from '@/game/data';
import type { OfflineProgressSummary } from '@/game/logic';

interface OfflineProgressModalProps {
  summary: OfflineProgressSummary;
  onDismiss: () => void;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

function formatXp(xp: number): string {
  if (xp >= 1_000_000) return `${(xp / 1_000_000).toFixed(1)}M`;
  if (xp >= 1_000) return `${(xp / 1_000).toFixed(1)}K`;
  return Math.floor(xp).toString();
}

function formatAmount(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(1)}K`;
  return Math.floor(amount).toString();
}

export function OfflineProgressModal({ summary, onDismiss }: OfflineProgressModalProps) {
  const skillRows = useMemo(() => {
    return Object.entries(summary.skillXpGained)
      .filter(([, xp]) => xp > 0)
      .map(([skillId, xp]) => {
        const def = (SKILL_DEFINITIONS as Record<string, { name: string; icon: string }>)[skillId];
        const levelUp = summary.levelsGained[skillId] ?? 0;
        return { skillId, name: def?.name ?? skillId, icon: def?.icon ?? '⭐', xp, levelUp };
      });
  }, [summary.skillXpGained, summary.levelsGained]);

  const combatSkillRows = useMemo(() => {
    return Object.entries(summary.combatSkillLevelsGained)
      .filter(([, levels]) => levels > 0)
      .map(([skillId, levels]) => {
        const def = (COMBAT_SKILL_DEFINITIONS as Record<string, { name: string; icon: string }>)[skillId];
        return { skillId, name: def?.name ?? skillId, icon: def?.icon ?? '⚔️', levels };
      });
  }, [summary.combatSkillLevelsGained]);

  const resourceRows = useMemo(() => {
    return Object.entries(summary.resourcesGained)
      .filter(([, amount]) => amount > 0)
      .map(([resourceId, amount]) => {
        const def = (RESOURCE_DEFINITIONS as Record<string, { name: string; icon?: string }>)[resourceId];
        return { resourceId, name: def?.name ?? resourceId, icon: def?.icon ?? '📦', amount };
      });
  }, [summary.resourcesGained]);

  const itemRows = useMemo(() => {
    return Object.entries(summary.itemsGained)
      .filter(([, qty]) => qty > 0)
      .map(([itemId, quantity]) => {
        const def = (ITEM_DEFINITIONS as Record<string, { name: string; icon?: string }>)[itemId];
        return { itemId, name: def?.name ?? itemId, icon: def?.icon ?? '🎁', quantity };
      });
  }, [summary.itemsGained]);

  const hasLevelUps = skillRows.some((r) => r.levelUp > 0) || combatSkillRows.length > 0;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.emoji}>⏱️</Text>
            <View style={styles.headerText}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>
                Away for {formatDuration(summary.elapsedMs)}
                {summary.wasCapped ? ' (capped)' : ''}
              </Text>
            </View>
          </View>

          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Level ups — highlighted */}
            {hasLevelUps && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Level Ups 🎉</Text>
                {skillRows
                  .filter((r) => r.levelUp > 0)
                  .map((row) => (
                    <View key={row.skillId} style={styles.levelUpRow}>
                      <Text style={styles.rowIcon}>{row.icon}</Text>
                      <Text style={styles.levelUpName}>{row.name}</Text>
                      <Text style={styles.levelUpBadge}>+{row.levelUp} level{row.levelUp > 1 ? 's' : ''}</Text>
                    </View>
                  ))}
                {combatSkillRows.map((row) => (
                  <View key={row.skillId} style={styles.levelUpRow}>
                    <Text style={styles.rowIcon}>{row.icon}</Text>
                    <Text style={styles.levelUpName}>{row.name}</Text>
                    <Text style={styles.levelUpBadge}>+{row.levels} level{row.levels > 1 ? 's' : ''}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Skill XP */}
            {skillRows.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>XP Gained</Text>
                {skillRows.map((row) => (
                  <View key={row.skillId} style={styles.dataRow}>
                    <Text style={styles.rowIcon}>{row.icon}</Text>
                    <Text style={styles.rowLabel}>{row.name}</Text>
                    <Text style={styles.rowValue}>+{formatXp(row.xp)} XP</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Resources */}
            {resourceRows.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Resources</Text>
                {resourceRows.map((row) => (
                  <View key={row.resourceId} style={styles.dataRow}>
                    <Text style={styles.rowIcon}>{row.icon}</Text>
                    <Text style={styles.rowLabel}>{row.name}</Text>
                    <Text style={styles.rowValue}>+{formatAmount(row.amount)}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Items */}
            {itemRows.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Items Collected</Text>
                {itemRows.map((row) => (
                  <View key={row.itemId} style={styles.dataRow}>
                    <Text style={styles.rowIcon}>{row.icon}</Text>
                    <Text style={styles.rowLabel}>{row.name}</Text>
                    <Text style={styles.rowValue}>+{row.quantity}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Combat kills */}
            {summary.enemyKills > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Combat</Text>
                <View style={styles.dataRow}>
                  <Text style={styles.rowIcon}>⚔️</Text>
                  <Text style={styles.rowLabel}>Enemies defeated</Text>
                  <Text style={styles.rowValue}>{summary.enemyKills}</Text>
                </View>
              </View>
            )}

            {/* Nothing happened (idle) */}
            {skillRows.length === 0 && resourceRows.length === 0 && itemRows.length === 0 && summary.enemyKills === 0 && (
              <Text style={styles.idleText}>Nothing was active while you were away.</Text>
            )}
          </ScrollView>

          <Button
            title="Continue"
            onPress={onDismiss}
            size="md"
            style={styles.continueButton}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceLight,
  },
  emoji: {
    fontSize: 32,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scroll: {
    flexGrow: 0,
    maxHeight: 360,
  },
  scrollContent: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  section: {
    gap: spacing.xs,
  },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  levelUpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  levelUpName: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  levelUpBadge: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.warning,
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 3,
  },
  rowIcon: {
    fontSize: fontSize.md,
    width: 24,
    textAlign: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  rowValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.success,
  },
  idleText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  continueButton: {
    marginTop: spacing.md,
  },
});
