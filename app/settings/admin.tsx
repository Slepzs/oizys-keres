import { Stack } from 'expo-router';
import { AdminScreen } from '@/ui/screens';
import { colors } from '@/constants/theme';

export default function AdminRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Developer Tools',
          headerShown: true,
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
        }}
      />
      <AdminScreen />
    </>
  );
}
