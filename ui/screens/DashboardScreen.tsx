import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeContainer } from '../components/layout/SafeContainer';
import { Card } from '../components/common/Cards/Card';
import { ResourceCounter } from '../components/game/ResourceCounter';
import { QuestSummaryCard } from '../components/game/QuestSummaryCard';
import { ShopSummaryCard } from '../components/game/ShopSummaryCard';
import { GachaSummaryCard } from '../components/game/GachaSummaryCard';
import { ActiveSessionCard } from '../components/game/ActiveSessionCard';
import { OfflineProgressModal } from '../components/game/OfflineProgressModal';
import { useGame } from '@/hooks/useGame';
import { useSave } from '@/hooks/useSave';
import { useOfflineSummary } from '@/store';
import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { RESOURCE_DEFINITIONS, RESOURCE_IDS } from '@/game/data';
import type { ResourceId } from '@/game/types';

const DEFAULT_DASHBOARD_RESOURCE_IDS: ResourceId[] = ['wood', 'stone', 'ore'];

export function DashboardScreen() {
  const { state } = useGame();
  useSave(); // Enable auto-save

  const { summary: offlineSummary, dismiss: dismissOfflineSummary } = useOfflineSummary();
  const visibleResourceIds = useMemo(() => {
    return RESOURCE_IDS.filter((resourceId) => {
      return DEFAULT_DASHBOARD_RESOURCE_IDS.includes(resourceId)
        || state.resources[resourceId].amount > 0;
    });
  }, [state.resources]);

  return (
    <>
    <SafeContainer showPlayerHeader>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Active Session */}
        <ActiveSessionCard />

        {/* Resources Row */}
        <View style={styles.resourcesGrid}>
          {visibleResourceIds.map((resourceId) => (
            <Card key={resourceId} style={styles.resourceCard}>
              <ResourceCounter
                resourceId={resourceId}
                amount={state.resources[resourceId].amount}
                size="lg"
              />
              <Text style={styles.resourceLabel}>
                {RESOURCE_DEFINITIONS[resourceId].name}
              </Text>
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

      {offlineSummary && (
        <OfflineProgressModal
          summary={offlineSummary}
          onDismiss={dismissOfflineSummary}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  resourcesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  resourceCard: {
    minWidth: '31%',
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  resourceLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
