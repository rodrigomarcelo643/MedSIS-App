import RotatingDots from "@/components/ui/RotatingDots";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing, Image, Text, View } from "react-native";

export function SplashScreen({ onAnimationComplete }) {
  const colorScheme = useColorScheme();
  const [hasAnimated, setHasAnimated] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const containerAnim = useRef(new Animated.Value(0)).current;
  const finalLogoAnim = useRef(new Animated.Value(0)).current;
  const bgOpacityAnim = useRef(new Animated.Value(1)).current;
  const watermarkAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current; // NEW for app name

  useEffect(() => {
    if (hasAnimated) return;
    setHasAnimated(true);

    // Sequence animation
    Animated.parallel([
      Animated.timing(containerAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 700,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          tension: 70,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      Animated.sequence([
        Animated.delay(300),
        Animated.parallel([
          Animated.timing(finalLogoAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(watermarkAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(textAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.out(Easing.exp), // smoother easing
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(bgOpacityAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        onAnimationComplete();
      });
    });
  }, [hasAnimated]);

  // Watermark animations
  const watermarkOpacity = watermarkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 4],
    extrapolate: "clamp",
  });

  const watermarkScale = watermarkAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1.3],
    extrapolate: "clamp",
  });

  // Text animations
  const textOpacity = textAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const textScale = textAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });

  const textTranslateY = textAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0], // smooth upward motion
  });

  const bgColor = colorScheme === "dark" ? "bg-neutral-900" : "bg-white";
  const animatedBgStyle = { opacity: bgOpacityAnim };

  return (
    <Animated.View
      className="flex-1 justify-center items-center w-full h-full absolute"
      style={[{ opacity: containerAnim }]}
    >
      {/* Background */}
      <Animated.View
        className={`absolute inset-0 w-full h-full ${bgColor}`}
        style={animatedBgStyle}
      />

      {/* Watermark */}
      <Animated.View
        className="absolute inset-0 justify-center items-center z-1"
        style={{
          opacity: watermarkOpacity,
          transform: [{ scale: watermarkScale }],
        }}
      >
        <Image
          source={require("@/assets/images/medicine-logo.png")}
          className="w-4/5 h-4/5 opacity-30"
          resizeMode="contain"
          accessibilityLabel="Medicine logo watermark"
        />
      </Animated.View>

      {/* Main Content */}
      <View className="flex-1 justify-center items-center w-full z-10">
        <View className="items-center justify-center">
          {/* Logo */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }}
          >
            <Image
              source={require("@/assets/images/swu-head.png")}
              className="w-40 h-40"
              resizeMode="contain"
              accessibilityLabel="App logo"
            />
          </Animated.View>

          {/* Dots */}
          <View className="my-4 h-8">
            <RotatingDots dotColor="#8C2323" dotSize={9} />
          </View>

          {/* App Name (Animated) */}
          <Animated.View
            style={{
              opacity: textOpacity,
              transform: [{ scale: textScale }, { translateY: textTranslateY }],
            }}
          >
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
          </Animated.View>
        </View>
      </View>
    </Animated.View>
  );
}

export default SplashScreen;
