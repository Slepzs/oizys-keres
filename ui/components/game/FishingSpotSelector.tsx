import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { FISHING_RODS, FISHING_SPOTS } from '@/game/data';
import type { FishingSpot } from '@/game/data/fishing-spots.data';
import type { FishingRodId, FishingSpotId } from '@/game/types';

interface FishingSpotSelectorProps {
  currentLevel: number;
  ownedRodIds: FishingRodId[];
  activeFishingSpotId: FishingSpotId | undefined;
  onSelectSpot: (spotId: FishingSpotId) => void;
  onClose: () => void;
}

export function FishingSpotSelector({
  currentLevel,
  ownedRodIds,
  activeFishingSpotId,
  onSelectSpot,
  onClose,
}: FishingSpotSelectorProps) {
  const spots = Object.values(FISHING_SPOTS);

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Fishing Spot</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>Fishing Level: {currentLevel}</Text>

        <ScrollView style={styles.spotList}>
          {spots.map((spot) => {
            const isLevelLocked = currentLevel < spot.levelRequired;
            const isRodLocked = !isLevelLocked && !!spot.requiredRodId && !ownedRodIds.includes(spot.requiredRodId);
            const isLocked = isLevelLocked || isRodLocked;
            const isSelected = activeFishingSpotId === spot.id;

            return (
              <SpotCard
                key={spot.id}
                spot={spot}
                isLevelLocked={isLevelLocked}
                isRodLocked={isRodLocked}
                isLocked={isLocked}
                isSelected={isSelected}
                onPress={() => {
                  if (!isLocked) {
                    onSelectSpot(spot.id);
                    onClose();
                  }
                }}
              />
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

interface SpotCardProps {
  spot: FishingSpot;
  isLevelLocked: boolean;
  isRodLocked: boolean;
  isLocked: boolean;
  isSelected: boolean;
  onPress: () => void;
}

function SpotCard({ spot, isLevelLocked, isRodLocked, isLocked, isSelected, onPress }: SpotCardProps) {
  const requiredRod = spot.requiredRodId ? FISHING_RODS[spot.requiredRodId] : null;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLocked}
      style={[
        styles.spotCard,
        isLocked && styles.lockedCard,
        isSelected && styles.selectedCard,
      ]}
    >
      <View style={styles.spotHeader}>
        <Text style={styles.spotIcon}>{spot.icon}</Text>
        <View style={styles.spotInfo}>
          <Text style={[styles.spotName, isLocked && styles.lockedText]}>
            {spot.name}
          </Text>
          <Text style={styles.spotDescription}>{spot.description}</Text>
        </View>
        {isSelected && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedBadgeText}>ACTIVE</Text>
          </View>
        )}
        {isLocked && (
          <View style={styles.lockBadge}>
            <Text style={styles.lockBadgeText}>
              {isLevelLocked ? `Lvl ${spot.levelRequired}` : requiredRod?.name ?? 'Rod Required'}
            </Text>
          </View>
        )}
      </View>

      {isRodLocked && requiredRod && (
        <Text style={styles.requirementText}>
          Buy the {requiredRod.name} from the shopkeeper to fish here.
        </Text>
      )}

      {!isLocked && (
        <View style={styles.statsRow}>
          <Stat label="XP" value={spot.baseXpPerAction} />
          <Stat label="Speed" value={`${(spot.ticksPerAction / 10).toFixed(1)}s`} />
          <Stat label="Catch" value={spot.resourceProduced.replace(/^raw_/, '').replace(/_/g, ' ')} />
        </View>
      )}
    </TouchableOpacity>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
    zIndex: 100,
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    width: '100%',
    maxHeight: '80%',
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  closeButton: {
    padding: spacing.sm,
  },
  closeButtonText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  spotList: {
    maxHeight: 400,
  },
  spotCard: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  lockedCard: {
    opacity: 0.5,
    backgroundColor: colors.surface,
  },
  selectedCard: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceLight,
  },
  spotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  spotIcon: {
    fontSize: fontSize.xxl,
    marginRight: spacing.sm,
  },
  spotInfo: {
    flex: 1,
  },
  spotName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  spotDescription: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  lockedText: {
    color: colors.textMuted,
  },
  selectedBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
    marginLeft: spacing.sm,
  },
  selectedBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  lockBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
    marginLeft: spacing.sm,
  },
  lockBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
  },
  requirementText: {
    fontSize: fontSize.xs,
    color: colors.warning,
    marginBottom: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.surface,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
});
