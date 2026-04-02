import { spacing } from '../../../constants/theme.ts';

export const PLAYER_HEADER_BAR_MIN_HEIGHT = 88;

interface SafeContainerMetricsOptions {
  insetsTop: number;
  insetsBottom: number;
  padTop?: boolean;
  padBottom?: boolean;
  showPlayerHeader?: boolean;
}

export function getSafeContainerMetrics({
  insetsTop,
  insetsBottom,
  padTop = true,
  padBottom = true,
  showPlayerHeader = false,
}: SafeContainerMetricsOptions) {
  const headerTop = insetsTop + spacing.sm;
  const contentPaddingBottom = padBottom ? insetsBottom + spacing.md : spacing.md;

  if (showPlayerHeader) {
    return {
      headerTop,
      contentPaddingTop: headerTop + PLAYER_HEADER_BAR_MIN_HEIGHT + spacing.md,
      contentPaddingBottom,
    };
  }

  return {
    headerTop,
    contentPaddingTop: padTop ? insetsTop + spacing.md : spacing.md,
    contentPaddingBottom,
  };
}
