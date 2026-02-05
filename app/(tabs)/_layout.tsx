import { Tabs } from 'expo-router';
import { colors, fontSize } from '@/constants/theme';
import { RpgIcon } from '@/ui/components/common';
import { CombatTabBar } from '@/ui/components/layout';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CombatTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.surfaceLight,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: fontSize.xs,
          marginBottom: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <RpgIcon name="player" fallback="🏠" size={18} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="skills"
        options={{
          title: 'Skills',
          tabBarIcon: ({ color }) => (
            <RpgIcon name="axe" fallback="🪓" size={18} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="crafting"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="combat"
        options={{
          title: 'Combat',
          tabBarIcon: ({ color }) => (
            <RpgIcon name="broadsword" fallback="⚔️" size={18} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="bag"
        options={{
          title: 'Bag',
          tabBarIcon: ({ color }) => (
            <RpgIcon name="ammo-bag" fallback="🎒" size={18} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <RpgIcon name="cog" fallback="⚙️" size={18} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
