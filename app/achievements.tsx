import { Stack } from 'expo-router';
import { AchievementsScreen } from '@/ui/screens';
import { colors } from '@/constants/theme';

export default function AchievementsRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Achievements',
          headerShown: true,
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
        }}
      />
      <AchievementsScreen />
    </>
  );
}
