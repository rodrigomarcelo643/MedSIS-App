import React, { useEffect, useRef } from "react";
import { Animated, Easing, Platform, StyleSheet, View } from "react-native";

const RotatingDots = () => {
  // Animation values for each dot
  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;
  const animationRefs = useRef<Animated.CompositeAnimation[]>([]);

  useEffect(() => {
    // Conditionally enable native driver
    const useNativeDriver = Platform.OS !== "web";

    const createDotAnimation = (anim: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 600,
            easing: Easing.linear,
            useNativeDriver,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 600,
            easing: Easing.linear,
            useNativeDriver,
          }),
        ])
      );
    };

    // Start all animations and store references
    animationRefs.current = [
      createDotAnimation(dot1Anim, 0),
      createDotAnimation(dot2Anim, 300),
      createDotAnimation(dot3Anim, 600),
    ];
    
    animationRefs.current.forEach(anim => anim.start());

    // Cleanup function
    return () => {
      animationRefs.current.forEach(anim => anim.stop());
      dot1Anim.setValue(0);
      dot2Anim.setValue(0);
      dot3Anim.setValue(0);
    };
  }, []);

  const getDotStyle = (anim: Animated.Value, index: number) => {
    if (Platform.OS === "web") {
      return {
        ...styles.dot,
        animation: "pulse 1.8s infinite ease-in-out",
        animationDelay: `${index * 0.3}s`,
      };
    }

    return {
      ...styles.dot,
      transform: [
        {
          scale: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.4],
          }),
        },
      ],
      opacity: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.6, 1],
      }),
    };
  };

  // Add CSS animation for web
  if (Platform.OS === "web" && typeof document !== "undefined") {
    const styleElement = document.createElement("style");
    styleElement.innerHTML = `
      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 0.6; }
        50% { transform: scale(1.4); opacity: 1; }
      }
    `;
    document.head.appendChild(styleElement);
  }

  return (
    <View style={styles.container}>
      <Animated.View style={getDotStyle(dot1Anim, 0)} />
      <Animated.View style={getDotStyle(dot2Anim, 1)} />
      <Animated.View style={getDotStyle(dot3Anim, 2)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#af1616",
    marginHorizontal: 4,
  },
});

export default RotatingDots;