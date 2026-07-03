import { HapticTab } from "@/components/HapticTab";
import TabsHeader from "@/components/TabsHeader";
import Skeleton from "@/components/ui/Skeleton";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { API_BASE_URL } from "@/constants/Config";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useNavigationMode } from "@/hooks/useNavigationMode";
import { useThemeColor } from "@/hooks/useThemeColor";
import { messageService } from "@/services/messageService";
import axios from "axios";
import { Audio } from "expo-av";
import { Tabs, useRouter, useSegments } from "expo-router";
import {
  ClipboardList,
  Folder as FolderIcon,
  Home as HomeIcon,
  User as UserIcon,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Platform,
  StatusBar,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export default function TabLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { theme } = useTheme();
  const { hasThreeButtonNav, insets } = useNavigationMode();

  // Theme Change
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const cardColor = useThemeColor({}, "card");
  const mutedColor = useThemeColor({}, "muted");

  const tintColor = "#be2e2e";
  const { width } = useWindowDimensions();
  const [isLoading, setIsLoading] = useState(true);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const { user } = useAuth();
  const [notificationCount, setNotificationCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [isFirstFetch, setIsFirstFetch] = useState(true);
  const [isFirstMessageFetch, setIsFirstMessageFetch] = useState(true);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [prevNotificationCount, setPrevNotificationCount] = useState(0);
  const [prevMessageCount, setPrevMessageCount] = useState(0);
  const soundPlayingRef = useRef(false);

  const isWeb = Platform.OS === "web";
  const iconSize = 26;

  // Track header visibility
  const [showHeader, setShowHeader] = useState(true);

  // Debug logging
  console.log(
    "hasThreeButtonNav:",
    hasThreeButtonNav,
    "insets.bottom:",
    insets.bottom,
    "Platform.OS:",
    Platform.OS,
  );

  // Calculate tab bar padding and styling based on navigation mode (same for iOS and Android)
  const tabBarPadding = hasThreeButtonNav ? 40 : 35;
  const tabBarBottomOffset = hasThreeButtonNav ? insets.bottom : 4;

  // Load notification sound
  useEffect(() => {
    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("@/assets/sounds/notification_sound.mp3"),
        );
        soundRef.current = sound;
      } catch (error) {
        console.error("Error loading notification sound:", error);
      }
    };

    loadSound();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Play notification sound when count increases (with debouncing)
  const playNotificationSound = async () => {
    try {
      if (soundRef.current && !soundPlayingRef.current) {
        soundPlayingRef.current = true;
        await soundRef.current.replayAsync();
        // Reset flag after sound duration (assuming 2 seconds)
        setTimeout(() => {
          soundPlayingRef.current = false;
        }, 2000);
      }
    } catch (error) {
      console.error("Error playing notification sound:", error);
      soundPlayingRef.current = false;
    }
  };

  // Fetch notification count
  const isFetchingNotification = useRef(false);
  const isFetchingMessage = useRef(false);

  useEffect(() => {
    if (!user?.id) return;

    const fetchNotificationCount = async () => {
      if (isFetchingNotification.current) return;
      isFetchingNotification.current = true;

      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/get_student_notifications.php?user_id=${user.id}`,
          {
            timeout: 8000, // Slightly shorter timeout
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          },
        );

        const data = response.data;
        if (data.success) {
          const unreadCount = data.notifications.filter(
            (notification: any) => notification.status !== "read",
          ).length;
          setNotificationCount(unreadCount);
          setPrevNotificationCount(unreadCount);
          if (isFirstFetch) setIsFirstFetch(false);
        }
      } catch (error: any) {
        // Detailed error logging
        const status = error.response?.status;
        const msg = error.message;
        console.warn(
          `[Notification Fetch] ${msg} ${status ? `(Status: ${status})` : ""} - Check if ${API_BASE_URL} is reachable.`,
        );
      } finally {
        isFetchingNotification.current = false;
      }
    };

    const fetchMessageCount = async () => {
      if (isFetchingMessage.current) return;
      isFetchingMessage.current = true;

      try {
        const unreadMessages = await messageService.getUnreadCount(user.id);
        setMessageCount(unreadMessages);
        setPrevMessageCount(unreadMessages);
        if (isFirstMessageFetch) setIsFirstMessageFetch(false);
      } catch (error: any) {
        console.warn(`[Message Count Fetch] ${error.message}`);
      } finally {
        isFetchingMessage.current = false;
      }
    };

    fetchNotificationCount();
    fetchMessageCount();

    // Set up interval to periodically check for new notifications and messages
    const intervalId = setInterval(() => {
      fetchNotificationCount();
      fetchMessageCount();
    }, 5000); // Reduced frequency to 5 seconds

    return () => clearInterval(intervalId);
  }, [user?.id]);

  // Separate effect to handle sound playing when counts increase
  useEffect(() => {
    // Only play sound if either count increased (not on first fetch)
    if (!isFirstFetch && !isFirstMessageFetch) {
      const notificationIncreased = notificationCount > prevNotificationCount;
      const messageIncreased = messageCount > prevMessageCount;

      if (notificationIncreased || messageIncreased) {
        playNotificationSound();
      }
    }
  }, [
    notificationCount,
    messageCount,
    isFirstFetch,
    isFirstMessageFetch,
    prevNotificationCount,
    prevMessageCount,
  ]);

  useEffect(() => {
    const currentRoute = segments[segments.length - 1]; // get last active tab
    if (currentRoute === "ai-assistant" || currentRoute === "profile") {
      setShowHeader(false);
    } else {
      setShowHeader(true);
    }
  }, [segments]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleAIPress = () => {
    router.push("/ai-assistant");
  };

  // === Animated Underline & Highlight ===
  const underlineX = useSharedValue(0);
  const highlightX = useSharedValue(0);
  const tabWidth = width / 5;

  const underlineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: underlineX.value }],
  }));

  const highlightStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: highlightX.value }],
  }));

  return (
    <GestureHandlerRootView className="flex-1">
      <View className="flex-1">
        {!isWeb && (
          <View
            style={{ height: StatusBar.currentHeight, backgroundColor: "#fff" }}
          />
        )}

        {showHeader && (
          <TabsHeader
            isLoading={isLoading}
            notificationCount={notificationCount}
            messageCount={messageCount}
          />
        )}

        <View className="flex-1">
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarStyle: {
                height: hasThreeButtonNav ? 80 + insets.bottom : 80,
                paddingBottom: hasThreeButtonNav
                  ? tabBarPadding + insets.bottom
                  : tabBarPadding,
                paddingTop: 8,
                position: "relative",
              },
              tabBarButton: HapticTab,
              tabBarBackground: TabBarBackground,
              tabBarLabelStyle: {
                fontSize: 12,
                marginBottom: 0,
                marginTop: 4,
              },
              tabBarActiveTintColor: tintColor,
              tabBarInactiveTintColor: theme === "dark" ? "#9BA1A6" : "#687076",
            }}
            screenListeners={{
              state: (e) => {
                const index = e.data.state.index;
                underlineX.value = withTiming(index * tabWidth, {
                  duration: 350,
                });
                highlightX.value = withTiming(index * tabWidth, {
                  duration: 350,
                });
              },
            }}
          >
            <Tabs.Screen
              name="home"
              options={{
                title: "Home",
                tabBarIcon: ({ color }) =>
                  isLoading ? (
                    <Skeleton width={26} height={26} borderRadius={13} />
                  ) : (
                    <HomeIcon size={iconSize} color={color} />
                  ),
              }}
            />
            <Tabs.Screen
              name="folder"
              options={{
                title: "Folder",
                tabBarIcon: ({ color }) =>
                  isLoading ? (
                    <Skeleton width={26} height={26} borderRadius={13} />
                  ) : (
                    <FolderIcon size={iconSize} color={color} />
                  ),
              }}
            />
            <Tabs.Screen
              name="ai-assistant"
              options={{
                title: "",
                tabBarIcon: ({ focused }) =>
                  isLoading ? (
                    <Skeleton width={62} height={62} borderRadius={31} />
                  ) : (
                    <TouchableOpacity
                      className="w-[60px] h-[60px] rounded-full justify-center  items-center "
                      style={{
                        backgroundColor: focused ? cardColor : cardColor,
                        borderWidth: 1,
                        borderColor: focused ? "#d66d6d5d" : "#d66d6d5d",
                        shadowColor: "",
                        shadowOffset: { width: 2, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 4,
                      }}
                      onPress={handleAIPress}
                    >
                      <Image
                        source={require("../../assets/images/chatbot.png")}
                        className=" w-[60px] h-[60px] relative -left-1 top-1"
                      />
                    </TouchableOpacity>
                  ),
              }}
              listeners={{
                tabPress: (e) => {
                  e.preventDefault();
                  handleAIPress();
                },
              }}
            />
            <Tabs.Screen
              name="evaluations"
              options={{
                title: "Evaluation",
                tabBarIcon: ({ color }) =>
                  isLoading ? (
                    <Skeleton width={26} height={26} borderRadius={13} />
                  ) : (
                    <ClipboardList size={iconSize} color={color} />
                  ),
              }}
            />
            <Tabs.Screen
              name="profile"
              options={{
                title: "Profile",
                tabBarIcon: ({ color }) =>
                  isLoading ? (
                    <Skeleton width={26} height={26} borderRadius={13} />
                  ) : (
                    <UserIcon size={iconSize} color={color} />
                  ),
              }}
            />
          </Tabs>

          {/* Highlight background behind active tab */}
          <Reanimated.View
            style={[
              {
                position: "absolute",
                bottom: tabBarBottomOffset + 8,
                left: 0,
                width: tabWidth,
                height: 60,
                borderRadius: 10,
                backgroundColor: "rgba(140, 35, 35, 0.08)",
              },
              highlightStyle,
            ]}
          />

          {/* Underline (closer to text) */}
          <Reanimated.View
            style={[
              {
                position: "absolute",
                bottom: tabBarBottomOffset + 4,
                left: 0,
                width: tabWidth * 0.5,
                height: 3,
                marginLeft: tabWidth * 0.25,
                backgroundColor: tintColor,
                borderRadius: 3,
              },
              underlineStyle,
            ]}
          />
        </View>
      </View>
    </GestureHandlerRootView>
  );
}
