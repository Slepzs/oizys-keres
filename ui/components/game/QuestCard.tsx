import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ProgressBar } from '../common/ProgressBar';
import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import type { QuestDefinition, PlayerQuestState, Objective } from '@/game/types';
import { getObjectiveProgress, getQuestProgress } from '@/game/logic';

interface QuestCardProps {
  definition: QuestDefinition;
  state?: PlayerQuestState;
  progress?: number;
  isComplete?: boolean;
  variant: 'available' | 'active' | 'claim' | 'completed';
  onStart?: () => void;
  onClaim?: () => void;
  onAbandon?: () => void;
  completedAt?: number;
  completedCount?: number;
}

export function QuestCard({
  definition,
  state,
  progress = 0,
  isComplete = false,
  variant,
  onStart,
  onClaim,
  onAbandon,
  completedAt,
  completedCount,
}: QuestCardProps) {
  const getCategoryColor = () => {
    switch (definition.category) {
      case 'main':
        return colors.primary;
      case 'daily':
        return colors.warning;
      case 'skill':
        return colors.success;
      case 'exploration':
        return colors.rarityEpic;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.icon}>{definition.icon}</Text>
        <View style={styles.titleContainer}>
          <Text style={styles.name}>{definition.name}</Text>
          {definition.category && (
            <Text style={[styles.category, { color: getCategoryColor() }]}>
              {definition.category.toUpperCase()}
            </Text>
          )}
        </View>
        {isComplete && variant === 'claim' && (
          <View style={styles.completeBadge}>
            <Text style={styles.completeBadgeText}>COMPLETE</Text>
          </View>
        )}
        {variant === 'completed' && (
          <View style={[styles.completeBadge, { backgroundColor: colors.textMuted }]}>
            <Text style={styles.completeBadgeText}>DONE</Text>
          </View>
        )}
      </View>

      <Text style={styles.description}>{definition.description}</Text>

      {/* Objectives */}
      {state && (
        <View style={styles.objectivesContainer}>
          {definition.objectives.map((objective) => (
            <ObjectiveRow
              key={objective.id}
              objective={objective}
              current={state.progress[objective.id] ?? 0}
            />
          ))}
        </View>
      )}

      {/* Progress bar for active quests */}
      {variant === 'active' && (
        <View style={styles.progressContainer}>
          <ProgressBar
            progress={progress}
            color={isComplete ? colors.success : colors.primary}
          />
          <Text style={styles.progressText}>
            {Math.round(progress * 100)}%
          </Text>
        </View>
      )}

      {/* Rewards preview */}
      <View style={styles.rewardsContainer}>
        <Text style={styles.rewardsLabel}>Rewards:</Text>
        <View style={styles.rewardsList}>
          {definition.rewards.map((reward, index) => (
            <Text key={index} style={styles.rewardItem}>
              {formatReward(reward)}
            </Text>
          ))}
        </View>
      </View>

      {/* Completion info for completed quests */}
      {variant === 'completed' && completedAt && (
        <View style={styles.completedInfoContainer}>
          <Text style={styles.completedInfoText}>
            Completed: {new Date(completedAt).toLocaleDateString()}
          </Text>
          {completedCount && completedCount > 1 && (
            <Text style={styles.completedCountText}>
              Completed {completedCount} times
            </Text>
          )}
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.actionsContainer}>
        {variant === 'available' && onStart && (
          <Button title="Start Quest" onPress={onStart} size="sm" />
        )}
        {variant === 'claim' && onClaim && (
          <Button title="Claim Rewards" onPress={onClaim} size="sm" />
        )}
        {variant === 'active' && onAbandon && (
          <Button
            title="Abandon"
            onPress={onAbandon}
            variant="ghost"
            size="sm"
          />
        )}
      </View>
    </Card>
  );
}

interface ObjectiveRowProps {
  objective: Objective;
  current: number;
}

function ObjectiveRow({ objective, current }: ObjectiveRowProps) {
  const { target, complete } = getObjectiveProgress(objective, current);
  const displayCurrent = Math.min(current, target);

  return (
    <View style={styles.objectiveRow}>
      <Text style={[styles.objectiveText, complete && styles.objectiveComplete]}>
        {formatObjective(objective)}: {displayCurrent}/{target}
      </Text>
      {complete && <Text style={styles.checkmark}>✓</Text>}
    </View>
  );
}

function formatObjective(objective: Objective): string {
  switch (objective.type) {
    case 'gain_xp':
      return `Gain ${objective.target} XP`;
    case 'gain_resource':
      return `Gather ${objective.target}`;
    case 'collect_item':
      return `Collect ${objective.target}`;
    case 'reach_level':
      return `Reach ${objective.target} level`;
    case 'timer':
      return 'Wait';
    case 'kill':
      return `Defeat ${objective.target}`;
    case 'craft':
      return `Craft ${objective.target}`;
    default:
      return 'Unknown objective';
  }
}

function formatReward(reward: {
  type: string;
  skill?: string;
  amount?: number;
  resource?: string;
  itemId?: string;
  quantity?: number;
}): string {
  switch (reward.type) {
    case 'xp':
      return `+${reward.amount} ${reward.skill} XP`;
    case 'player_xp':
      return `+${reward.amount} Player XP`;
    case 'resource':
      return `+${reward.amount} ${reward.resource}`;
    case 'item':
      return `+${reward.quantity} ${reward.itemId}`;
    default:
      return 'Unknown reward';
  }
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
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
  category: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    marginTop: 2,
  },
  completeBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
  },
  completeBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  objectivesContainer: {
    marginBottom: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
  },
  objectiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  objectiveText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  objectiveComplete: {
    color: colors.success,
  },
  checkmark: {
    fontSize: fontSize.md,
    color: colors.success,
    marginLeft: spacing.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  progressText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    minWidth: 40,
    textAlign: 'right',
  },
  rewardsContainer: {
    marginBottom: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
  },
  rewardsLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  rewardsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  rewardItem: {
    fontSize: fontSize.sm,
    color: colors.success,
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  completedInfoContainer: {
    marginBottom: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceLight,
  },
  completedInfoText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  completedCountText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
