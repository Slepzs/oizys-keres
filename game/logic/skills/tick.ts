import type { GameState, ResourceId, SkillDefinition, SkillId } from '../../types';
import type { GameEvent } from '../../systems/events.types';
import { SKILL_DEFINITIONS } from '../../data/skills.data';
import { SKILL_DROP_TABLES } from '../../data/skill-drops.data';
import { skillEfficiencyMultiplier, skillSpeedMultiplier } from '../../data/curves';
import { addSkillXp, addPlayerXp } from '../xp';
import { addResource } from '../resources';
import { addItemToBag, isBagFull } from '../bag';
import { createRng, randomInt, rollChance } from '../rng';
import { getEffectiveMultiplier, getSkillXpMultiplier } from '../multipliers';
import { getActiveTree } from '../woodcutting';

export interface SkillsTickResult {
  state: GameState;
  events: GameEvent[];
}

export function processSkillsTick(state: GameState, ticksElapsed: number): SkillsTickResult {
  const events: GameEvent[] = [];
  let newState = state;

  // Process active skill
  if (
    state.activeSkill
    && state.activeSkill !== 'crafting'
    && state.activeSkill in SKILL_DEFINITIONS
  ) {
    const result = processSkillTick(newState, state.activeSkill as SkillId, ticksElapsed);
    newState = result.state;
    events.push(...result.events);
  }

  // Process automated skills
  for (const skillId of Object.keys(state.skills) as SkillId[]) {
    if (skillId === 'crafting') {
      continue;
    }
    const skill = state.skills[skillId];
    if (skill.automationEnabled && skillId !== state.activeSkill) {
      // Automation runs at 50% efficiency
      const result = processSkillTick(newState, skillId, ticksElapsed * 0.5);
      newState = result.state;
      events.push(...result.events);
    }
  }

  return { state: newState, events };
}

interface SkillTickResult {
  state: GameState;
  events: GameEvent[];
}

function processSkillTick(state: GameState, skillId: SkillId, ticksElapsed: number): SkillTickResult {
  const events: GameEvent[] = [];
  const definition = SKILL_DEFINITIONS[skillId];
  const skill = state.skills[skillId];

  const effectiveDefinition = getEffectiveSkillDefinition(definition, skillId, state);

  // Calculate effective speed
  const speedMult = skillSpeedMultiplier(skill.level);
  const effectiveTicksPerAction = effectiveDefinition.ticksPerAction / speedMult;

  // Accumulate tick progress and calculate complete actions
  const totalTicks = (skill.tickProgress ?? 0) + ticksElapsed;
  const actionsCompleted = Math.floor(totalTicks / effectiveTicksPerAction);
  const remainingTicks = totalTicks % effectiveTicksPerAction;

  // Always update tick progress, even if no actions completed
  let newState: GameState = {
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
  const xpMultiplier = getSkillXpMultiplier(newState, skillId);
  const xpGained = Math.floor(effectiveDefinition.baseXpPerAction * actionsCompleted * xpMultiplier);
  const totalResourceGained = Math.floor(
    effectiveDefinition.baseResourcePerAction * efficiencyMult * actionsCompleted
  );
  const resourceRewards = getSkillResourceRewards(
    skillId,
    effectiveDefinition.resourceProduced,
    totalResourceGained,
    newState.rngSeed
  );

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
  if (resourceRewards.length > 0) {
    for (const reward of resourceRewards) {
      const resourceResult = addResource(newState.resources, reward.resourceId, reward.amount);
      newState = {
        ...newState,
        resources: resourceResult.resources,
      };
    }
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

  if (xpGained > 0 || totalResourceGained > 0) {
    if (resourceRewards.length === 0) {
      events.push({
        type: 'SKILL_ACTION',
        skillId,
        xpGained,
        resourceId: effectiveDefinition.resourceProduced,
        resourceGained: 0,
      });
    } else {
      resourceRewards.forEach((reward, index) => {
        events.push({
          type: 'SKILL_ACTION',
          skillId,
          xpGained: index === 0 ? xpGained : 0,
          resourceId: reward.resourceId,
          resourceGained: reward.amount,
        });
      });
    }
  }

  return { state: newState, events };
}

interface SkillResourceReward {
  resourceId: ResourceId;
  amount: number;
}

function getSkillResourceRewards(
  skillId: SkillId,
  resourceId: ResourceId,
  totalResourceGained: number,
  seed: number
): SkillResourceReward[] {
  if (totalResourceGained <= 0) {
    return [];
  }

  if (skillId !== 'mining') {
    return [{ resourceId, amount: totalResourceGained }];
  }

  const rng = createRng(seed);
  let oreGained = 0;
  let stoneGained = 0;

  for (let i = 0; i < totalResourceGained; i++) {
    if (rollChance(rng, 0.5)) {
      oreGained++;
    } else {
      stoneGained++;
    }
  }

  const rewards: SkillResourceReward[] = [];
  if (oreGained > 0) {
    rewards.push({ resourceId: 'ore', amount: oreGained });
  }
  if (stoneGained > 0) {
    rewards.push({ resourceId: 'stone', amount: stoneGained });
  }

  return rewards;
}

function getEffectiveSkillDefinition(
  baseDefinition: SkillDefinition,
  skillId: SkillId,
  state: GameState
): SkillDefinition {
  if (skillId !== 'woodcutting') {
    return baseDefinition;
  }

  const skill = state.skills[skillId];
  const treeTier = getActiveTree(skill);

  if (!treeTier || skill.level < treeTier.levelRequired) {
    return baseDefinition;
  }

  return {
    ...baseDefinition,
    baseXpPerAction: treeTier.baseXpPerAction,
    baseResourcePerAction: treeTier.baseResourcePerAction,
    resourceProduced: treeTier.resourceProduced,
    ticksPerAction: treeTier.ticksPerAction,
  };
}

interface DropResult {
  state: GameState;
  events: GameEvent[];
}

function processSkillDrops(state: GameState, skillId: SkillId, actionsCompleted: number): DropResult {
  const events: GameEvent[] = [];
  let newState = state;

  const dropTable = SKILL_DROP_TABLES[skillId];
  if (!dropTable || dropTable.length === 0) {
    return { state: newState, events };
  }

  const skillLevel = state.skills[skillId].level;
  const dropMultiplier = getEffectiveMultiplier(state, 'drops');

  // Create RNG from current seed
  const rng = createRng(state.rngSeed);

  // Roll for drops for each action completed
  for (let action = 0; action < actionsCompleted; action++) {
    for (const drop of dropTable) {
      if (skillLevel < drop.minLevel) {
        continue;
      }

      const effectiveChance = Math.min(1, drop.chance * dropMultiplier);

      if (rollChance(rng, effectiveChance)) {
        const quantity = randomInt(rng, drop.minQuantity, drop.maxQuantity + 1);

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
