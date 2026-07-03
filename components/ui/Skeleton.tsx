import { useThemeColor } from "@/hooks/useThemeColor";
import React from "react";
import { Animated, View } from "react-native";

export const Skeleton = ({
  width,
  height,
  borderRadius = 4,
  style = {},
}: {
  width: number;
  height: number;
  borderRadius?: number;
  style?: object;
}) => {
  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "card");
  
  return (
    <View
      className="overflow-hidden"
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
    >
      <Animated.View
        className="w-full h-full"
        style={{
          backgroundColor: cardColor,
        }}
      />
    </View>
  );
};

export default Skeleton;
