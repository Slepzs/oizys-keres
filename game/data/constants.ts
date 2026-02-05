// Game loop timing
export const TICK_RATE_MS = 100; // 10 ticks per second
export const TICKS_PER_SECOND = 1000 / TICK_RATE_MS;

// Save timing
export const AUTO_SAVE_INTERVAL_MS = 30_000; // 30 seconds
export const MAX_OFFLINE_MS = 24 * 60 * 60 * 1000; // 24 hours

// Player progression
export const MAX_PLAYER_LEVEL = 100;
export const BASE_PLAYER_XP = 100;
export const BASE_PLAYER_HEALTH = 100;
export const HEALTH_PER_LEVEL = 10;
export const BASE_PLAYER_MANA = 60;
export const MANA_PER_LEVEL = 8;

// Player regeneration (per second)
export const BASE_HEALTH_REGEN_PER_SECOND = 1;
export const HEALTH_REGEN_PER_LEVEL = 0.15;
export const HEALTH_REGEN_FROM_MAX_HEALTH = 0.01;
export const BASE_MANA_REGEN_PER_SECOND = 2;
export const MANA_REGEN_PER_LEVEL = 0.2;
export const MANA_REGEN_FROM_MAX_MANA = 0.02;

// Skills
export const MAX_SKILL_LEVEL = 99;
export const BASE_SKILL_XP = 50;

// Resources
export const DEFAULT_MAX_STACK = 1_000_000;
