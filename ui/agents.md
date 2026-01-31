# UI Module

React components and screens. This is the **view layer** that renders game state.

## Philosophy

- UI is a **pure function of state**: `render(gameState) → UI`
- Components read from `GameContext` via hooks
- Actions dispatch to reducer, never mutate directly
- Keep components small and focused

## Subfolders

| Folder | Purpose |
|--------|---------|
| `components/` | Reusable UI building blocks |
| `screens/` | Full-screen views (used by routes) |
| `providers/` | React Context providers |

## Component Hierarchy

```
providers/
  └── GameProvider          # Wraps entire app
screens/
  ├── DashboardScreen       # Main game view
  ├── SkillsScreen          # Skill management
  └── SettingsScreen        # Save/reset options
components/
  ├── common/               # Generic primitives
  ├── game/                 # Game-specific widgets
  └── layout/               # Layout helpers
```

## Import Pattern

```typescript
import { DashboardScreen } from '@/ui/screens';
import { Card, ProgressBar } from '@/ui/components';
import { GameProvider } from '@/ui/providers';
```

## State Access

Components use hooks from `@/hooks`:
```typescript
const { state, setActiveSkill } = useGame();
```

## Rules

1. **No game logic** in components - import from `@/game`
2. **No direct state mutation** - use dispatch/actions
3. **Keep styling colocated** with `StyleSheet.create()`
4. **Use theme constants** from `@/constants/theme`
