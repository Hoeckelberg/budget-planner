/**
 * Budget Planner - Apple-Style Design System Colors
 * Optimized for Dark Mode with Glassmorphism effects
 */

// Core Brand Colors
const AppleBlue = '#007AFF';
const AppleGreen = '#34C759';
const AppleOrange = '#FF9500';
const AppleRed = '#FF3B30';
const ApplePurple = '#AF52DE';
const ApplePink = '#FF2D55';
const AppleTeal = '#5AC8FA';

// Gradient Definitions
export const Gradients = {
  primary: ['#007AFF', '#5856D6'],
  success: ['#34C759', '#30D158'],
  premium: ['#FFD60A', '#FF9F0A'],
  expense: ['#FF3B30', '#FF6961'],
  glass: ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)'],
};

// Semantic Colors
export const SemanticColors = {
  income: AppleGreen,
  expense: AppleRed,
  savings: AppleBlue,
  warning: AppleOrange,
  investment: ApplePurple,
  goal: AppleTeal,
};

// Category Colors for Charts
export const CategoryColors = {
  rent: '#5856D6',      // Indigo
  groceries: '#34C759', // Green
  subscriptions: '#FF9500', // Orange
  transport: '#007AFF', // Blue
  dining: '#FF2D55',    // Pink
  entertainment: '#AF52DE', // Purple
  utilities: '#5AC8FA', // Teal
  health: '#FF3B30',    // Red
  shopping: '#FFD60A',  // Yellow
  other: '#8E8E93',     // Gray
};

export default {
  light: {
    // Backgrounds
    background: '#F2F2F7',
    backgroundSecondary: '#FFFFFF',
    backgroundTertiary: '#E5E5EA',

    // Text
    text: '#000000',
    textSecondary: 'rgba(0,0,0,0.6)',
    textTertiary: 'rgba(0,0,0,0.4)',

    // Glass Effect
    glass: 'rgba(255,255,255,0.8)',
    glassBorder: 'rgba(255,255,255,0.3)',

    // UI Elements
    tint: AppleBlue,
    tabIconDefault: '#8E8E93',
    tabIconSelected: AppleBlue,
    separator: 'rgba(0,0,0,0.1)',

    // Cards
    cardBackground: '#FFFFFF',
    cardShadow: 'rgba(0,0,0,0.1)',

    // Semantic
    success: AppleGreen,
    warning: AppleOrange,
    error: AppleRed,
  },
  dark: {
    // Backgrounds
    background: '#0D0D0D',
    backgroundSecondary: '#1C1C1E',
    backgroundTertiary: '#2C2C2E',

    // Text
    text: '#FFFFFF',
    textSecondary: 'rgba(255,255,255,0.6)',
    textTertiary: 'rgba(255,255,255,0.4)',

    // Glass Effect (Glassmorphism)
    glass: 'rgba(255,255,255,0.08)',
    glassBorder: 'rgba(255,255,255,0.12)',
    glassHighlight: 'rgba(255,255,255,0.15)',

    // UI Elements
    tint: AppleBlue,
    tabIconDefault: '#8E8E93',
    tabIconSelected: AppleBlue,
    separator: 'rgba(255,255,255,0.1)',

    // Cards
    cardBackground: 'rgba(28,28,30,0.8)',
    cardShadow: 'rgba(0,0,0,0.3)',

    // Semantic
    success: AppleGreen,
    warning: AppleOrange,
    error: AppleRed,
  },
};

// Typography Scale (following Apple HIG)
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
};

// Spacing Scale
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border Radius
export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 9999,
};

// Shadows
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  }),
};
