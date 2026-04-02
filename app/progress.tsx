import { Stack } from 'expo-router';

import { colors } from '@/constants/theme';
import { ProgressScreen } from '@/ui/screens';

export default function ProgressRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Progress',
          headerShown: true,
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
        }}
      />
      <ProgressScreen initialTab="completion" />
    </>
  );
}
