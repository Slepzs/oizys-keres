import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Modal, PanResponder, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { colors, borderRadius, fontSize, fontWeight, spacing } from '@/constants/theme';
import { ITEM_DEFINITIONS } from '@/game/data';
import type { ItemId, ItemRarity } from '@/game/types/items';

interface PackRevealModalProps {
  visible: boolean;
  packName: string;
  rolls: ItemId[];
  onClose: () => void;
}

interface RollSummaryEntry {
  itemId: ItemId;
  quantity: number;
}

const SWIPE_THRESHOLD = 80;
const SWIPE_EXIT_DISTANCE = 320;

function getRarityColor(rarity: ItemRarity): string {
  switch (rarity) {
    case 'uncommon':
      return colors.success;
    case 'rare':
      return colors.primary;
    case 'epic':
      return colors.rarityEpic;
    case 'common':
    default:
      return colors.textSecondary;
  }
}

export function PackRevealModal({ visible, packName, rolls, onClose }: PackRevealModalProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const [revealedCount, setRevealedCount] = useState(0);

  const totalRolls = rolls.length;
  const currentItemId = revealedCount < totalRolls ? rolls[revealedCount] : null;
  const isComplete = totalRolls > 0 && revealedCount >= totalRolls;

  useEffect(() => {
    if (!visible) {
      return;
    }

    setRevealedCount(0);
    translateX.setValue(0);
  }, [visible, rolls, translateX]);

  const revealedRolls = useMemo(() => {
    return rolls.slice(0, revealedCount);
  }, [rolls, revealedCount]);

  const summaryEntries = useMemo<RollSummaryEntry[]>(() => {
    const source = isComplete ? rolls : revealedRolls;
    const counts = new Map<ItemId, number>();

    for (const itemId of source) {
      counts.set(itemId, (counts.get(itemId) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([itemId, quantity]) => ({ itemId, quantity }))
      .sort((a, b) => {
        if (b.quantity !== a.quantity) {
          return b.quantity - a.quantity;
        }

        const itemA = ITEM_DEFINITIONS[a.itemId];
        const itemB = ITEM_DEFINITIONS[b.itemId];
        const nameA = itemA?.name ?? a.itemId;
        const nameB = itemB?.name ?? b.itemId;
        return nameA.localeCompare(nameB);
      });
  }, [isComplete, rolls, revealedRolls]);

  const revealCurrentItem = useCallback(
    (direction: 1 | -1) => {
      if (!currentItemId) {
        return;
      }

      Animated.timing(translateX, {
        toValue: direction * SWIPE_EXIT_DISTANCE,
        duration: 170,
        useNativeDriver: true,
      }).start(() => {
        translateX.setValue(0);
        setRevealedCount((prev) => Math.min(totalRolls, prev + 1));
      });
    },
    [currentItemId, totalRolls, translateX]
  );

  const resetCardPosition = useCallback(() => {
    Animated.spring(translateX, {
      toValue: 0,
      bounciness: 8,
      useNativeDriver: true,
    }).start();
  }, [translateX]);

  const panResponder = useMemo(() => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 6 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (Math.abs(gestureState.dx) >= SWIPE_THRESHOLD) {
          revealCurrentItem(gestureState.dx > 0 ? 1 : -1);
          return;
        }

        resetCardPosition();
      },
      onPanResponderTerminate: () => {
        resetCardPosition();
      },
      onPanResponderTerminationRequest: () => true,
    });
  }, [revealCurrentItem, resetCardPosition, translateX]);

  const cardRotation = useMemo(() => {
    return translateX.interpolate({
      inputRange: [-200, 0, 200],
      outputRange: ['-8deg', '0deg', '8deg'],
    });
  }, [translateX]);

  const handleTopRightAction = useCallback(() => {
    if (isComplete) {
      onClose();
      return;
    }

    revealCurrentItem(1);
  }, [isComplete, onClose, revealCurrentItem]);

  if (!visible) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
          <Card style={styles.modalCard}>
            <View style={styles.topActions}>
              <Button
                title={isComplete ? 'Close' : 'Reveal'}
                onPress={handleTopRightAction}
                variant="secondary"
                size="sm"
                style={styles.topActionButton}
              />
            </View>

            <Text style={styles.title}>{packName}</Text>
            <Text style={styles.subtitle}>
              {isComplete
                ? 'All pulls revealed'
                : `Swipe to reveal pull ${Math.min(revealedCount + 1, totalRolls)} / ${totalRolls}`}
            </Text>

            {!isComplete && currentItemId && (
              <Animated.View
                style={[
                  styles.sealedCard,
                  {
                    transform: [{ translateX }, { rotate: cardRotation }],
                  },
                ]}
                {...panResponder.panHandlers}
              >
                <Text style={styles.sealedIcon}>🎁</Text>
                <Text style={styles.sealedTitle}>Sealed Pull</Text>
                <Text style={styles.sealedHint}>Swipe left or right to reveal</Text>
              </Animated.View>
            )}

            {summaryEntries.length > 0 && (
              <View style={styles.summarySection}>
                <Text style={styles.summaryTitle}>{isComplete ? 'Pack Summary' : 'Revealed So Far'}</Text>
                {summaryEntries.map(({ itemId, quantity }) => {
                  const item = ITEM_DEFINITIONS[itemId];
                  return (
                    <Text
                      key={itemId}
                      style={[
                        styles.summaryLine,
                        { color: item ? getRarityColor(item.rarity) : colors.textSecondary },
                      ]}
                    >
                      {item?.icon ?? '•'} {item?.name ?? itemId} x{quantity}
                    </Text>
                  );
                })}
              </View>
            )}

            {isComplete ? (
              <Button title="Done" onPress={onClose} style={styles.doneButton} />
            ) : (
              <Text style={styles.footerHint}>
                Keep swiping until all {totalRolls} pulls are revealed.
              </Text>
            )}
          </Card>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  modalCard: {
    borderWidth: 1,
    borderColor: colors.surfaceLight,
  },
  modalContent: {
    zIndex: 1,
  },
  topActions: {
    alignItems: 'flex-end',
    marginBottom: spacing.xs,
  },
  topActionButton: {
    minWidth: 76,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: spacing.xs,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  sealedCard: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceLight,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  sealedIcon: {
    fontSize: 42,
    marginBottom: spacing.sm,
  },
  sealedTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  sealedHint: {
    marginTop: spacing.xs,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  summarySection: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  summaryTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  summaryLine: {
    fontSize: fontSize.sm,
  },
  footerHint: {
    marginTop: spacing.md,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
  },
  doneButton: {
    marginTop: spacing.md,
  },
});
