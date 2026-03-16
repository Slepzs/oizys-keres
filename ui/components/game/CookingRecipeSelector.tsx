import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, fontSize, fontWeight, spacing } from '@/constants/theme';
import { COOKING_RECIPES } from '@/game/data';
import type { CookingRecipe } from '@/game/data/cooking-recipes.data';
import type { CookingRecipeId } from '@/game/types';

interface CookingRecipeSelectorProps {
  currentLevel: number;
  activeCookingRecipeId: CookingRecipeId | undefined;
  onSelectRecipe: (recipeId: CookingRecipeId) => void;
  onClose: () => void;
}

export function CookingRecipeSelector({
  currentLevel,
  activeCookingRecipeId,
  onSelectRecipe,
  onClose,
}: CookingRecipeSelectorProps) {
  const recipes = Object.values(COOKING_RECIPES);

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Recipe</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>Cooking Level: {currentLevel}</Text>

        <ScrollView style={styles.recipeList}>
          {recipes.map((recipe) => {
            const isLocked = currentLevel < recipe.cookingLevelRequired;
            const isSelected = activeCookingRecipeId === recipe.id;

            return (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isLocked={isLocked}
                isSelected={isSelected}
                onPress={() => {
                  if (!isLocked) {
                    onSelectRecipe(recipe.id);
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

interface RecipeCardProps {
  recipe: CookingRecipe;
  isLocked: boolean;
  isSelected: boolean;
  onPress: () => void;
}

function RecipeCard({ recipe, isLocked, isSelected, onPress }: RecipeCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLocked}
      style={[
        styles.recipeCard,
        isLocked && styles.lockedCard,
        isSelected && styles.selectedCard,
      ]}
    >
      <View style={styles.recipeHeader}>
        <Text style={styles.recipeIcon}>{recipe.icon}</Text>
        <View style={styles.recipeInfo}>
          <Text style={[styles.recipeName, isLocked && styles.lockedText]}>
            {recipe.name}
          </Text>
          <Text style={styles.recipeDescription}>{recipe.description}</Text>
        </View>
        {isSelected && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedBadgeText}>ACTIVE</Text>
          </View>
        )}
        {isLocked && (
          <View style={styles.lockBadge}>
            <Text style={styles.lockBadgeText}>Lvl {recipe.cookingLevelRequired}</Text>
          </View>
        )}
      </View>

      {!isLocked && (
        <View style={styles.statsRow}>
          <Stat label="XP" value={recipe.xpPerAction} />
          <Stat label="Speed" value={`${(recipe.ticksPerAction / 10).toFixed(1)}s`} />
          <Stat label="Input" value={recipe.inputResourceId.replace(/^raw_/, '').replace(/_/g, ' ')} />
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
  recipeList: {
    maxHeight: 400,
  },
  recipeCard: {
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
  recipeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  recipeIcon: {
    fontSize: fontSize.xxl,
    marginRight: spacing.sm,
  },
  recipeInfo: {
    flex: 1,
  },
  recipeName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  recipeDescription: {
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
