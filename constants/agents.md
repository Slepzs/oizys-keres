# Constants

App-level constants for UI and configuration.

## theme.ts

Design tokens for consistent styling.

### Colors
```typescript
colors.background    // #0f0f0f - Main bg
colors.surface       // #1a1a1a - Card bg
colors.surfaceLight  // #252525 - Elevated bg
colors.text          // #ffffff
colors.textSecondary // #a0a0a0
colors.textMuted     // #666666
colors.primary       // #4a9eff - Accent blue
colors.success       // #4ade80 - Green
colors.warning       // #fbbf24 - Yellow
colors.error         // #f87171 - Red
```

### Spacing
```typescript
spacing.xs  // 4
spacing.sm  // 8
spacing.md  // 16
spacing.lg  // 24
spacing.xl  // 32
spacing.xxl // 48
```

### Typography
```typescript
fontSize.xs   // 10
fontSize.sm   // 12
fontSize.md   // 14
fontSize.lg   // 16
fontSize.xl   // 20
fontSize.xxl  // 24

fontWeight.normal   // '400'
fontWeight.medium   // '500'
fontWeight.semibold // '600'
fontWeight.bold     // '700'
```

## Usage

```typescript
import { colors, spacing, fontSize } from '@/constants/theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  text: {
    color: colors.text,
    fontSize: fontSize.md,
  },
});
```

## Note

Game-related constants (tick rate, XP values) are in `@/game/data/constants.ts`, not here. This file is for UI theming only.
