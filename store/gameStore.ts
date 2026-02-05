import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { GameContext, GameState } from '@/game/types';
import { AUTO_SAVE_INTERVAL_MS } from '@/game/data';
import {
  createInitialGameState,
  createInitialNotificationsState,
  jsonToState,
  repairGameState,
  serializeState,
  saveToJson,
} from '@/game/save';
import { processOfflineProgress } from '@/game/logic';
import { registerGameModules } from '@/game/modules';
import { eventBus, setNotificationCallback } from '@/game/systems';
import { storage } from '@/services/mmkv-storage';
import type { StoreHelpers } from './slices/types';
import { createTickSlice, type TickSlice } from './slices/tickSlice';
import { createPersistenceSlice, type PersistenceSlice } from './slices/persistenceSlice';
import { createInventorySlice, type InventorySlice } from './slices/inventorySlice';
import { createQuestsSlice, type QuestsSlice } from './slices/questsSlice';
import { createCombatSlice, type CombatSlice } from './slices/combatSlice';
import { createNotificationsSlice, type NotificationsSlice } from './slices/notificationsSlice';
import { createSkillsSlice, type SkillsSlice } from './slices/skillsSlice';
import { createAdminSlice, type AdminSlice } from './slices/adminSlice';
import { createShopSlice, type ShopSlice } from './slices/shopSlice';
import { createCraftingSlice, type CraftingSlice } from './slices/craftingSlice';

const AUTO_SAVE_KEY = 'game-save';
const LEGACY_ZUSTAND_PERSIST_KEY = 'game-storage';

let notificationIdCounter = 0;

function nextNotificationId(now: number): string {
  notificationIdCounter = (notificationIdCounter + 1) % 1_000_000;
  return `${now}-${notificationIdCounter}`;
}

// Register game modules (quests, achievements, notifications, etc.)
registerGameModules();

interface HydrationState {
  isHydrated: boolean;
}

export type GameActions =
  & TickSlice
  & PersistenceSlice
  & InventorySlice
  & QuestsSlice
  & CombatSlice
  & NotificationsSlice
  & SkillsSlice
  & ShopSlice
  & CraftingSlice
  & AdminSlice;

export type GameStore = GameState & GameActions & HydrationState;

function createRngSeed(): number {
  return Math.floor(Math.random() * 2147483647) || 1;
}

function loadPersistedGameState(now: number, fallback: GameState): GameState {
  const json = storage.getString(AUTO_SAVE_KEY);
  if (json) {
    const result = jsonToState(json, { now });
    if (result.success) {
      return result.state;
    }
  }

  const legacyJson = storage.getString(LEGACY_ZUSTAND_PERSIST_KEY);
  if (legacyJson) {
    try {
      const parsed = JSON.parse(legacyJson) as { state?: Partial<GameState> } | null;
      if (parsed?.state && typeof parsed.state === 'object') {
        return repairGameState(parsed.state, { now });
      }
    } catch {
      // ignore
    }
  }

  return fallback;
}

function persistGameState(gameState: GameState, now: number): void {
  const persistable: GameState = {
    ...gameState,
    notifications: createInitialNotificationsState(),
  };
  const save = serializeState(persistable, { now });
  storage.set(AUTO_SAVE_KEY, saveToJson(save));
}

function maybeAutoSave(gameState: GameState, now: number): GameState {
  if (now - gameState.timestamps.lastSave < AUTO_SAVE_INTERVAL_MS) {
    return gameState;
  }

  persistGameState(gameState, now);
  return {
    ...gameState,
    timestamps: {
      ...gameState.timestamps,
      lastSave: now,
    },
  };
}

function getGameContext(now: number): GameContext {
  return { now };
}

function getGameStateSnapshot(store: GameStore): GameState {
  return {
    player: store.player,
    skills: store.skills,
    attributes: store.attributes,
    skillStats: store.skillStats,
    resources: store.resources,
    bag: store.bag,
    bagSettings: store.bagSettings,
    quests: store.quests,
    achievements: store.achievements,
    multipliers: store.multipliers,
    crafting: store.crafting,
    combat: store.combat,
    timestamps: store.timestamps,
    activeSkill: store.activeSkill,
    rngSeed: store.rngSeed,
    notifications: store.notifications,
  };
}

export function getCurrentGameState(): GameState {
  return getGameStateSnapshot(useGameStore.getState());
}

