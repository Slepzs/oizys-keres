---
applyTo: '**'
---

# Coding Preferences
- TypeScript with strict mode enabled
- Pure functions for game logic (no classes)
- Functional React components only
- Use `@/` path alias for imports
- Use pnpm as package manager

# Project Architecture
- `/game` - Pure game logic (no React dependencies)
- `/ui` - React UI layer
- `/app` - Expo Router routes only (thin wrappers)
- `/hooks` - Custom React hooks
- `/services` - Side effects (storage, etc.)
- Save system uses single JSON blob with version migrations

# Solutions Repository
- XP curves use polynomial scaling
- Tick-based game loop with deterministic offline progress
- Seeded RNG for reproducibility
