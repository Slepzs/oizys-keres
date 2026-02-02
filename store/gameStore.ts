import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import type { GameState, SkillId, ItemId, TrainingMode, EquipmentSlot, SortMode, NotificationType, GameContext } from '@/game/types';
import { AUTO_SAVE_INTERVAL_MS, WOODCUTTING_TREES } from '@/game/data';
import { createInitialGameState, createInitialNotificationsState, jsonToState, repairGameState, serializeState, saveToJson } from '@/game/save';
import {
  processTick,
  processOfflineProgress,
  addItemToBag,
  removeItemFromBag,
  sortBag,
  consolidateStacks,
  expandBag,
  toggleSlotLock,
  discardSlot,
  applyQuestRewards,
  startQuest as startQuestLogic,
  abandonQuest as abandonQuestLogic,
  startCombat as startCombatLogic,
  fleeCombat as fleeCombatLogic,
  setTrainingMode as setTrainingModeLogic,
  toggleAutoFight as toggleAutoFightLogic,
  equipItem as equipItemLogic,
  unequipSlot as unequipSlotLogic,
  selectZone as selectZoneLogic,
  createNotification,
  addNotification,
  removeNotification,
  clearNotifications,
} from '@/game/logic';
import {
  eventBus,
  registerQuestHandlers,
  registerAchievementHandlers,
  registerNotificationHandlers,
  setNotificationCallback,
} from '@/game/systems';
import { storage } from '@/services/mmkv-storage';

const AUTO_SAVE_KEY = 'game-save';
const LEGACY_ZUSTAND_PERSIST_KEY = 'game-storage';
let notificationIdCounter = 0;

function nextNotificationId(now: number): string {
  notificationIdCounter = (notificationIdCounter + 1) % 1_000_000;
  return `${now}-${notificationIdCounter}`;
}

// Register event handlers once at module load
registerQuestHandlers();
registerAchievementHandlers();
registerNotificationHandlers();

interface GameActions {
  tick: (deltaMs: number, now: number) => void;
  applyOfflineProgress: (now: number) => void;
  flushSave: (now: number) => void;
  setActiveSkill: (skillId: SkillId | null) => void;
  toggleAutomation: (skillId: SkillId) => void;
  addItem: (itemId: ItemId, quantity: number) => { added: number; overflow: number };
  removeItem: (itemId: ItemId, quantity: number) => { removed: number; remaining: number };
  discardSlot: (slotIndex: number) => void;
  sortBag: (mode: SortMode) => void;
  consolidateBag: () => void;
  toggleAutoSort: () => void;
  setSortMode: (mode: SortMode) => void;
  toggleSlotLock: (slotIndex: number) => void;
  expandBag: (additionalSlots: number) => void;
  startQuest: (questId: string) => { success: boolean; error?: string };
  abandonQuest: (questId: string) => void;
  claimQuestRewards: (questId: string) => void;
  // Combat actions
  startCombat: (zoneId: string) => void;
  fleeCombat: () => void;
  setTrainingMode: (mode: TrainingMode) => void;
  toggleAutoFight: () => void;
  equipItem: (itemId: ItemId) => { unequippedItemId: ItemId | null };
  unequipSlot: (slot: EquipmentSlot) => { unequippedItemId: ItemId | null };
  selectZone: (zoneId: string | null) => void;
  loadSave: (state: GameState) => void;
  reset: () => void;
  setActiveTree: (treeId: string) => void;
  // Notification actions
  addNotification: (type: NotificationType, title: string, message: string, options?: { icon?: string; duration?: number }) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

interface HydrationState {
  isHydrated: boolean;
}

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
  const afterOffline = eventBus.dispatch(
    offlineResult.events,
    offlineResult.state,
    getGameContext(bootNow)
  );

  // Wire notifications to this store instance after it exists to avoid circular deps.
  setTimeout(() => {
    const store = useGameStore.getState();
    if (store) {
      setNotificationCallback((type, title, message, options) => {
        store.addNotification(type, title, message, options);
      });
    }
  }, 0);

