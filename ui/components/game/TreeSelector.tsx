import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Card } from '../common/Card';
import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { WOODCUTTING_TREES } from '@/game/data';
import type { TreeTier } from '@/game/data/tree-tiers.data';

interface TreeSelectorProps {
  currentLevel: number;
  activeTreeId: string | undefined;
  onSelectTree: (treeId: string) => void;
  onClose: () => void;
}

export function TreeSelector({ currentLevel, activeTreeId, onSelectTree, onClose }: TreeSelectorProps) {
  const trees = Object.values(WOODCUTTING_TREES);

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Tree</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          Woodcutting Level: {currentLevel}
        </Text>

        <ScrollView style={styles.treeList}>
          {trees.map((tree) => {
            const isLocked = currentLevel < tree.levelRequired;
            const isSelected = activeTreeId === tree.id;

            return (
              <TreeCard
                key={tree.id}
                tree={tree}
                isLocked={isLocked}
                isSelected={isSelected}
                onPress={() => {
                  if (!isLocked) {
                    onSelectTree(tree.id);
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

interface TreeCardProps {
  tree: TreeTier;
  isLocked: boolean;
  isSelected: boolean;
  onPress: () => void;
}

function TreeCard({ tree, isLocked, isSelected, onPress }: TreeCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLocked}
      style={[
        styles.treeCard,
        isLocked && styles.lockedCard,
        isSelected && styles.selectedCard,
      ]}
    >
      <View style={styles.treeHeader}>
        <Text style={styles.treeIcon}>{tree.icon}</Text>
        <View style={styles.treeInfo}>
          <Text style={[styles.treeName, isLocked && styles.lockedText]}>
            {tree.name}
          </Text>
          <Text style={styles.treeDescription}>{tree.description}</Text>
        </View>
        {isSelected && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedBadgeText}>ACTIVE</Text>
          </View>
        )}
        {isLocked && (
          <View style={styles.lockBadge}>
            <Text style={styles.lockBadgeText}>Lvl {tree.levelRequired}</Text>
          </View>
        )}
      </View>

      {!isLocked && (
        <View style={styles.statsRow}>
          <Stat label="XP" value={tree.baseXpPerAction} />
          <Stat label="Speed" value={`${(tree.ticksPerAction / 10).toFixed(1)}s`} />
          <Stat label="Resource" value={tree.resourceProduced.replace('_', ' ')} />
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
  treeList: {
    maxHeight: 400,
  },
  treeCard: {
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
  treeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  treeIcon: {
    fontSize: fontSize.xxl,
    marginRight: spacing.sm,
  },
  treeInfo: {
    flex: 1,
  },
  treeName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  treeDescription: {
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
