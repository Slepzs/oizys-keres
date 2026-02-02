import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import type { GameState, SkillId, ItemId, TrainingMode, EquipmentSlot } from '@/game/types';
import { createInitialGameState } from '@/game/save';
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
  WOODCUTTING_TREES,
  createNotification,
  addNotification,
  removeNotification,
  clearNotifications,
} from '@/game/logic';
import { eventBus, registerQuestHandlers, registerAchievementHandlers, registerNotificationHandlers, setNotificationCallback } from '@/game/systems';
import type { SortMode, NotificationType } from '@/game/types';
import { zustandStorage } from '@/services/mmkv-storage';

// Register event handlers once at module load
registerQuestHandlers();
registerAchievementHandlers();
registerNotificationHandlers();

interface GameActions {
  tick: (deltaMs: number) => void;
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

// Capture the set function during store creation to avoid circular reference
// when calling setState in onRehydrateStorage callback
let storeSet: any;

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => {
      // Capture set function for use in rehydration callback
      storeSet = set;

      // Set the notification callback to use this store instance's addNotification
      // This is called after store creation to avoid circular dependencies
      setTimeout(() => {
        const store = useGameStore.getState();
        if (store) {
          setNotificationCallback((type, title, message, options) => {
            store.addNotification(type, title, message, options);
          });
        }
      }, 0);

      return {
        // Initial state
        ...createInitialGameState(),

        // Hydration tracking (will be set true after rehydration)
        isHydrated: false,

      // Actions
      tick: (deltaMs: number) => {
        const state = get();
        const result = processTick(state, deltaMs);

        // Dispatch events through event bus (handles quests, achievements, etc.)
        const finalState = eventBus.dispatch(result.events, result.state);
        const currentNotifications = get().notifications;

        set({
          ...finalState,
          // Preserve any notifications added during event dispatch
          notifications: currentNotifications,
          timestamps: {
            ...finalState.timestamps,
            lastActive: Date.now(),
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
        const gameState: GameState = {
          player: state.player,
          skills: state.skills,
          attributes: state.attributes,
          skillStats: state.skillStats,
          resources: state.resources,
          bag: state.bag,
          bagSettings: state.bagSettings,
          quests: state.quests,
          achievements: state.achievements,
          multipliers: state.multipliers,
          combat: state.combat,
          timestamps: state.timestamps,
          activeSkill: state.activeSkill,
          rngSeed: state.rngSeed,
          notifications: state.notifications,
        };
        const result = startQuestLogic(questId, gameState, state.quests);
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
        const gameState: GameState = {
          player: state.player,
          skills: state.skills,
          attributes: state.attributes,
          skillStats: state.skillStats,
          resources: state.resources,
          bag: state.bag,
          bagSettings: state.bagSettings,
          quests: state.quests,
          achievements: state.achievements,
          multipliers: state.multipliers,
          combat: state.combat,
          timestamps: state.timestamps,
          activeSkill: state.activeSkill,
          rngSeed: state.rngSeed,
          notifications: state.notifications,
        };
        const result = applyQuestRewards(gameState, state.quests, questId);
        set({
          player: result.state.player,
          skills: result.state.skills,
          resources: result.state.resources,
          bag: result.state.bag,
          quests: result.quests,
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
        set(newState);
      },

      reset: () => {
        set(createInitialGameState());
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
      addNotification: (type: NotificationType, title: string, message: string, options?: { icon?: string; duration?: number }) => {
        const state = get();
        // Prevent adding notifications if store isn't hydrated yet (avoid duplicate offline notifications)
        if (!state.isHydrated) {
          return;
        }
        const notification = createNotification(type, title, message, options);
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
    },
    {
      name: 'game-storage',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        // Only persist game state, not actions or hydration flag
        player: state.player,
        skills: state.skills,
        attributes: state.attributes,
        skillStats: state.skillStats,
        resources: state.resources,
        bag: state.bag,
        bagSettings: state.bagSettings,
        quests: state.quests,
        achievements: state.achievements,
        multipliers: state.multipliers,
        combat: state.combat,
        timestamps: state.timestamps,
        activeSkill: state.activeSkill,
        rngSeed: state.rngSeed,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Failed to rehydrate game state:', error);
          // Still mark as hydrated so UI can proceed with initial state
          storeSet({ isHydrated: true });
          return;
        }

        // Process offline progress if we have stored state
        if (state && state.timestamps) {
          const now = Date.now();
          const initial = createInitialGameState();
          const currentState: GameState = {
            player: state.player,
            skills: { ...initial.skills, ...state.skills },
            attributes: { ...initial.attributes, ...state.attributes },
            skillStats: { ...initial.skillStats, ...state.skillStats },
            resources: { ...initial.resources, ...state.resources },
            bag: state.bag ?? initial.bag,
            bagSettings: {
              autoSort: state.bagSettings?.autoSort ?? initial.bagSettings.autoSort,
              sortMode: state.bagSettings?.sortMode ?? initial.bagSettings.sortMode,
            },
            quests: state.quests ?? initial.quests,
            achievements: state.achievements ?? initial.achievements,
            multipliers: state.multipliers ?? initial.multipliers,
            combat: state.combat ?? initial.combat,
            timestamps: state.timestamps,
            activeSkill: state.activeSkill ?? null,
            rngSeed: state.rngSeed ?? initial.rngSeed,
            notifications: initial.notifications,
          };

          const result = processOfflineProgress(currentState, now);

          if (result.elapsedMs > 60_000) {
            console.log(
              `Processed ${Math.floor(result.elapsedMs / 1000)}s of offline progress`
            );
          }

          // Update store with offline progress and mark as hydrated
          storeSet({
            player: result.state.player,
            skills: result.state.skills,
            attributes: result.state.attributes,
            skillStats: result.state.skillStats,
            resources: result.state.resources,
            bag: result.state.bag,
            bagSettings: result.state.bagSettings,
            quests: result.state.quests,
            achievements: result.state.achievements,
            multipliers: result.state.multipliers,
            combat: result.state.combat,
            timestamps: result.state.timestamps,
            activeSkill: result.state.activeSkill,
            rngSeed: result.state.rngSeed,
            notifications: initial.notifications,
            isHydrated: true,
          });
        } else {
          // No stored state, just mark as hydrated with initial state
          storeSet({ isHydrated: true });
        }
      },
    }
  )
);

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
