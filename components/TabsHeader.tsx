import Skeleton from "@/components/ui/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useRouter } from "expo-router";
import { Bell as BellIcon } from "lucide-react-native";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

interface TabsHeaderProps {
  isLoading: boolean;
  notificationCount: number;
  messageCount: number;
}

export const TabsHeader = ({
  isLoading,
  notificationCount,
  messageCount,
}: TabsHeaderProps) => {
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuth();

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

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

  return (
    <View
      style={{
        backgroundColor,
        borderBottomWidth: 1,
        borderBottomColor: theme === "dark" ? "#374151" : "#e5e7eb",
      }}
      className="flex-row items-center px-4 py-4"
    >
      <View className="flex-row items-center">
        {isLoading ? (
          <Skeleton width={36} height={36} borderRadius={18} />
        ) : (
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/home")}
            className="flex-row items-center"
          >
            <Image
              source={require("@/assets/images/swu_head.png")}
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
          </TouchableOpacity>
        )}
      </View>

      <View className="flex-1" />
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={() => router.push("/screens/messages")}
          className="mr-3 relative"
        >
          {isLoading ? (
            <Skeleton width={24} height={24} borderRadius={12} />
          ) : (
            <>
              <Image
                className="w-7 h-7"
                source={require("@/assets/images/chat_icon_main.png")}
              />
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
                      ? require("@/assets/images/ph_flag.png")
                      : require("@/assets/images/foreign_flag.png")
                  }
                  className="w-4 h-3 mr-1"
                />
              )}
              <Text
                className="text-xs font-medium"
                style={{ color: textColor }}
              >
                {user.nationality || "N/A"}
              </Text>
            </View>
            {renderYearStatusBadge()}
          </View>
        </View>
      )}
    </View>
  );
};

export default TabsHeader;
