# UI Providers

React components that manage global concerns (tick loop, hydration gate).

## Components

| Component | Purpose |
|-----------|---------|
| `HydrationGate` | Gates render until Zustand store is hydrated |
| `TickManager` | Runs the game tick loop |

## HydrationGate

Prevents rendering until game state is loaded from MMKV storage.

```typescript
<HydrationGate>
  {/* Children only render after hydration */}
  <TickManager />
  <Stack />
</HydrationGate>
```

### What It Does

1. Subscribes to `isHydrated` from Zustand store
2. Shows loading spinner while `isHydrated === false`
3. Renders children once store is ready

### Why Needed

MMKV is synchronous, but Zustand's persist middleware still uses an async rehydration pattern. Without the gate, components would briefly see initial state before saved state loads.

## TickManager

Runs the game tick loop. Renders nothing (returns `null`).

```typescript
<TickManager />
```

### What It Does

1. Sets up `setInterval` at `TICK_RATE_MS` (100ms)
2. Calculates `deltaMs` since last tick
3. Calls store's `tick(deltaMs)` action
4. Cleans up interval on unmount

### Why a Component?

- React manages lifecycle (cleanup on unmount)
- Easy to conditionally render (pause when backgrounded)
- Co-located with other providers in layout

## Usage in Layout

```typescript
// app/_layout.tsx
export default function RootLayout() {
  return (
    <HydrationGate>
      <TickManager />
      <StatusBar style="light" />
      <Stack />
    </HydrationGate>
  );
}
```

## Migration Note

Previously used `GameProvider` with React Context + useReducer. Now replaced by:
- **State**: Zustand store (`@/store`)
- **Persistence**: MMKV via Zustand persist middleware
- **Tick loop**: `TickManager` component
- **Loading gate**: `HydrationGate` component

## Notes

- No Context needed - Zustand provides global state via hooks
- Offline progress processed in store's `onRehydrateStorage` callback
- Tick loop is external to store for React lifecycle management
