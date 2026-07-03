import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const useNavigationMode = () => {
  const insets = useSafeAreaInsets();

  // Detection for both iOS and Android: three-button nav/home indicator has > 0 bottom inset
  const hasThreeButtonNav = React.useMemo(() => {
    return insets.bottom > 0;
  }, [insets.bottom]);

  return { hasThreeButtonNav, insets };
};
