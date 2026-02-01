import type { GameState, SkillId, ItemId } from '../types';
import { SKILL_DEFINITIONS } from '../data/skills.data';
import { SKILL_DROP_TABLES } from '../data/skill-drops.data';
import { skillEfficiencyMultiplier, skillSpeedMultiplier } from '../data/curves';
import { TICKS_PER_SECOND } from '../data/constants';
import { addSkillXp, addPlayerXp } from './xp';
import { addResource } from './resources';
import { addItemToBag, isBagFull } from './bag';
import { advanceSeed, createRng, rollChance, randomInt } from './rng';

export interface TickResult {
  state: GameState;
  events: TickEvent[];
}

export type TickEvent =
  | { type: 'SKILL_ACTION'; skillId: SkillId; xpGained: number; resourceGained: number }
  | { type: 'SKILL_LEVEL_UP'; skillId: SkillId; newLevel: number }
  | { type: 'PLAYER_LEVEL_UP'; newLevel: number }
  | { type: 'AUTOMATION_UNLOCKED'; skillId: SkillId }
  | { type: 'ITEM_DROPPED'; skillId: SkillId; itemId: ItemId; quantity: number }
  | { type: 'BAG_FULL'; itemId: ItemId; quantity: number }
  | { type: 'ACTIONS_PAUSED_BAG_FULL' };

/**
 * Process a single game tick.
 * This is the core game loop function - pure and deterministic.
 */
export function processTick(state: GameState, deltaMs: number): TickResult {
  const events: TickEvent[] = [];
  let newState = { ...state };

  // Calculate ticks elapsed (fractional)
  const ticksElapsed = (deltaMs / 1000) * TICKS_PER_SECOND;

  // Process active skill
  if (state.activeSkill) {
    const result = processSkillTick(newState, state.activeSkill as SkillId, ticksElapsed);
    newState = result.state;
    events.push(...result.events);
  }

  // Process automated skills
  for (const skillId of Object.keys(state.skills) as SkillId[]) {
    const skill = state.skills[skillId];
    if (skill.automationEnabled && skillId !== state.activeSkill) {
      // Automation runs at 50% efficiency
      const result = processSkillTick(newState, skillId, ticksElapsed * 0.5);
      newState = result.state;
      events.push(...result.events);
    }
  }

  // Advance RNG seed
  newState.rngSeed = advanceSeed(newState.rngSeed);

  return { state: newState, events };
}

interface SkillTickResult {
  state: GameState;
  events: TickEvent[];
}

