/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

// App palette (light theme focus)
export const Palette = {
  primary: '#003049', // Header background, titles
  secondary: '#669BBC', // Secondary accent (icons, inactive states)
  accent: '#C1121F', // CTA / active tint
  bg: '#F5F5F5', // Screen background
  white: '#FFFFFF',
  border: '#E0E0E0',
  text: '#003049',
};

export const Colors = {
  light: {
    text: Palette.text,
    background: Palette.bg,
    tint: Palette.accent,
    icon: Palette.secondary,
    tabIconDefault: Palette.secondary,
    tabIconSelected: Palette.accent,
    headerBackground: Palette.primary,
    card: Palette.white,
    border: Palette.border,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#FFD1CF',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#FFD1CF',
    headerBackground: '#0E141B',
    card: '#1E252C',
    border: '#2A3138',
  },
};

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
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
