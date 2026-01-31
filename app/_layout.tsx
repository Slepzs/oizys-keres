import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { HydrationGate, TickManager } from '@/ui/providers';
import { colors } from '@/constants/theme';

export default function RootLayout() {
  return (
    <HydrationGate>
      <TickManager />
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </HydrationGate>
  );
}