function processSkillTick(
  state: GameState,
  skillId: SkillId,
  ticksElapsed: number
): SkillTickResult {
  const events: TickEvent[] = [];
  const definition = SKILL_DEFINITIONS[skillId];
  const skill = state.skills[skillId];

  // Calculate effective speed
  const speedMult = skillSpeedMultiplier(skill.level);
  const effectiveTicksPerAction = definition.ticksPerAction / speedMult;

  // Accumulate tick progress and calculate complete actions
  const totalTicks = (skill.tickProgress ?? 0) + ticksElapsed;
  const actionsCompleted = Math.floor(totalTicks / effectiveTicksPerAction);
  const remainingTicks = totalTicks % effectiveTicksPerAction;

  // Always update tick progress, even if no actions completed
  let newState = {
    ...state,
    skills: {
      ...state.skills,
      [skillId]: {
        ...skill,
        tickProgress: remainingTicks,
      },
    },
  };

  if (actionsCompleted <= 0) {
    return { state: newState, events };
  }

  // Calculate rewards based on complete actions only
  const efficiencyMult = skillEfficiencyMultiplier(skill.level);
  const xpGained = definition.baseXpPerAction * actionsCompleted;
  const resourceGained = Math.floor(definition.baseResourcePerAction * efficiencyMult * actionsCompleted);

  // Add XP to skill
  if (xpGained > 0) {
    const xpResult = addSkillXp(skill, xpGained);
    const updatedSkill = {
      ...newState.skills[skillId],
      xp: xpResult.newXp,
      level: xpResult.newLevel,
    };

    // Check automation unlock
    if (!updatedSkill.automationUnlocked && updatedSkill.level >= definition.automationUnlockLevel) {
      updatedSkill.automationUnlocked = true;
      events.push({ type: 'AUTOMATION_UNLOCKED', skillId });
    }

    newState = {
      ...newState,
      skills: {
        ...newState.skills,
        [skillId]: updatedSkill,
      },
    };

    if (xpResult.leveledUp) {
      events.push({ type: 'SKILL_LEVEL_UP', skillId, newLevel: xpResult.newLevel });
    }

    // Add player XP (10% of skill XP)
    const playerXpGained = Math.floor(xpGained * 0.1);
    if (playerXpGained > 0) {
      const playerResult = addPlayerXp(newState.player, playerXpGained);
      newState = {
        ...newState,
        player: {
          ...newState.player,
          xp: playerResult.newXp,
          level: playerResult.newLevel,
        },
      };

      if (playerResult.leveledUp) {
        events.push({ type: 'PLAYER_LEVEL_UP', newLevel: playerResult.newLevel });
      }
    }
  }

  // Add resources
  if (resourceGained > 0) {
    const resourceResult = addResource(newState.resources, definition.resourceProduced, resourceGained);
    newState = {
      ...newState,
      resources: resourceResult.resources,
    };
  }

  // Check if bag is full before processing drops to prevent item loss
  if (isBagFull(newState.bag)) {
    events.push({ type: 'ACTIONS_PAUSED_BAG_FULL' });
  } else {
    // Process item drops for each action completed
    const dropResult = processSkillDrops(newState, skillId, actionsCompleted);
    newState = dropResult.state;
    events.push(...dropResult.events);
  }

  if (xpGained > 0 || resourceGained > 0) {
    events.push({ type: 'SKILL_ACTION', skillId, xpGained, resourceGained });
  }

  return { state: newState, events };
}

interface DropResult {
  state: GameState;
  events: TickEvent[];
}

/**
 * Process potential item drops for a skill after completing actions.
 * Uses seeded RNG for deterministic drops.
 */
function processSkillDrops(
  state: GameState,
  skillId: SkillId,
  actionsCompleted: number
): DropResult {
  const events: TickEvent[] = [];
  let newState = state;

  const dropTable = SKILL_DROP_TABLES[skillId];
  if (!dropTable || dropTable.length === 0) {
    return { state: newState, events };
  }

  const skillLevel = state.skills[skillId].level;

  // Create RNG from current seed
  const rng = createRng(state.rngSeed);

  // Roll for drops for each action completed
  for (let action = 0; action < actionsCompleted; action++) {
    for (const drop of dropTable) {
      // Skip if skill level too low
      if (skillLevel < drop.minLevel) {
        continue;
      }

      // Roll for drop
      if (rollChance(rng, drop.chance)) {
        const quantity = randomInt(rng, drop.minQuantity, drop.maxQuantity + 1);

        // Try to add to bag
        const bagResult = addItemToBag(newState.bag, drop.itemId, quantity);
        newState = {
          ...newState,
          bag: bagResult.bag,
        };

        if (bagResult.added > 0) {
          events.push({
            type: 'ITEM_DROPPED',
            skillId,
            itemId: drop.itemId,
            quantity: bagResult.added,
          });
        }

        if (bagResult.overflow > 0) {
          events.push({
            type: 'BAG_FULL',
            itemId: drop.itemId,
            quantity: bagResult.overflow,
          });
        }
      }
    }
  }

  return { state: newState, events };
}

/**
 * Process multiple ticks at once (for offline progress).
 */
export function processMultipleTicks(
  state: GameState,
  totalMs: number,
  chunkMs: number = 1000
): TickResult {
  let currentState = state;
  const allEvents: TickEvent[] = [];

  let remainingMs = totalMs;

  while (remainingMs > 0) {
    const chunkDuration = Math.min(remainingMs, chunkMs);
    const result = processTick(currentState, chunkDuration);
    currentState = result.state;
    allEvents.push(...result.events);
    remainingMs -= chunkDuration;
  }

  return { state: currentState, events: allEvents };
}
