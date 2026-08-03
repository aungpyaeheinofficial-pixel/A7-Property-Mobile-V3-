/**
 * Framework-independent A7 tokens for charts, maps, email, and future native UI.
 * Web components should prefer the matching semantic CSS variables in globals.css.
 */
const a7DesignTokens = {
  color: {
    primary: "#0057D9",
    primaryHover: "#0049B8",
    primarySoft: "#EDF4FF",
    cream: "#FAF8F5",
    navy: "#0F1B2D",
    surface: "#FFFFFF",
    textSecondary: "#667085",
    border: "#E5E2DD",
  },
  spacing: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
  },
  radius: {
    small: 8,
    control: 14,
    card: 20,
    sheet: 28,
    pill: 999,
  },
  motion: {
    fast: 120,
    base: 180,
    slow: 260,
  },
} as const;

type A7DesignTokens = typeof a7DesignTokens;

export { a7DesignTokens };
export type { A7DesignTokens };
