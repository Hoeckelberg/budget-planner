/**
 * Budget Planner — VisionOS++ Design System
 * Precision-engineered for premium mobile finance UI
 */

// ─── Core Palette ────────────────────────────────────────────────────────────
const Blue = '#007AFF';
const Green = '#34C759';
const Red = '#FF3B30';
const Orange = '#FF9500';
const Purple = '#AF52DE';
const Pink = '#FF2D55';
const Teal = '#5AC8FA';
const Indigo = '#5856D6';
const Yellow = '#FFD60A';

// ─── Semantic Colors ──────────────────────────────────────────────────────────
export const SemanticColors = {
  income: Green,
  expense: Red,
  savings: Blue,
  warning: Orange,
  investment: Purple,
  goal: Teal,
};

// ─── Category Colors (Charts) ─────────────────────────────────────────────────
export const CategoryColors = {
  rent: Indigo,
  groceries: Green,
  subscriptions: Orange,
  transport: Blue,
  dining: Pink,
  entertainment: Purple,
  utilities: Teal,
  health: Red,
  shopping: Yellow,
  other: '#8E8E93',
};

// ─── Gradients ────────────────────────────────────────────────────────────────
export const Gradients = {
  primary: [Blue, Indigo] as [string, string],
  success: [Green, '#30D158'] as [string, string],
  premium: [Yellow, Orange] as [string, string],
  expense: [Red, '#FF6961'] as [string, string],
  glass: ['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.04)'] as [string, string],
  dark: ['#070A0F', '#0D1117'] as [string, string],
};

// ─── Glass Elevation Tiers ───────────────────────────────────────────────────
// Three distinct depth layers — background is #070A0F
export const GlassTiers = {
  base: {
    background: 'rgba(255,255,255,0.06)',
    border: 'rgba(255,255,255,0.10)',
    highlight: 'rgba(255,255,255,0.05)',
  },
  elevated: {
    background: 'rgba(255,255,255,0.10)',
    border: 'rgba(255,255,255,0.14)',
    highlight: 'rgba(255,255,255,0.08)',
  },
  overlay: {
    background: 'rgba(255,255,255,0.16)',
    border: 'rgba(255,255,255,0.20)',
    highlight: 'rgba(255,255,255,0.12)',
  },
};

// ─── Color Scheme ─────────────────────────────────────────────────────────────
// Forced dark mode — same token used for both to ensure consistency
const scheme = {
  // Depth
  background: '#070A0F',
  backgroundSecondary: '#0D1117',
  backgroundTertiary: '#13181F',

  // Text
  text: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.55)',
  textTertiary: 'rgba(255,255,255,0.35)',

  // Glass (legacy — keep for backward compat, maps to 'elevated' tier)
  glass: GlassTiers.elevated.background,
  glassBorder: GlassTiers.elevated.border,
  glassHighlight: GlassTiers.elevated.highlight,

  // Brand
  tint: Blue,
  tabIconDefault: '#636366',
  tabIconSelected: Blue,
  separator: 'rgba(255,255,255,0.08)',

  // Cards (legacy compat)
  cardBackground: GlassTiers.base.background,
  cardShadow: 'rgba(0,0,0,0.6)',

  // Semantic shorthands
  success: Green,
  warning: Orange,
  error: Red,
};

export default {
  light: scheme,
  dark: scheme,
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
  // Number display variants
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

// ─── Spacing Scale (8pt grid) ─────────────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// ─── Border Radius (locked system — 16 / 20 / 28 only) ───────────────────────
export const BorderRadius = {
  sm: 8,   // Internal elements only (chips, badges)
  md: 16,  // Standard cards
  lg: 20,  // Elevated cards
  xl: 28,  // Hero cards / modals
  full: 9999,
};

// ─── Shadows ──────────────────────────────────────────────────────────────────
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  }),
};
