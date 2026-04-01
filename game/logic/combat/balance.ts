const OFFENSE_BONUS_SCALE = 0.4;
const PET_DAMAGE_SCALE = 0.45;
const DAMAGE_OFFENSE_SCALE = 0.35;
const DAMAGE_DEFENSE_SCALE = 0.15;
const ENEMY_HP_SCALE = 2;
const ATTACK_INTERVAL_SCALE = 2;

export function scaleCombatOffenseBonus(rawBonus: number): number {
  if (!Number.isFinite(rawBonus) || rawBonus <= 0) {
    return 0;
  }

  return Math.max(0, Math.floor(rawBonus * OFFENSE_BONUS_SCALE));
}

export function calculateScaledCombatDamage(attackerStrength: number, defenderDefense: number): number {
  const offense = 1 + Math.floor(Math.max(0, attackerStrength) * DAMAGE_OFFENSE_SCALE);
  const mitigation = Math.floor(Math.max(0, defenderDefense) * DAMAGE_DEFENSE_SCALE);
  return Math.max(1, offense - mitigation);
}

export function scaleEnemyMaxHp(rawHp: number): number {
  if (!Number.isFinite(rawHp) || rawHp <= 0) {
    return 1;
  }

  return Math.max(1, Math.ceil(rawHp * ENEMY_HP_SCALE));
}

export function scalePetBaseDamage(rawDamage: number): number {
  if (!Number.isFinite(rawDamage) || rawDamage <= 0) {
    return 1;
  }

  return Math.max(1, Math.floor(rawDamage * PET_DAMAGE_SCALE));
}

export function scaleAttackIntervalSeconds(rawSeconds: number): number {
  if (!Number.isFinite(rawSeconds) || rawSeconds <= 0) {
    return ATTACK_INTERVAL_SCALE;
  }

  return rawSeconds * ATTACK_INTERVAL_SCALE;
}