  return {
    ...afterOffline,
    isHydrated: true,

    tick: (deltaMs: number, now: number) => {
      const state = get();
      const ctx = getGameContext(now);
      const gameState = getGameStateSnapshot(state);
      const result = processTick(gameState, deltaMs, ctx);

      // Dispatch events through event bus (quests, achievements, etc.)
      const finalState = eventBus.dispatch(result.events, result.state, ctx);

      // Preserve any notifications added during event dispatch
      const currentNotifications = get().notifications;

      let nextState: GameState = {
        ...finalState,
        notifications: currentNotifications,
        timestamps: {
          ...finalState.timestamps,
          lastActive: now,
        },
      };

      nextState = maybeAutoSave(nextState, now);

      set(nextState);
    },

    applyOfflineProgress: (now: number) => {
      const state = get();
      const ctx = getGameContext(now);
      const gameState = getGameStateSnapshot(state);

      const result = processOfflineProgress(gameState, now);
      const finalState = eventBus.dispatch(result.events, result.state, ctx);

      // Preserve any existing notifications; offline progress is summarized elsewhere.
      const currentNotifications = get().notifications;

      let nextState: GameState = {
        ...finalState,
        notifications: currentNotifications,
        timestamps: {
          ...finalState.timestamps,
          lastActive: now,
        },
      };

      nextState = maybeAutoSave(nextState, now);

      set(nextState);
    },

    flushSave: (now: number) => {
      const state = get();
      const gameState = getGameStateSnapshot(state);
      persistGameState(gameState, now);
      set({
        timestamps: {
          ...state.timestamps,
          lastSave: now,
        },
      });
    },

    setActiveSkill: (skillId: SkillId | null) => {
      set({ activeSkill: skillId });
    },

    toggleAutomation: (skillId: SkillId) => {
      const state = get();
      const skill = state.skills[skillId];
      if (!skill || !skill.automationUnlocked) {
        return;
      }
      set({
        skills: {
          ...state.skills,
          [skillId]: {
            ...skill,
            automationEnabled: !skill.automationEnabled,
          },
        },
      });
    },

    addItem: (itemId: ItemId, quantity: number) => {
      const state = get();
      const result = addItemToBag(state.bag, itemId, quantity);
      set({ bag: result.bag });
      return { added: result.added, overflow: result.overflow };
    },

    removeItem: (itemId: ItemId, quantity: number) => {
      const state = get();
      const result = removeItemFromBag(state.bag, itemId, quantity);
      set({ bag: result.bag });
      return { removed: result.removed, remaining: result.remaining };
    },

    discardSlot: (slotIndex: number) => {
      const state = get();
      const newBag = discardSlot(state.bag, slotIndex);
      set({ bag: newBag });
    },

    sortBag: (mode: SortMode) => {
      const state = get();
      const newBag = sortBag(state.bag, mode);
      set({ bag: newBag });
    },

    consolidateBag: () => {
      const state = get();
      const newBag = consolidateStacks(state.bag);
      set({ bag: newBag });
    },

    toggleAutoSort: () => {
      const state = get();
      set({
        bagSettings: {
          ...state.bagSettings,
          autoSort: !state.bagSettings.autoSort,
        },
      });
    },

    setSortMode: (mode: SortMode) => {
      const state = get();
      set({
        bagSettings: {
          ...state.bagSettings,
          sortMode: mode,
        },
      });
    },

    toggleSlotLock: (slotIndex: number) => {
      const state = get();
      const newBag = toggleSlotLock(state.bag, slotIndex);
      set({ bag: newBag });
    },

    expandBag: (additionalSlots: number) => {
      const state = get();
      const newBag = expandBag(state.bag, additionalSlots);
      set({ bag: newBag });
    },

    startQuest: (questId: string) => {
      const state = get();
      const now = Date.now();
      const gameState = getGameStateSnapshot(state);
      const result = startQuestLogic(questId, gameState, state.quests, now);
      if (result.success) {
        set({ quests: result.quests });
      }
      return { success: result.success, error: result.error };
    },

    abandonQuest: (questId: string) => {
      const state = get();
      const newQuests = abandonQuestLogic(questId, state.quests);
      set({ quests: newQuests });
    },

    claimQuestRewards: (questId: string) => {
      const state = get();
      const now = Date.now();
      const gameState = getGameStateSnapshot(state);
      const result = applyQuestRewards(gameState, state.quests, questId, now);
      set({
        player: result.state.player,
        skills: result.state.skills,
        attributes: result.state.attributes,
        skillStats: result.state.skillStats,
        resources: result.state.resources,
        bag: result.state.bag,
        quests: result.quests,
        multipliers: result.state.multipliers,
        combat: result.state.combat,
      });
    },

    // Combat actions
    startCombat: (zoneId: string) => {
      const state = get();
      const now = Date.now();
      const newCombat = startCombatLogic(state.combat, zoneId, now);
      set({ combat: newCombat });
    },

    fleeCombat: () => {
      const state = get();
      const newCombat = fleeCombatLogic(state.combat);
      set({ combat: newCombat });
    },

    setTrainingMode: (mode: TrainingMode) => {
      const state = get();
      const newCombat = setTrainingModeLogic(state.combat, mode);
      set({ combat: newCombat });
    },

    toggleAutoFight: () => {
      const state = get();
      const newCombat = toggleAutoFightLogic(state.combat);
      set({ combat: newCombat });
    },

    equipItem: (itemId: ItemId) => {
      const state = get();
      const result = equipItemLogic(state.combat, itemId);
      set({ combat: result.state });
      return { unequippedItemId: result.unequippedItemId };
    },

    unequipSlot: (slot: EquipmentSlot) => {
      const state = get();
      const result = unequipSlotLogic(state.combat, slot);
      set({ combat: result.state });
      return { unequippedItemId: result.unequippedItemId };
    },

    selectZone: (zoneId: string | null) => {
      const state = get();
      const newCombat = selectZoneLogic(state.combat, zoneId);
      set({ combat: newCombat });
    },

    loadSave: (newState: GameState) => {
      const now = Date.now();
      const repaired = repairGameState(newState, { now });
      persistGameState(repaired, now);
      set({
        ...repaired,
        isHydrated: true,
      });
    },

    reset: () => {
      const now = Date.now();
      const fresh = createInitialGameState({ now, rngSeed: createRngSeed() });
      persistGameState(fresh, now);
      set(fresh);
    },

    setActiveTree: (treeId: string) => {
      const state = get();
      const woodcuttingSkill = state.skills.woodcutting;
      const tree = WOODCUTTING_TREES[treeId];

      if (!tree || woodcuttingSkill.level < tree.levelRequired) {
        return;
      }

      set({
        skills: {
          ...state.skills,
          woodcutting: {
            ...woodcuttingSkill,
            activeTreeId: treeId,
          },
        },
      });
    },

    // Notification actions
    addNotification: (
      type: NotificationType,
      title: string,
      message: string,
      options?: { icon?: string; duration?: number }
    ) => {
      const state = get();
      const now = Date.now();

      // Prevent adding notifications if store isn't hydrated yet (avoid duplicate offline notifications)
      if (!state.isHydrated) {
        return;
      }

      const notification = createNotification({
        id: nextNotificationId(now),
        now,
        type,
        title,
        message,
        options,
      });
      const newNotifications = addNotification(state.notifications, notification);
      set({ notifications: newNotifications });

      // Auto-remove after duration
      setTimeout(() => {
        const currentState = get();
        const cleared = removeNotification(currentState.notifications, notification.id);
        set({ notifications: cleared });
      }, notification.duration);
    },

    removeNotification: (id: string) => {
      const state = get();
      const newNotifications = removeNotification(state.notifications, id);
      set({ notifications: newNotifications });
    },

    clearNotifications: () => {
      const state = get();
      const newNotifications = clearNotifications(state.notifications);
      set({ notifications: newNotifications });
    },
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
      sortBag: state.sortBag,
      consolidateBag: state.consolidateBag,
      toggleAutoSort: state.toggleAutoSort,
      setSortMode: state.setSortMode,
      toggleSlotLock: state.toggleSlotLock,
      expandBag: state.expandBag,
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
    }))
  );
