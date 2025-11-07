/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#1f2937',
    background: '#ffffff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    card: '#ffffff',
    borderBottom : '#e5e7eb',
    loaderCard: "#e5e7eb", 
    border: '#e5e7eb',
    muted: '#6b7280',
  },
  dark: {
    text: '#f9fafb',
    background: '#111827',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    card: '#1f2937',
    loaderCard: "#1f2937", 
    border: '#374151',
    borderBottom : '#e5e7eb',
    muted: '#9ca3af',
  },
};
