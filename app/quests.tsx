import { Stack } from 'expo-router';
import { QuestsScreen } from '@/ui/screens';
import { colors } from '@/constants/theme';

export default function QuestsRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Quests',
          headerShown: true,
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
        }}
      />
      <QuestsScreen />
    </>
  );
}
