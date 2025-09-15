import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Platform } from 'react-native';

export function HapticTab(props: BottomTabBarButtonProps) {
  const handlePressIn = (e: React.PointerEvent<HTMLDivElement>) => {
    // Trigger haptic feedback on press (both iOS and Android)
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
        // Silently fail if haptics aren't available
      });
    }
    props.onPressIn?.(e);
  };

  return (
    <PlatformPressable
      {...props}
      onPressIn={handlePressIn}
      // Add visual feedback for web/desktop
      pressRetentionOffset={{ top: 20, left: 20, right: 20, bottom: 20 }}
    />
  );
}

HapticTab.displayName = 'HapticTab';