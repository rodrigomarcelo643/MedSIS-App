import { Platform } from 'react-native';

/**
 * Tab bar overflow shim for web and Android where the tab bar is generally opaque.
 * Returns platform-specific overflow values.
 */
export default undefined;

/**
 * Hook to handle bottom tab bar overflow spacing
 * @returns {number} Platform-specific overflow value (0 for mobile, custom for web if needed)
 */
export function useBottomTabOverflow(): number {
  // Return different values based on platform if needed
  if (Platform.OS === 'web') {
    // Web-specific overflow handling (can be adjusted as needed)
    return 0;
  }
  
  // Default for Android/iOS (no overflow needed)
  return 0;
}

// Optional: Add platform-specific constants
export const TabBarMetrics = {
  get height(): number {
    return Platform.select({
      ios: 88,
      android: 78,
      default: 0, // web/other
    });
  },
  get paddingBottom(): number {
    return Platform.select({
      ios: 6,
      android: 4,
      default: 0,
    });
  },
};