export const useGameStore = create<GameStore>()((set, get) => {
  const bootNow = Date.now();
  const fresh = createInitialGameState({ now: bootNow, rngSeed: createRngSeed() });
  const loaded = loadPersistedGameState(bootNow, fresh);

  const offlineResult = processOfflineProgress(loaded, bootNow);
  const afterOffline = eventBus.dispatch(offlineResult.events, offlineResult.state, getGameContext(bootNow));

  // Wire notifications to this store instance after it exists to avoid circular deps.
  setTimeout(() => {
    const store = useGameStore.getState();
    if (store) {
      setNotificationCallback((type, title, message, options) => {
        store.addNotification(type, title, message, options);
      });
    }
  }, 0);

  const helpers: StoreHelpers = {
    getGameContext,
    getGameStateSnapshot,
    persistGameState,
    maybeAutoSave,
    createRngSeed,
    nextNotificationId,
  };

  return {
    ...afterOffline,
    isHydrated: true,
    ...createTickSlice(set, get, helpers),
    ...createPersistenceSlice(set, get, helpers),
    ...createSkillsSlice(set, get, helpers),
    ...createInventorySlice(set, get, helpers),
    ...createQuestsSlice(set, get, helpers),
    ...createCombatSlice(set, get, helpers),
    ...createNotificationsSlice(set, get, helpers),
    ...createShopSlice(set, get, helpers),
    ...createCraftingSlice(set, get, helpers),
    ...createAdminSlice(set, get, helpers),
  };
});

// Selector hooks for performance optimization
export const usePlayer = () => useGameStore((state) => state.player);
export const useSkills = () => useGameStore((state) => state.skills);
export const useResources = () => useGameStore((state) => state.resources);
export const useBag = () => useGameStore((state) => state.bag);
export const useBagSettings = () => useGameStore((state) => state.bagSettings);
export const useQuests = () => useGameStore((state) => state.quests);
export const useAchievements = () => useGameStore((state) => state.achievements);
export const useMultipliers = () => useGameStore((state) => state.multipliers);
export const useCrafting = () => useGameStore((state) => state.crafting);
export const useCombat = () => useGameStore((state) => state.combat);
export const useActiveSkill = () => useGameStore((state) => state.activeSkill);
export const useIsHydrated = () => useGameStore((state) => state.isHydrated);
export const useNotifications = () => useGameStore((state) => state.notifications);

// Actions (stable references, no re-renders)
export const useGameActions = () =>
  useGameStore(
    useShallow((state) => ({
      tick: state.tick,
      applyOfflineProgress: state.applyOfflineProgress,
      flushSave: state.flushSave,
      setActiveSkill: state.setActiveSkill,
      toggleAutomation: state.toggleAutomation,
      addItem: state.addItem,
      removeItem: state.removeItem,
      discardSlot: state.discardSlot,
      sellSlot: state.sellSlot,
      sellAll: state.sellAll,
      sortBag: state.sortBag,
      consolidateBag: state.consolidateBag,
      toggleAutoSort: state.toggleAutoSort,
      setSortMode: state.setSortMode,
      setActiveBagTab: state.setActiveBagTab,
      toggleSlotLock: state.toggleSlotLock,
      expandBag: state.expandBag,
      buyShopOffer: state.buyShopOffer,
      craftRecipe: state.craftRecipe,
      setAutoCraftRecipe: state.setAutoCraftRecipe,
      clearAutoCraftRecipe: state.clearAutoCraftRecipe,
      startQuest: state.startQuest,
      abandonQuest: state.abandonQuest,
      claimQuestRewards: state.claimQuestRewards,
      // Combat actions
      startCombat: state.startCombat,
      fleeCombat: state.fleeCombat,
      setTrainingMode: state.setTrainingMode,
      toggleAutoFight: state.toggleAutoFight,
      equipItem: state.equipItem,
      unequipSlot: state.unequipSlot,
      selectZone: state.selectZone,
      loadSave: state.loadSave,
      reset: state.reset,
      setActiveTree: state.setActiveTree,
      // Notification actions
      addNotification: state.addNotification,
      removeNotification: state.removeNotification,
      clearNotifications: state.clearNotifications,
      // Admin actions
      addItemToBag: state.addItemToBag,
      clearBag: state.clearBag,
      setPlayerLevel: state.setPlayerLevel,
      setPlayerXp: state.setPlayerXp,
      setSkillLevel: state.setSkillLevel,
      setSkillXp: state.setSkillXp,
      unlockSkillAutomation: state.unlockSkillAutomation,
      setCombatSkillXp: state.setCombatSkillXp,
      setPlayerHealth: state.setPlayerHealth,
      unlockAllAutomation: state.unlockAllAutomation,
      maxAllSkills: state.maxAllSkills,
    }))
  );
