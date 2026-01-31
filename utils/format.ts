/**
 * Format a number with abbreviations (K, M, B, etc.)
 */
export function formatNumber(num: number): string {
  if (num < 1000) {
    return num.toFixed(0);
  }

  const units = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi'];
  const magnitude = Math.min(
    Math.floor(Math.log10(Math.abs(num)) / 3),
    units.length - 1
  );

  const scaled = num / Math.pow(1000, magnitude);

  if (scaled >= 100) {
    return scaled.toFixed(0) + units[magnitude];
  } else if (scaled >= 10) {
    return scaled.toFixed(1) + units[magnitude];
  } else {
    return scaled.toFixed(2) + units[magnitude];
  }
}

/**
 * Format milliseconds to human readable time.
 */
export function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

/**
 * Format a percentage (0-1) to display string.
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format XP with proper display.
 */
export function formatXp(current: number, required: number): string {
  return `${formatNumber(current)} / ${formatNumber(required)} XP`;
}
