import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Tabs, useRouter, useSegments } from "expo-router";
import {
  Bell as BellIcon,
  Folder as FolderIcon,
  Home as HomeIcon,
  ClipboardList,
  User as UserIcon
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

interface Layout {}

const Skeleton = ({ width, height, borderRadius = 4, style = {} }) => {
  return (
    <View
      className="overflow-hidden"
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: "#e1e1e1",
        },
        style,
      ]}
    >
      <Animated.View
        className="w-full h-full"
        style={{
          backgroundColor: "#f5f5f5",
        }}
      />
    </View>
  );
};

export default function TabLayout() {
  const router = useRouter();
  const segments = useSegments(); // gives the active route segments
  const colorScheme = useColorScheme();
  const tintColor = "#be2e2e";
  const { width } = useWindowDimensions();
  const [isLoading, setIsLoading] = useState(true);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const { user } = useAuth(); // Only get user from auth context

  const isWeb = Platform.OS === "web";
  const iconSize = 26;

  // Track header visibility
  const [showHeader, setShowHeader] = useState(true);

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

  const renderYearStatusBadge = () => {
    if (!user) return null;

    const yearLevel = user.year_level_id ? String(user.year_level_id) : "";
    const status = user.status || "";
    const displayText = `${yearLevel} ${status}`.trim();

    const isGraduating =
      (yearLevel === "4" || yearLevel === "4th") &&
      status.toLowerCase().includes("graduating");

    if (isGraduating) {
      return (
        <View className="flex-row items-center mt-1 px-2 py-1 rounded-[20px] bg-blue-100">
          <Text className="text-xs font-medium text-blue-800">Graduating</Text>
        </View>
      );
    }

    return (
      <View
        className={`flex-row items-center mt-1 px-2 py-1 rounded-[20px] ${
          status.toLowerCase() === "regular" ? "bg-green-100" : "bg-red-100"
        }`}
      >
        <Text className="text-xs font-medium mr-1">Year</Text>
        <Text className="text-xs font-medium">{displayText || "N/A"}</Text>
      </View>
    );
  };

  const renderHeader = () => (
    <View className="flex-row items-center px-4 py-4 bg-white border-b border-gray-200">
      <View className="flex-row items-center">
        {isLoading ? (
          <Skeleton width={36} height={36} borderRadius={18} />
        ) : (
          <>
            <Image
              source={require("../../assets/images/swu-head.png")}
              className="w-9 h-9 mr-2"
            />
            <Text className="text-xl mt-2 font-extrabold tracking-wide">
              <Text
                style={{
                  color: "#af1616",
                  fontWeight: "900",
                  textShadowColor: "rgba(0,0,0,0.3)",
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 2,
                }}
              >
                Med
              </Text>
              <Text
                style={{
                  color: "#16a34a",
                  fontWeight: "900",
                  textShadowColor: "rgba(0,0,0,0.25)",
                  textShadowOffset: { width: 1, height: 1 },
                  textShadowRadius: 2,
                }}
              >
                SIS
              </Text>
            </Text>
          </>
        )}
      </View>

      <View className="flex-1" />
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={() => router.push("/notifications")}
          className="mr-3 relative"
        >
          {isLoading ? (
            <Skeleton width={24} height={24} borderRadius={12} />
          ) : (
            <>
              <BellIcon size={22} color={Colors[colorScheme ?? "light"].text} />
              <View className="absolute right-[2px] top-[1px] w-2 h-2  rounded-full bg-red-500" />
            </>
          )}
        </TouchableOpacity>
      </View>
      {user && (
        <View className="flex-row items-center ">
          <View className="items-end mr-2">
            <View className="flex-row items-center">
              {user.nationality && (
                <Image
                  source={
                    user.nationality.toLowerCase() === "filipino"
                      ? require("../../assets/images/ph-flag.png")
                      : require("../../assets/images/foreign-flag.png")
                  }
                  className="w-4 h-3 mr-1"
                />
              )}
              <Text className="text-xs font-medium">
                {user.nationality || "N/A"}
              </Text>
            </View>
            {renderYearStatusBadge()}
          </View>
        </View>
      )}
    </View>
  );

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
    <View className="flex-1">
      {!isWeb && (
        <View
          style={{ height: StatusBar.currentHeight, backgroundColor: "#fff" }}
        />
      )}

      {showHeader && renderHeader()}

      <View className="flex-1">
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              height: 65,
              paddingBottom: 8,
              position: "relative",
            },
            tabBarButton: HapticTab,
            tabBarBackground: TabBarBackground,
            tabBarLabelStyle: {
              fontSize: 12,
              marginBottom: 0,
            },
            tabBarActiveTintColor: tintColor,
            tabBarInactiveTintColor:
              Colors[colorScheme ?? "light"].tabIconDefault,
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
                    className="w-[70px] h-[70px] rounded-full justify-center items-center mt-[-25px]"
                    style={{
                      backgroundColor: focused ? "#be2e2e" : "#fff",
                      borderWidth: 2,
                      borderColor: focused ? "#be2e2e" : "#e5e7eb",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.25,
                      shadowRadius: 5,
                      elevation: 6,
                    }}
                    onPress={handleAIPress}
                  >
                    <Image
                      source={require("../../assets/images/chatbot-app.png")}
                      className="w-10 h-10"
                      style={{ tintColor: focused ? "#fff" : undefined }}
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
              title: "Evaluations",
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
              bottom: 10,
              left: 0,
              width: tabWidth,
              height: 50,
              borderRadius: 10,
              backgroundColor: "rgba(140, 35, 35, 0.08)", // subtle tint
            },
            highlightStyle,
          ]}
        />

        {/* Underline (closer to text) */}
        <Reanimated.View
          style={[
            {
              position: "absolute",
              bottom: 2,
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
  );
}
