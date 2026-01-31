# UI Components

Reusable React Native components organized by purpose.

## Subfolders

| Folder | Purpose |
|--------|---------|
| `common/` | Generic primitives (buttons, cards, progress bars) |
| `game/` | Game-specific widgets (skill cards, resource counters) |
| `layout/` | Layout helpers (safe area containers) |

## Common Components

| Component | Purpose |
|-----------|---------|
| `Button` | Themed button with variants (primary, secondary, ghost) |
| `Card` | Container with background and optional press handler |
| `ProgressBar` | Horizontal bar showing 0-1 progress |
| `NumberDisplay` | Formatted number with optional label |

## Game Components

| Component | Purpose |
|-----------|---------|
| `SkillCard` | Full skill display with level, XP bar, automation status |
| `SkillProgressBar` | XP progress for a skill |
| `ResourceCounter` | Icon + amount for a resource |

## Layout Components

| Component | Purpose |
|-----------|---------|
| `SafeContainer` | Screen wrapper with safe area insets |

## Styling Pattern

All components use `StyleSheet.create()` and theme tokens:

```typescript
import { colors, spacing, fontSize } from '@/constants/theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
});
```

## Adding Components

1. Create in appropriate subfolder
2. Export from subfolder's `index.ts`
3. Flows up through `@/ui/components`
