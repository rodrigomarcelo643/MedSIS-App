import React from "react";
import { View, Text, Image, Animated } from "react-native";
import RotatingDots from "@/components/ui/RotatingDots";

interface LoginHeaderProps {
  logoStyle: any;
  textStyle: any;
}

export const LoginHeader: React.FC<LoginHeaderProps> = ({
  logoStyle,
  textStyle,
}) => (
  <View className="items-center mb-8">
    <Animated.View style={logoStyle}>
      <Image
        source={require("../../../assets/images/swu_head.png")}
        className="w-20 h-20 mb-1"
        accessibilityLabel="App logo"
      />
    </Animated.View>

    <Animated.View style={textStyle}>
      <Text className="text-5xl whitespace-nowrap text-center font-extrabold tracking-wide">
        <Text
          style={{
            color: "#af1616",
            fontWeight: "900",
            textShadowColor: "rgba(0,0,0,0.3)",
            textShadowOffset: { width: 1, height: 2 },
            textShadowRadius: 3,
          }}
        >
          Med
        </Text>

        <Text
          style={{
            color: "#15803d",
            fontWeight: "900",
            textShadowColor: "rgba(0,0,0,0.3)",
            textShadowOffset: { width: 1, height: 2 },
            textShadowRadius: 3,
          }}
        >
          SIS
        </Text>
      </Text>
      <Text
        style={{
          color: "#6b7280",
          fontSize: 11,
          fontWeight: "500",
          textAlign: "center",
          letterSpacing: 0.5,
          marginTop: 2,
        }}
      >
        Medical Student Information System
      </Text>
    </Animated.View>

    <RotatingDots />
  </View>
);
