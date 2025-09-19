import { SplashScreen as CustomSplashScreen } from "@/components/SplashScreen";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import "react-native-reanimated";
import "../global.css";

import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function MainLayout() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();

  console.log("🔄 MainLayout render - user:", user, "loading:", loading);

  // Loading session if user not yet loaded 
  if (loading) {
    console.log("⏳ Auth still loading, showing ActivityIndicator");
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#af1616" />
        <Text className="mt-3 text-gray-700">Loading session...</Text>
      </View>
    );
  }

  return (

    // Wrapped Theme Provider (For future purpose of light and dark mode implementations)
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            {console.log("👤 No user, showing auth screens")}
            <Stack.Screen
              name="auth/login"
              options={{ title: "Login", headerShown: false }}
            />
            <Stack.Screen
              name="auth/otp-verification"
              options={{ title: "OTP Verification", headerShown: false }}
            />
            <Stack.Screen
              name="auth/policy-acceptance"
              options={{ title: "Policy Acceptance", headerShown: false }}
            />
          </>
        ) : (
          <>
            {console.log("✅ User detected, showing main app screens")}
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="notifications/index"
              options={{ title: "Notifications", headerShown: true }}
            />
            <Stack.Screen name="+not-found" />
            <Stack.Screen
              name="screens/announcements"
              options={{ title: "Announcements", headerShown: true }}
            />
            <Stack.Screen
              name="screens/learning-materials"
              options={{ title: "Learning Materials", headerShown: true }}
            />
            <Stack.Screen
              name="screens/evaluations"
              options={{ title: "Evaluations", headerShown: true }}
            />
            <Stack.Screen
              name="screens/school-calendar"
              options={{ title: "School Calendar", headerShown: true }}
            />
          </>
        )}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    "Montserrat-Black": require("../assets/fonts/Montserrat-Black.ttf"),
    "SpaceMono-Regular": require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const [appIsReady, setAppIsReady] = useState(false);
  const [showCustomSplash, setShowCustomSplash] = useState(true);
  const isMountedRef = useRef(true);
  const splashAnimationCompleted = useRef(false);
  const minimumSplashTimeRef = useRef(3500);
  const startTimeRef = useRef(Date.now());

  // Track app readiness
  useEffect(() => {
    if (fontsLoaded || fontError) {
      console.log("🔤 Fonts loaded or error, setting appIsReady = true");
      setAppIsReady(true);
    }
  }, [fontsLoaded, fontError]);

  // Handle splash screen sequence
  useEffect(() => {
    const handleSplashSequence = async () => {
      if (!appIsReady) return;

      try {
        if (Platform.OS !== "web") {
          console.log("📱 Hiding native splash screen");
          await SplashScreen.hideAsync();
        }

        setTimeout(() => {
          if (isMountedRef.current && splashAnimationCompleted.current) {
            console.log("🟢 Minimum splash time passed, hiding custom splash");
            setShowCustomSplash(false);
          }
        }, minimumSplashTimeRef.current);
      } catch (error) {
        console.error("❌ Splash screen error:", error);
        if (isMountedRef.current) {
          setShowCustomSplash(false);
        }
      }
    };

    handleSplashSequence();

    return () => {
      isMountedRef.current = false;
    };
  }, [appIsReady]);

  const handleSplashAnimationComplete = () => {
    splashAnimationCompleted.current = true;
    const elapsedTime = Date.now() - startTimeRef.current;
    console.log("🎬 Splash animation completed, elapsed:", elapsedTime);

    if (appIsReady && elapsedTime >= minimumSplashTimeRef.current) {
      console.log("🟢 Conditions met, hiding custom splash now");
      setShowCustomSplash(false);
    }
  };

  if (!appIsReady) {
    console.log("⌛ App not ready, returning null (fonts still loading)");
    return null;
  }

  return (
    <AuthProvider>
      {/* Main app content */}
      <View style={[styles.mainContent, showCustomSplash && styles.hidden]}>
        <MainLayout />
      </View>

      {/* Custom splash overlay */}
      {showCustomSplash && (
        <View style={styles.splashOverlay}>
          <CustomSplashScreen
            onAnimationComplete={handleSplashAnimationComplete}
          />
        </View>
      )}
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  mainContent: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  hidden: {
    opacity: 0,
  },
  splashOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    zIndex: 9999,
  },
});