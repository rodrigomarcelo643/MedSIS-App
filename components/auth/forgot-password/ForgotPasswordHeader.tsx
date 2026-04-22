import React from 'react';
import { View, Text, Image, Animated } from 'react-native';
import RotatingDots from "@/components/ui/RotatingDots";

interface ForgotPasswordHeaderProps {
  logoStyle: any;
  textStyle: any;
}

export const ForgotPasswordHeader: React.FC<ForgotPasswordHeaderProps> = ({
  logoStyle,
  textStyle,
}) => (
  <View className="items-center mb-8 z-10">
    <Animated.View style={logoStyle}>
      <Image
        source={require("../../../assets/images/swu_head.png")}
        className="w-20 h-20 mb-1"
        accessibilityLabel="App logo"
      />
    </Animated.View>

    <Animated.View style={textStyle}>
      <Text className="text-4xl whitespace-nowrap text-center font-extrabold tracking-wide mb-2">
        <Text
          style={{
            color: "#af1616",
            fontWeight: "900",
            textShadowColor: "rgba(0,0,0,0.3)",
            textShadowOffset: { width: 1, height: 2 },
            textShadowRadius: 3,
          }}
        >
          Forgot Password
        </Text>
      </Text>
      <Text className="text-gray-600 text-center text-sm">
        Enter your email address to reset your password
      </Text>
    </Animated.View>

    <RotatingDots />
  </View>
);
