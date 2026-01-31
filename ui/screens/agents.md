# UI Screens

Full-screen views that compose components. These are imported by routes.

## Screens

| Screen | Route | Purpose |
|--------|-------|---------|
| `DashboardScreen` | `/(tabs)/` | Main game view with player, resources, skills |
| `SkillsScreen` | `/(tabs)/skills` | Detailed skill management |
| `SettingsScreen` | `/(tabs)/settings` | Save, stats, reset |

## Pattern

Screens are **content only** - no navigation chrome:

```typescript
export function DashboardScreen() {
  const { state, setActiveSkill } = useGame();
  useSave(); // Enable auto-save

  return (
    <SafeContainer>
      <ScrollView>
        {/* Content */}
      </ScrollView>
    </SafeContainer>
  );
}
```

Routes in `/app` are thin wrappers:

```typescript
// app/(tabs)/index.tsx
import { DashboardScreen } from '@/ui/screens';
export default function DashboardTab() {
  return <DashboardScreen />;
}
```

## Why Separate?

- Screens can be tested without router
- Same screen can be used in different routes
- Keeps `/app` folder minimal (Expo Router requirement)

## Adding Screens

1. Create `[Name]Screen.tsx` in this folder
2. Export from `index.ts`
3. Create route file in `/app` that imports and renders it
