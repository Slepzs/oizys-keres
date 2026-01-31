# Services

Side-effect modules for I/O operations.

## Philosophy

- Services handle **external interactions** (storage, network, etc.)
- Pure functions - no React dependencies
- Can be mocked for testing

## mmkv-storage.ts

MMKV wrapper for game persistence. Synchronous and ~30x faster than AsyncStorage.

```typescript
import { storage, zustandStorage, hasSaveSync, clearStorageSync } from '@/services';

// Direct MMKV access
storage.set('key', 'value');
storage.getString('key');
storage.remove('key');

// Zustand adapter (used by store)
zustandStorage.getItem(name)
zustandStorage.setItem(name, value)
zustandStorage.removeItem(name)

// Helpers
hasSaveSync()       // Check if save exists
clearStorageSync()  // Clear all storage
```

Storage ID: `oizys-keres-game`

## Why MMKV over AsyncStorage?

| Feature | MMKV | AsyncStorage |
|---------|------|--------------|
| Speed | ~30x faster | Baseline |
| API | Synchronous | Async only |
| Size limit | Unlimited | ~6MB |
| Encryption | Built-in | None |

## Future Services (Planned)

| Service | Purpose |
|---------|---------|
| `analytics.ts` | Track events (optional) |
| `cloudSync.ts` | Backend save sync (if added) |
| `notifications.ts` | Local push notifications |

## Usage Pattern

Storage is primarily used by the Zustand store, not directly by hooks:

```typescript
// In store/gameStore.ts
import { zustandStorage } from '@/services/mmkv-storage';

persist(storeConfig, {
  storage: createJSONStorage(() => zustandStorage),
})
```

For manual saves (e.g., useSave hook):
```typescript
import { storage } from '@/services/mmkv-storage';
storage.set('manual-save', json);
```

## Rules

1. No React imports - services are framework-agnostic
2. MMKV is synchronous - no async/await needed
3. Handle errors gracefully (log, don't throw to UI)
