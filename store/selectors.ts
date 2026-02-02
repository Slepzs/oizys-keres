import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from './gameStore';
import { xpForPlayerLevel, xpForSkillLevel } from '@/game/data';
import type { SkillId, CombatSkillId, TrainingMode, EquipmentSlot } from '@/game/types';
import { SKILL_IDS, COMBAT_SKILL_DEFINITIONS, WOODCUTTING_TREES } from '@/game/data';
import {
  getCombatSkillLevel,
  getCombatSkillXpProgress,
  calculateCombatLevel,
  getPlayerAttack,
  getPlayerStrength,
  getPlayerDefense,
  getPlayerAttackSpeed,
  getTotalEquipmentStats,
  getAvailableTrees,
  getActiveTree,
} from '@/game/logic';
import { COMBAT_SKILL_IDS } from '@/game/types';

const BASE_HEALTH = 100;
const HEALTH_PER_LEVEL = 10;

export function usePlayerSummary() {
  const { level, xp } = useGameStore(
    useShallow((state) => ({ level: state.player.level, xp: state.player.xp }))
  );

  return useMemo(() => {
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
  }, [level, xp]);
}

export function useSkillSummaries() {
  const skills = useGameStore(useShallow((state) => state.skills));

  return useMemo(() => {
    const summaries: Record<
      SkillId,
      { level: number; xp: number; xpRequired: number; progress: number }
    > = {} as Record<
      SkillId,
      { level: number; xp: number; xpRequired: number; progress: number }
    >;

    (Object.keys(skills) as SkillId[]).forEach((skillId) => {
      const skill = skills[skillId];
      const xpRequired = xpForSkillLevel(skill.level + 1);
      summaries[skillId] = {
        level: skill.level,
        xp: skill.xp,
        xpRequired,
        progress: xpRequired > 0 ? skill.xp / xpRequired : 1,
      };
    });

    return summaries;
  }, [skills]);
}

export function useTotalSkillLevels() {
  const skills = useGameStore(useShallow((state) => state.skills));

  return useMemo(() => {
    return SKILL_IDS.reduce((total, skillId) => {
      return total + (skills[skillId]?.level ?? 0);
    }, 0);
  }, [skills]);
}

export function useCombatSummary() {
  const combat = useGameStore(useShallow((state) => state.combat));

  return useMemo(() => {
    const combatLevel = calculateCombatLevel(combat.combatSkills);
    const effectiveAttack = getPlayerAttack(combat);
    const effectiveStrength = getPlayerStrength(combat);
    const effectiveDefense = getPlayerDefense(combat);
    const attackSpeed = getPlayerAttackSpeed(combat);
    const equipmentStats = getTotalEquipmentStats(combat.equipment);

    const skillSummaries: Record<
      CombatSkillId,
      {
        id: CombatSkillId;
        name: string;
        icon: string;
        level: number;
        xp: number;
        xpRequired: number;
        progress: number;
      }
    > = {} as Record<
      CombatSkillId,
      {
        id: CombatSkillId;
        name: string;
        icon: string;
        level: number;
        xp: number;
        xpRequired: number;
        progress: number;
      }
    >;

    for (const skillId of COMBAT_SKILL_IDS) {
      const xp = combat.combatSkills[skillId].xp;
      const level = getCombatSkillLevel(xp);
      const xpProgress = getCombatSkillXpProgress(xp);
      const def = COMBAT_SKILL_DEFINITIONS[skillId];
      skillSummaries[skillId] = {
        id: skillId,
        name: def.name,
        icon: def.icon,
        level,
        xp,
        xpRequired: xpProgress.required,
        progress: xpProgress.progress,
      };
    }

    return {
      combatLevel,
      skills: skillSummaries,
      effectiveAttack,
      effectiveStrength,
      effectiveDefense,
      attackSpeed,
      equipmentStats,
      playerCurrentHp: combat.playerCurrentHp,
      playerMaxHp: combat.playerMaxHp,
      healthProgress: combat.playerMaxHp > 0 ? combat.playerCurrentHp / combat.playerMaxHp : 1,
      trainingMode: combat.trainingMode,
      autoFight: combat.autoFight,
      totalKills: combat.totalKills,
      totalDeaths: combat.totalDeaths,
      selectedZoneId: combat.selectedZoneId,
    };
  }, [combat]);
}

export function useActiveCombat() {
  const { activeCombat, playerCurrentHp, playerMaxHp } = useGameStore(
    useShallow((state) => ({
      activeCombat: state.combat.activeCombat,
      playerCurrentHp: state.combat.playerCurrentHp,
      playerMaxHp: state.combat.playerMaxHp,
    }))
  );

  return useMemo(() => {
    if (!activeCombat) {
      return null;
    }

    return {
      zoneId: activeCombat.zoneId,
      enemyId: activeCombat.enemyId,
      enemyCurrentHp: activeCombat.enemyCurrentHp,
      playerNextAttackAt: activeCombat.playerNextAttackAt,
      enemyNextAttackAt: activeCombat.enemyNextAttackAt,
      playerCurrentHp,
      playerMaxHp,
    };
  }, [activeCombat, playerCurrentHp, playerMaxHp]);
}

export function useEquipment() {
  const equipment = useGameStore(useShallow((state) => state.combat.equipment));

  return useMemo(() => {
    return {
      weapon: equipment.weapon,
      helmet: equipment.helmet,
      chest: equipment.chest,
      legs: equipment.legs,
      boots: equipment.boots,
      accessory: equipment.accessory,
    };
  }, [equipment]);
}

export function useCombatActions() {
  return useGameStore(
    useShallow((state) => ({
      startCombat: state.startCombat,
      fleeCombat: state.fleeCombat,
      setTrainingMode: state.setTrainingMode,
      toggleAutoFight: state.toggleAutoFight,
      equipItem: state.equipItem,
      unequipSlot: state.unequipSlot,
      selectZone: state.selectZone,
    }))
  );
}

export function useWoodcuttingTrees() {
  const woodcutting = useGameStore(useShallow((state) => state.skills.woodcutting));

  return useMemo(() => {
    const available = getAvailableTrees(woodcutting.level);
    const active = getActiveTree(woodcutting);
    return {
      available,
      active,
      level: woodcutting.level,
      activeTreeId: woodcutting.activeTreeId,
    };
  }, [woodcutting]);
}

export function useNotificationActions() {
  return useGameStore(
    useShallow((state) => ({
      addNotification: state.addNotification,
      removeNotification: state.removeNotification,
      clearNotifications: state.clearNotifications,
    }))
  );
}
