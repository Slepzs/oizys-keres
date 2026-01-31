import type { SkillId, SkillDefinition } from '../../types';
import { SKILL_DEFINITIONS, SKILL_IDS } from '../../data/skills.data';

/**
 * Get a skill definition by ID.
 */
export function getSkillDefinition(skillId: SkillId): SkillDefinition {
  return SKILL_DEFINITIONS[skillId];
}

/**
 * Check if a skill ID is valid.
 */
export function isValidSkillId(id: string): id is SkillId {
  return SKILL_IDS.includes(id as SkillId);
}

/**
 * Get all skill definitions.
 */
export function getAllSkillDefinitions(): SkillDefinition[] {
  return SKILL_IDS.map((id) => SKILL_DEFINITIONS[id]);
}

/**
 * Get skill definitions that are unlocked at or below a given player level.
 */
export function getAvailableSkills(_playerLevel: number): SkillDefinition[] {
  // For now, all skills are available from the start
  // This can be expanded later to gate skills by player level
  return getAllSkillDefinitions();
}
