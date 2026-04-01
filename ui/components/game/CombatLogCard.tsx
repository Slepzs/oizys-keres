import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card } from '../common/Card';
import { colors, fontSize, fontWeight, spacing, borderRadius } from '@/constants/theme';
import type { CombatLogEntry } from '@/store/combatFeedback';

interface CombatLogCardProps {
  entries: CombatLogEntry[];
  killsThisSession: number;
}

export function CombatLogCard({ entries, killsThisSession }: CombatLogCardProps) {
  return (
    <Card>
      <View style={styles.header}>
        <Text style={styles.title}>Combat Log</Text>
        <Text style={styles.subtitle}>{killsThisSession} kills this session</Text>
      </View>

      <ScrollView style={styles.logViewport} contentContainerStyle={styles.logContent}>
        {entries.length > 0 ? (
          entries.map((entry) => (
            <View key={entry.id} style={styles.logEntry}>
              <Text style={styles.logText}>{entry.text}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>High-signal combat events will appear here during fights.</Text>
        )}
      </ScrollView>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  logViewport: {
    maxHeight: 220,
  },
  logContent: {
    gap: spacing.sm,
  },
  logEntry: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  logText: {
    color: colors.text,
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
  },
});
