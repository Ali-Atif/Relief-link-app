import { spacing } from './constants';

/**
 * Shared scroll gutters (ScreenLayout, Guide detail, Quiz, etc.).
 * Bottom is modest so content does not sit far above the global tab bar.
 */
export const guideDetailScrollContent = {
  paddingHorizontal: spacing.md,
  paddingTop: spacing.sm,
  paddingBottom: spacing.lg + spacing.md,
} as const;
