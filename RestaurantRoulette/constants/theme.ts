/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#FF6B35';
const tintColorDark = '#FF8C5A';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    primary: '#FF6B35',
    primaryDark: '#E55A25',
    secondary: '#2EC4B6',
    surface: '#F8F9FA',
    border: '#E0E0E0',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    primary: '#FF8C5A',
    primaryDark: '#FF6B35',
    secondary: '#2EC4B6',
    surface: '#1E2022',
    border: '#333333',
  },
};

/** Colors used for roulette wheel segments — enough for up to 50 segments */
export const WheelColors = [
  '#FF6B35', '#2EC4B6', '#E71D36', '#FDCA40', '#7B2D8E',
  '#3A86FF', '#06D6A0', '#EF476F', '#118AB2', '#FFD166',
  '#073B4C', '#F77F00', '#9B2335', '#00B4D8', '#80B918',
  '#E63946', '#457B9D', '#F4A261', '#2A9D8F', '#E9C46A',
  '#264653', '#A8DADC', '#6D6875', '#B5838D', '#FFBA08',
  '#3D405B', '#81B29A', '#F2CC8F', '#118C4F', '#FF595E',
  '#6A4C93', '#1982C4', '#8AC926', '#FFCA3A', '#FF595E',
  '#6A4C93', '#1982C4', '#8AC926', '#FFCA3A', '#FF595E',
  '#F72585', '#7209B7', '#3A0CA3', '#4361EE', '#4CC9F0',
  '#606C38', '#DDA15E', '#BC6C25', '#283618', '#FEFAE0',
];

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
