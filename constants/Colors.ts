/**
 * Budget Planner — Light Modern Fintech Design System
 * Soft, airy, trustworthy — inspired by top iOS finance apps
 */

// ─── Core Palette ────────────────────────────────────────────────────────────
const Purple = '#7B61FF';   // Primary accent
const Coral = '#FF8A65';   // Secondary accent
const Green = '#22C55E';   // Success / Income
const Red = '#EF4444';   // Danger / Expense
const Blue = '#3B82F6';   // Info
const Amber = '#F59E0B';   // Warning

// Chart gradient pair
const ChartFrom = '#7B61FF';
const ChartTo = '#F472B6';   // soft pink

// ─── Semantic Colors ──────────────────────────────────────────────────────────
export const SemanticColors = {
  income: Green,
  expense: Red,
  savings: Purple,
  warning: Amber,
  investment: Blue,
  goal: Coral,
};

// ─── Category Colors (Charts — all soft, no neon) ────────────────────────────
export const CategoryColors = {
  rent: '#7B61FF',
  groceries: '#22C55E',
  subscriptions: '#F59E0B',
  transport: '#3B82F6',
  dining: '#F472B6',
  entertainment: '#A78BFA',
  utilities: '#34D399',
  health: '#EF4444',
  shopping: '#FB923C',
  other: '#9CA3AF',
};

// ─── Gradients ────────────────────────────────────────────────────────────────
export const Gradients = {
  primary: [ChartFrom, ChartTo] as [string, string],
  hero: ['#7B61FF', '#A78BFA'] as [string, string],
  success: [Green, '#4ADE80'] as [string, string],
  premium: ['#F59E0B', '#FB923C'] as [string, string],
  expense: [Red, '#F87171'] as [string, string],
  surface: ['#FFFFFF', '#F6F7FB'] as [string, string],
  // Legacy dark — deprecated, kept for compat
  glass: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)'] as [string, string],
  dark: ['#F6F7FB', '#FFFFFF'] as [string, string],
};

// ─── Card Elevation Tiers (soft shadows, no glass blur) ──────────────────────
// Replaces GlassTiers — now uses white backgrounds + diffuse shadow
export const CardTiers = {
  base: {
    background: '#FFFFFF',
    border: 'rgba(0,0,0,0.04)',
    shadow: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
  },
  elevated: {
    background: '#FFFFFF',
    border: 'rgba(0,0,0,0.0)',
    shadow: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.07,
      shadowRadius: 16,
      elevation: 4,
    },
  },
  overlay: {
    background: '#FFFFFF',
    border: 'rgba(0,0,0,0.0)',
    shadow: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.10,
      shadowRadius: 24,
      elevation: 8,
    },
  },
};

// ─── Legacy alias (for components still importing GlassTiers) ─────────────────
export const GlassTiers = CardTiers;

// ─── Light Color Scheme ───────────────────────────────────────────────────────
const lightScheme = {
  // Backgrounds
  background: '#F6F7FB',
  backgroundSecondary: '#FFFFFF',
  backgroundTertiary: '#F2F3F7',

  // Text hierarchy
  text: '#1C1C1E',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',

  // Glass compat tokens (now map to light values)
  glass: '#FFFFFF',
  glassBorder: 'rgba(0,0,0,0.06)',
  glassHighlight: 'rgba(255,255,255,0.9)',

  // Brand
  tint: Purple,
  tabIconDefault: '#9CA3AF',
  tabIconSelected: Purple,
  separator: '#E5E7EB',

  // Cards
  cardBackground: '#FFFFFF',
  cardShadow: 'rgba(0,0,0,0.06)',

  // Semantic shorthands
  success: Green,
  warning: Amber,
  error: Red,
};

// Force light-only (both modes = light)
export default {
  light: lightScheme,
  dark: lightScheme,
};

// ─── Typography Scale (Apple HIG) ────────────────────────────────────────────
export const Typography = {
  largeTitle: {
    fontSize: 34,
    fontWeight: '700' as const,
    letterSpacing: 0.37,
    lineHeight: 41,
  },
  title1: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: 0.36,
    lineHeight: 34,
  },
  title2: {
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: 0.35,
    lineHeight: 28,
  },
  title3: {
    fontSize: 20,
    fontWeight: '600' as const,
    letterSpacing: 0.38,
    lineHeight: 25,
  },
  headline: {
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: -0.41,
    lineHeight: 22,
  },
  body: {
    fontSize: 17,
    fontWeight: '400' as const,
    letterSpacing: -0.41,
    lineHeight: 22,
  },
  callout: {
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: -0.32,
    lineHeight: 21,
  },
  subhead: {
    fontSize: 15,
    fontWeight: '400' as const,
    letterSpacing: -0.24,
    lineHeight: 20,
  },
  footnote: {
    fontSize: 13,
    fontWeight: '400' as const,
    letterSpacing: -0.08,
    lineHeight: 18,
  },
  caption1: {
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 16,
  },
  caption2: {
    fontSize: 11,
    fontWeight: '400' as const,
    letterSpacing: 0.07,
    lineHeight: 13,
  },
  mono: {
    fontSize: 17,
    fontWeight: '500' as const,
    fontVariant: ['tabular-nums'] as any,
    letterSpacing: -0.5,
    lineHeight: 22,
  },
  monoLarge: {
    fontSize: 44,
    fontWeight: '700' as const,
    fontVariant: ['tabular-nums'] as any,
    letterSpacing: -2,
    lineHeight: 52,
  },
};

// ─── Spacing Scale (8pt grid) ──────────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// ─── Border Radius ─────────────────────────────────────────────────────────
export const BorderRadius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 9999,
};

// ─── Shadows (soft, diffuse — light fintech style) ────────────────────────
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.10,
    shadowRadius: 28,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  }),
};
