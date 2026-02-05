import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { router } from 'expo-router';
import { SafeContainer } from '../components/layout/SafeContainer';
import { Card } from '../components/common/Card';
import { ProgressBar } from '../components/common/ProgressBar';
import { ResourceCounter } from '../components/game/ResourceCounter';
import { QuestSummaryCard } from '../components/game/QuestSummaryCard';
import { ShopSummaryCard } from '../components/game/ShopSummaryCard';
import { GachaSummaryCard } from '../components/game/GachaSummaryCard';
import { useGame } from '@/hooks/useGame';
import { useSave } from '@/hooks/useSave';
import { usePlayerSummary } from '@/store';
import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { playerXpProgress } from '@/game/logic';
import type { ResourceId } from '@/game/types';

export function DashboardScreen() {
  const { state } = useGame();
  useSave(); // Enable auto-save

  const playerProgress = playerXpProgress(state.player);
  const playerSummary = usePlayerSummary();

  return (
    <SafeContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Player Level Card */}
        <Pressable onPress={() => router.push('/stats')}>
          <Card style={styles.playerCard}>
            <View style={styles.playerHeader}>
              <Text style={styles.playerTitle}>Player</Text>
              <View style={styles.playerLevelRow}>
                <Text style={styles.playerLevel}>Level {state.player.level}</Text>
                <Text style={styles.chevron}>{'\u2192'}</Text>
              </View>
            </View>
            <ProgressBar
              progress={playerProgress}
              color={colors.primary}
              height={8}
            />
            <View style={styles.playerStats}>
              <Text style={styles.statText}>
                {'\u2764\uFE0F'} {playerSummary.currentHealth}/{playerSummary.maxHealth}
              </Text>
              <Text style={styles.statText}>
                {'\u2728'} {playerSummary.currentMana}/{playerSummary.maxMana}
              </Text>
            </View>
          </Card>
        </Pressable>

        {/* Resources Row */}
        <View style={styles.resourcesRow}>
          {(['wood', 'stone', 'ore'] as ResourceId[]).map((resourceId) => (
            <Card key={resourceId} style={styles.resourceCard}>
              <ResourceCounter
                resourceId={resourceId}
                amount={state.resources[resourceId].amount}
                size="lg"
              />
            </Card>
          ))}
        </View>

        {/* Shopkeeper */}
        <ShopSummaryCard />
        <GachaSummaryCard />

        {/* Quest Summary Card */}
        <QuestSummaryCard />
      </ScrollView>
    </SafeContainer>
  );
}

const styles = StyleSheet.create({
  playerCard: {
    marginBottom: spacing.md,
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  playerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  playerLevel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  playerLevelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  chevron: {
    fontSize: fontSize.lg,
    color: colors.textMuted,
  },
  playerStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  statText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  resourcesRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  resourceCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
});
