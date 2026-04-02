import { Stack } from 'expo-router';
import { ProgressScreen } from '@/ui/screens';
import { colors } from '@/constants/theme';

export default function QuestsRoute() {
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
      <ProgressScreen initialTab="quests" />
    </>
  );
}
