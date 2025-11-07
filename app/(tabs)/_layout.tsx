import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import { messageService } from "@/services/messageService";
import { Audio } from 'expo-av';
import { Tabs, useRouter, useSegments } from "expo-router";
import {
  Bell as BellIcon,
  ClipboardList,
  Folder as FolderIcon,
  Home as HomeIcon,
  MessageCircle as MessageIcon,
  User as UserIcon
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
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

const Skeleton = ({ width, height, borderRadius = 4, style = {} }) => {
  
  // Theme Change
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardColor = useThemeColor({}, 'card');
  const mutedColor = useThemeColor({}, 'muted');
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

export default function TabLayout() {
  const router = useRouter();
  const segments = useSegments(); 
  const { theme } = useTheme();
  // Theme Change
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardColor = useThemeColor({}, 'card');
  const mutedColor = useThemeColor({}, 'muted');
  
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

  const isWeb = Platform.OS === "web";
  const iconSize = 26;

  // Track header visibility
  const [showHeader, setShowHeader] = useState(true);

  // Load notification sound
  useEffect(() => {
    const loadSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('@/assets/sounds/notification-sound.mp3')
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

  // Play notification sound when count increases
  const playNotificationSound = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.replayAsync();
      }
    } catch (error) {
      console.error("Error playing notification sound:", error);
    }
  };

  // Fetch notification count
  useEffect(() => {
    if (!user?.id) return;

    const fetchNotificationCount = async () => {
      try {
        const response = await fetch(
          `https://msis.eduisync.io/api/get_student_notifications.php?user_id=${user.id}`
        );

        const data = await response.json();
        
        if (data.success) {
          // Count only unread notifications (status !== 'read')
          const unreadCount = data.notifications.filter(
            (notification: any) => notification.status !== 'read'
          ).length;
          
          // Check if notification count increased (but not on first fetch)
          if (!isFirstFetch && unreadCount > notificationCount) {
            playNotificationSound();
          }
          
          setNotificationCount(unreadCount);
          
          // After first successful fetch, mark as not first fetch anymore
          if (isFirstFetch) {
            setIsFirstFetch(false);
          }
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    const fetchMessageCount = async () => {
      try {
        const unreadMessages = await messageService.getUnreadCount(user.id);
        
        // Check if message count increased (but not on first fetch)
        if (!isFirstMessageFetch && unreadMessages > messageCount) {
          playNotificationSound();
        }
        
        setMessageCount(unreadMessages);
        
        // After first successful fetch, mark as not first fetch anymore
        if (isFirstMessageFetch) {
          setIsFirstMessageFetch(false);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchNotificationCount();
    fetchMessageCount();
    
    // Set up interval to periodically check for new notifications and messages
    const intervalId = setInterval(() => {
      fetchNotificationCount();
      fetchMessageCount();
    }, 3000);
    
    return () => clearInterval(intervalId);
  }, [user?.id, notificationCount, messageCount, isFirstFetch, isFirstMessageFetch]);

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

  const renderNotificationBadge = () => {
    if (notificationCount <= 0) return null;
    
    const displayCount = notificationCount > 99 ? "99+" : notificationCount;
    
    return (
      <View className="absolute -right-2 -top-1 min-w-[18px] h-[18px] rounded-full bg-red-500 justify-center items-center">
        <Text className="text-xs text-white font-bold px-1">
          {displayCount}
        </Text>
      </View>
    );
  };

  const renderMessageBadge = () => {
    if (messageCount <= 0) return null;
    
    const displayCount = messageCount > 99 ? "99+" : messageCount;
    
    return (
      <View className="absolute -right-2 -top-1 min-w-[18px] h-[18px] rounded-full bg-red-500 justify-center items-center">
        <Text className="text-xs text-white font-bold px-1">
          {displayCount}
        </Text>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={{ backgroundColor, borderBottomWidth: 1, borderBottomColor: theme === 'dark' ? '#374151' : '#e5e7eb' }} className="flex-row items-center px-4 py-4">
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
          onPress={() => router.push("/messages")}
          className="mr-3 relative"
        >
          {isLoading ? (
            <Skeleton width={24} height={24} borderRadius={12} />
          ) : (
            <>
              <MessageIcon size={24} color={textColor} />
              {renderMessageBadge()}
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/notifications")}
          className="mr-3 relative"
        >
          {isLoading ? (
            <Skeleton width={24} height={24} borderRadius={12} />
          ) : (
            <>
              <BellIcon size={24} color={textColor} />
              {renderNotificationBadge()}
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
              <Text className="text-xs font-medium" style={{color: textColor}} >
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
            tabBarInactiveTintColor: theme === 'dark' ? '#9BA1A6' : '#687076',
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
                      backgroundColor: focused ? cardColor : cardColor ,
                      borderWidth: 1,
                      borderColor: focused ? "#d66d6d5d" : "#d66d6d5d",
                      shadowColor: "",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.25,
                      shadowRadius: 3,
                    
                    }}
                    onPress={handleAIPress}
                  >
                    <Image
                      source={require("../../assets/images/chatbot.png")}
                      className=" w-[50px] h-[50px]"
                     
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
              bottom: 10,
              left: 0,
              width: tabWidth,
              height: 50,
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