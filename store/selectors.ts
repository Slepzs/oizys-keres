import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from './gameStore';
import { xpForPlayerLevel, xpForSkillLevel } from '@/game/data';
import type { SkillId } from '@/game/types';

const BASE_HEALTH = 100;
const HEALTH_PER_LEVEL = 10;

export function usePlayerSummary() {
  return useGameStore(
    useShallow((state) => {
      const level = state.player.level;
      const xp = state.player.xp;
      const xpRequired = xpForPlayerLevel(level + 1);
      const progress = xpRequired > 0 ? xp / xpRequired : 1;
      const maxHealth = BASE_HEALTH + level * HEALTH_PER_LEVEL;
      const currentHealth = maxHealth;
      const healthProgress = maxHealth > 0 ? currentHealth / maxHealth : 1;

      return {
        level,
        xp,
        xpRequired,
        progress,
        currentHealth,
        maxHealth,
        healthProgress,
      };
    })
  );
}

export function useSkillSummaries() {
  return useGameStore(
    useShallow((state) => {
      const summaries: Record<SkillId, { level: number; xp: number; xpRequired: number; progress: number }> = {} as Record<
        SkillId,
        { level: number; xp: number; xpRequired: number; progress: number }
      >;

      (Object.keys(state.skills) as SkillId[]).forEach((skillId) => {
        const skill = state.skills[skillId];
        const xpRequired = xpForSkillLevel(skill.level + 1);
        summaries[skillId] = {
          level: skill.level,
          xp: skill.xp,
          xpRequired,
          progress: xpRequired > 0 ? skill.xp / xpRequired : 1,
        };
      });

      return summaries;
    })
  );
}
