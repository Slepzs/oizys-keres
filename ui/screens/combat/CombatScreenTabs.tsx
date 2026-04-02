import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, spacing, borderRadius } from '@/constants/theme';
import { RpgIcon } from '@/ui/components/common';

import type { CombatScreenViewId } from '../combat-screen.sections';

interface CombatScreenTabsProps {
  activeView: CombatScreenViewId;
  views: CombatScreenViewId[];
  onChange: (view: CombatScreenViewId) => void;
}

const TAB_META: Record<
  CombatScreenViewId,
  {
    icon: string;
    fallback: string;
    accessibilityLabel: string;
  }
> = {
  'combat-profile': {
    icon: 'player',
    fallback: '🧍',
    accessibilityLabel: 'Combat profile',
  },
  'hunt-setup': {
    icon: 'axe',
    fallback: '🪓',
    accessibilityLabel: 'Hunt setup',
  },
  'battle-feed': {
    icon: 'broadsword',
    fallback: '⚔️',
    accessibilityLabel: 'Battle feed',
  },
};

export function CombatScreenTabs({
  activeView,
  views,
  onChange,
}: CombatScreenTabsProps) {
  return (
    <View style={styles.container}>
      {views.map((view) => {
        const meta = TAB_META[view];
        const isActive = view === activeView;

        return (
          <Pressable
            key={view}
            style={({ pressed }) => [
              styles.tab,
              isActive && styles.activeTab,
              pressed && styles.pressedTab,
            ]}
            onPress={() => onChange(view)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={meta.accessibilityLabel}
          >
            <RpgIcon
              name={meta.icon}
              fallback={meta.fallback}
              size={18}
              color={isActive ? colors.text : colors.textMuted}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.surfaceLight,
    backgroundColor: colors.surface,
  },
  activeTab: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryDark,
  },
  pressedTab: {
    opacity: 0.85,
  },
});
