import { Stack } from 'expo-router';
import { StatsScreen } from '@/ui/screens';
import { colors } from '@/constants/theme';

export default function StatsRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Stats',
          headerShown: true,
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
        }}
      />
      <StatsScreen />
    </>
  );
}
