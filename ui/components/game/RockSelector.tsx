import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Card } from '../common/Card';
import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { MINING_ROCKS } from '@/game/data';
import type { RockTier } from '@/game/data/rock-tiers.data';

interface RockSelectorProps {
  currentLevel: number;
  activeRockId: string | undefined;
  onSelectRock: (rockId: string) => void;
  onClose: () => void;
}

export function RockSelector({ currentLevel, activeRockId, onSelectRock, onClose }: RockSelectorProps) {
  const rocks = Object.values(MINING_ROCKS);

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Rock</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          Mining Level: {currentLevel}
        </Text>

        <ScrollView style={styles.rockList}>
          {rocks.map((rock) => {
            const isLocked = currentLevel < rock.levelRequired;
            const isSelected = activeRockId === rock.id;

            return (
              <RockCard
                key={rock.id}
                rock={rock}
                isLocked={isLocked}
                isSelected={isSelected}
                onPress={() => {
                  if (!isLocked) {
                    onSelectRock(rock.id);
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

interface RockCardProps {
  rock: RockTier;
  isLocked: boolean;
  isSelected: boolean;
  onPress: () => void;
}

function RockCard({ rock, isLocked, isSelected, onPress }: RockCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLocked}
      style={[
        styles.rockCard,
        isLocked && styles.lockedCard,
        isSelected && styles.selectedCard,
      ]}
    >
      <View style={styles.rockHeader}>
        <Text style={styles.rockIcon}>{rock.icon}</Text>
        <View style={styles.rockInfo}>
          <Text style={[styles.rockName, isLocked && styles.lockedText]}>
            {rock.name}
          </Text>
          <Text style={styles.rockDescription}>{rock.description}</Text>
        </View>
        {isSelected && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedBadgeText}>ACTIVE</Text>
          </View>
        )}
        {isLocked && (
          <View style={styles.lockBadge}>
            <Text style={styles.lockBadgeText}>Lvl {rock.levelRequired}</Text>
          </View>
        )}
      </View>

      {!isLocked && (
        <View style={styles.statsRow}>
          <Stat label="XP" value={rock.baseXpPerAction} />
          <Stat label="Speed" value={`${(rock.ticksPerAction / 10).toFixed(1)}s`} />
          <Stat label="Resource" value={rock.resourceProduced.replace(/_/g, ' ')} />
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
  rockList: {
    maxHeight: 400,
  },
  rockCard: {
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
  rockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  rockIcon: {
    fontSize: fontSize.xxl,
    marginRight: spacing.sm,
  },
  rockInfo: {
    flex: 1,
  },
  rockName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  rockDescription: {
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
