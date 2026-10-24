/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

import { Paleta } from '@/constants/paleta';

export const Colors = {
  light: {
    text: '#1E293B',
    background: '#F4F7FB',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E0F2FE',
    surfaceMuted: '#F8FAFC',
    border: '#E2E8F0',
    primary: Paleta.primario,
    accent: Paleta.secundario,
    textSecondary: '#64748B',
    textMuted: '#94A3B8',
  },
  dark: {
    text: '#F1F5F9',
    background: '#0F172A',
    backgroundElement: '#1E293B',
    backgroundSelected: '#334155',
    surfaceMuted: '#172033',
    border: '#334155',
    primary: '#60A5FA',
    accent: Paleta.secundario,
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
