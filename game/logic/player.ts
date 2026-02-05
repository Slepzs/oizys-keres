import {
  playerHealthRegenPerSecond,
  playerManaRegenPerSecond,
  playerMaxHealthForLevel,
  playerMaxManaForLevel,
} from '../data/curves';
import type { PlayerState } from '../types';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function roundToPrecision(value: number, digits: number = 3): number {
  const factor = Math.pow(10, digits);
  return Math.round(value * factor) / factor;
}

export function normalizePlayerVitals(player: PlayerState): PlayerState {
  const maxHealth = playerMaxHealthForLevel(player.level);
  const maxMana = playerMaxManaForLevel(player.level);

  const rawHealth = Number.isFinite(player.health) ? player.health : maxHealth;
  const rawMana = Number.isFinite(player.mana) ? player.mana : maxMana;

  return {
    ...player,
    maxHealth,
    maxMana,
    health: clamp(rawHealth, 0, maxHealth),
    mana: clamp(rawMana, 0, maxMana),
  };
}

/**
 * Regenerate player vitals over elapsed time.
 * Formula:
 * - Health regen/s = base + level scaling + max-health scaling
 * - Mana regen/s = base + level scaling + max-mana scaling
 */
export function regeneratePlayerVitals(player: PlayerState, deltaMs: number): PlayerState {
  const normalized = normalizePlayerVitals(player);

  if (deltaMs <= 0) {
    return normalized;
  }

  const deltaSeconds = deltaMs / 1000;
  const healthRegen = playerHealthRegenPerSecond(normalized.level, normalized.maxHealth) * deltaSeconds;
  const manaRegen = playerManaRegenPerSecond(normalized.level, normalized.maxMana) * deltaSeconds;

  return {
    ...normalized,
    health: roundToPrecision(clamp(normalized.health + healthRegen, 0, normalized.maxHealth)),
    mana: roundToPrecision(clamp(normalized.mana + manaRegen, 0, normalized.maxMana)),
  };
}
