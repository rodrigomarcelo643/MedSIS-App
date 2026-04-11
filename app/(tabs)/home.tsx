import { useAuth } from "@/contexts/AuthContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useRouter } from "expo-router";
import { BookOpen, CalendarDays, Megaphone } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { HomeQuickLink } from '@/@types/tabs';

// Import modular components
import { WelcomeHeader } from "@/components/home/WelcomeHeader";
import { QuickLinkCard } from "@/components/home/QuickLinkCard";
import { HomeSkeleton } from "@/components/home/HomeSkeleton";

export default function Home() {
  const { width } = useWindowDimensions();
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading, clearUser } = useAuth();
  const router = useRouter();
  const isWeb = Platform.OS === "web";
  const isLargeWeb = isWeb && width >= 1024;

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'muted');
  const loadColor = useThemeColor({}, 'loaderCard');

  // Background images for each card
  const folderImages = [
    require("../../assets/images/folder.png"),
    require("../../assets/images/folder1.png"),
    require("../../assets/images/folder2.png"),
    require("../../assets/images/folder3.png"),
  ];

  const quickLinks: HomeQuickLink[] = [
    { id: 1, title: "Announcements", description: "Stay informed with the latest updates and essential details you won't want to miss.", color: "#8C2323", count: 5, bgImage: folderImages[0], onPress: () => router.push("/screens/announcements"), icon: <Megaphone size={28} color="white" /> },
    { id: 2, title: "Learning Materials", description: "Access and download course materials and resources ", color: "#8C2323", count: 24, bgImage: folderImages[1], onPress: () => router.push("/screens/learning-materials"), icon: <BookOpen size={28} color="white" /> },
    { id: 3, title: "Events Calendar", description: "Don't miss out-mark your calendar with key dates for assembles, sports and celebrations", color: "#8C2323", count: 3, bgImage: folderImages[2], onPress: () => router.push("/screens/calendar"), icon: <CalendarDays size={28} color="white" /> },
    { id: 4, title: "School Calendar", description: "View and download the latest updated school calendar", color: "#8C2323", count: 24, bgImage: folderImages[3], onPress: () => router.push("/screens/school-calendar"), icon: <CalendarDays size={28} color="white" /> },
  ];

  useEffect(() => {
    const checkAuth = async () => {
      if (!authLoading && !user) { router.replace("/auth/login"); return; }
      if (user) {
        const timer = setTimeout(() => setIsLoading(false), 1500);
        return () => clearTimeout(timer);
      }
    };
    checkAuth();
  }, [user, authLoading]);

  const handleForceLogout = async () => {
    await clearUser();
    router.replace("/auth/login");
  };

  if (authLoading || (!user && !authLoading)) return null;
  if (isLoading) return <HomeSkeleton backgroundColor={backgroundColor} loadColor={loadColor} isLargeWeb={isLargeWeb} />;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor, padding: isLargeWeb ? 16 : 12 }}
      className={isLargeWeb ? "max-w-4xl mx-auto" : ""}
    >
      <WelcomeHeader user={user} mutedColor={mutedColor} />

      <View className="mb-3 ml-2">
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: textColor }}>Quick Access</Text>
        <Text style={{ fontSize: 14, color: mutedColor }}>Quickly navigate to important sections</Text>
      </View>

      <View className="flex-col">
        {quickLinks.map((link) => (
          <QuickLinkCard
            key={link.id}
            title={link.title}
            description={link.description}
            onPress={link.onPress}
            color={link.color}
            bgImage={link.bgImage}
          />
        ))}
      </View>

      {isWeb && (
        <TouchableOpacity onPress={handleForceLogout} className="mt-8 p-3 bg-red-100 dark:bg-red-900 rounded-lg">
          <Text className="text-red-600 dark:text-red-200 text-center">Force Logout (Testing)</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
