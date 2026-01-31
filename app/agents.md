# App (Routes)

Expo Router file-based routing. **Routes only** - no business logic.

## Philosophy

Per architecture plan:
- Routes are **thin wrappers** that import screens from `@/ui/screens`
- Keep this folder minimal
- All actual UI logic lives in `@/ui`

## Structure

```
app/
├── _layout.tsx      # Root layout with HydrationGate + TickManager
├── index.tsx        # Redirects to /(tabs)
└── (tabs)/          # Tab navigator group
    ├── _layout.tsx  # Tab bar config
    ├── index.tsx    # Dashboard tab
    ├── skills.tsx   # Skills tab
    └── settings.tsx # Settings tab
```

## Route Pattern

Each route file is minimal:

```typescript
// app/(tabs)/skills.tsx
import { SkillsScreen } from '@/ui/screens';

export default function SkillsTab() {
  return <SkillsScreen />;
}
```

## Root Layout

The `_layout.tsx` wraps the app with providers:

```typescript
import { HydrationGate, TickManager } from '@/ui/providers';

export default function RootLayout() {
  return (
    <HydrationGate>
      <TickManager />
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }} />
    </HydrationGate>
  );
}
```

### Provider Components

| Component | Purpose |
|-----------|---------|
| `HydrationGate` | Shows loading until Zustand store hydrates from MMKV |
| `TickManager` | Runs game tick loop (100ms intervals) |

Note: No Context provider needed - Zustand provides global state via hooks.

## Adding Routes

1. Create screen in `@/ui/screens/`
2. Create route file here that imports and renders it
3. Add to tab navigator if needed

## Future Routes

| Route | Purpose |
|-------|---------|
| `skill/[skillId].tsx` | Skill detail page (dynamic) |
| `(modals)/offline.tsx` | Offline progress modal |
