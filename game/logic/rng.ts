/**
 * Seeded random number generator using Mulberry32 algorithm.
 * Deterministic: same seed always produces same sequence.
 */
export function createRng(seed: number): () => number {
  let state = seed;

  return function random(): number {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate a random integer between min (inclusive) and max (exclusive).
 */
export function randomInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min)) + min;
}

/**
 * Generate a random float between min and max.
 */
export function randomFloat(rng: () => number, min: number, max: number): number {
  return rng() * (max - min) + min;
}

/**
 * Roll a chance (0-1). Returns true if successful.
 */
export function rollChance(rng: () => number, chance: number): boolean {
  return rng() < chance;
}

/**
 * Advance the seed for deterministic progression.
 */
export function advanceSeed(seed: number): number {
  return (seed * 1103515245 + 12345) & 0x7fffffff;
}
