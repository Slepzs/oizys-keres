import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { HydrationGate, TickManager } from '@/ui/providers';
import { NotificationContainer } from '@/ui/components/game';
import { colors } from '@/constants/theme';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <HydrationGate>
          <TickManager />
          <NotificationContainer />
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          />
        </HydrationGate>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
