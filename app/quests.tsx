import { Stack, useLocalSearchParams } from 'expo-router';
import { ProgressScreen } from '@/ui/screens';
import { colors } from '@/constants/theme';

export default function QuestsRoute() {
  const params = useLocalSearchParams<{ questId?: string | string[] }>();
  const questId = Array.isArray(params.questId) ? params.questId[0] : params.questId;

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
      <ProgressScreen initialTab="quests" initialQuestId={questId} />
    </>
  );
}
