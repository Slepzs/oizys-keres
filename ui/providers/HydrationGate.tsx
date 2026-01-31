import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useIsHydrated } from '@/store';
import { colors } from '@/constants/theme';

interface HydrationGateProps {
  children: React.ReactNode;
}

/**
 * Gates rendering until the Zustand store has been hydrated from MMKV.
 * Shows a loading spinner while waiting.
 */
export function HydrationGate({ children }: HydrationGateProps) {
  const isHydrated = useIsHydrated();

  if (!isHydrated) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
