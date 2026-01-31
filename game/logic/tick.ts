import type { GameState, SkillId } from '../types';
import { SKILL_DEFINITIONS } from '../data/skills.data';
import { skillEfficiencyMultiplier, skillSpeedMultiplier } from '../data/curves';
import { TICKS_PER_SECOND } from '../data/constants';
import { addSkillXp, addPlayerXp } from './xp';
import { addResource } from './resources';
import { advanceSeed } from './rng';

export interface TickResult {
  state: GameState;
  events: TickEvent[];
}

export type TickEvent =
  | { type: 'SKILL_ACTION'; skillId: SkillId; xpGained: number; resourceGained: number }
  | { type: 'SKILL_LEVEL_UP'; skillId: SkillId; newLevel: number }
  | { type: 'PLAYER_LEVEL_UP'; newLevel: number }
  | { type: 'AUTOMATION_UNLOCKED'; skillId: SkillId };

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

  // Calculate actions performed (can be fractional for smooth progression)
  const actionsPerformed = ticksElapsed / effectiveTicksPerAction;

  if (actionsPerformed <= 0) {
    return { state, events };
  }

  // Calculate rewards
  const efficiencyMult = skillEfficiencyMultiplier(skill.level);
  const xpGained = Math.floor(definition.baseXpPerAction * actionsPerformed);
  const resourceGained = Math.floor(definition.baseResourcePerAction * efficiencyMult * actionsPerformed);

  if (xpGained === 0 && resourceGained === 0) {
    return { state, events };
  }

  let newState = { ...state };

  // Add XP to skill
  if (xpGained > 0) {
    const xpResult = addSkillXp(skill, xpGained);
    const updatedSkill = {
      ...skill,
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

  if (xpGained > 0 || resourceGained > 0) {
    events.push({ type: 'SKILL_ACTION', skillId, xpGained, resourceGained });
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
