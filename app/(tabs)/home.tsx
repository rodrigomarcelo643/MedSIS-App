import { useAuth } from "@/contexts/AuthContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useRouter } from "expo-router";
import { BookOpen, CalendarDays, Megaphone } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Image,
  ImageSourcePropType,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native";

interface SkeletonLoaderProps {
  width: number | string;
  height: number | string;
  borderRadius?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
}

interface QuickLinkCardProps {
  title: string;
  description: string;
  onPress: () => void;
  color: string;
  bgImage: ImageSourcePropType;
}

interface WelcomeHeaderProps {
  user: any;
  onProfilePress: () => void;
}

interface QuickLink {
  id: number;
  title: string;
  description: string;
  color: string;
  count: number;
  bgImage: ImageSourcePropType;
  onPress: () => void;
  icon: React.ReactNode;
}

// Skeleton Loader Component
const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width,
  height,
  borderRadius = 4,
  style = {},
  children,
}) => {
  const loadColor = useThemeColor({}, 'loaderCard');
  return (
    <View
      className="bg-gray-100 dark:bg-gray-800 mb-2 overflow-hidden"
      style={[{ width, height, borderRadius, backgroundColor: loadColor } as ViewStyle, style]}
    >
      <View
        className="w-full h-full mb-2 bg-gray-200 dark:bg-gray-700"
        style={{ opacity: 0.5, backgroundColor: loadColor }}
      >
        {children}
      </View>
    </View>
  );
};

// Skeleton with pulse animation
const SkeletonPulse = () => {
  return (
    <View
      className="absolute top-0 left-0 mb-2 right-0 bottom-0 bg-gray-300 dark:bg-gray-600 opacity-20"
      style={{
        opacity: 0.3,
      }}
    />
  );
};

const QuickLinkCard: React.FC<QuickLinkCardProps> = ({
  title,
  description,
  onPress,
  color,
  bgImage,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="overflow-hidden"
      style={{ width: "100%", elevation: 8 }}
    >
      <View className="rounded-2xl px-0 overflow-hidden" style={{ height: 115 }}>
        {/* Background Image */}
        <Image
          source={bgImage}
          className="w-full h-full absolute"
          resizeMode="cover"
        />
        {/* Content Overlay */}
        <View className="flex-1 pt-5 px-7 justify-start">
          <View className="flex-col justify-start items-start">
            {/* Title */}
            <Text className="text-2xl font-bold text-white mb-1">
              {title}
            </Text>
            
            {/* Description */}
            <Text className="text-sm text-white/90">
              {description}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({
  user,
  onProfilePress,
}) => {
    const mutedColor = useThemeColor({}, 'muted');
  return (
    
    <View className="flex-row justify-between p-2 items-center mb-2">
      <View className="flex-1">
        <Text style={{ fontSize: 16, color: mutedColor, marginBottom: 4 }}>
          Welcome back,
        </Text>
        <Text style={{ fontSize: 30, fontWeight: 'bold', color: '#dc2626' }}>
          {user?.first_name} {user?.last_name}
        </Text>
      </View>
    </View>
  );
};

const Home = React.forwardRef<View, {}>((props, ref) => {
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

  // Different folder background images for each card
  const folderImages = [
    require("../../assets/images/folder.png"),
    require("../../assets/images/folder1.png"),
    require("../../assets/images/folder2.png"),
    require("../../assets/images/folder3.png"),
  ];

  // Quick links data with icons
  const quickLinks: QuickLink[] = [
    {
      id: 1,
      title: "Announcements",
      description: "Stay informed with the latest updates and essential details you won't want to miss.",
      color: "#8C2323",
      count: 5,
      bgImage: folderImages[0],
      onPress: () => router.push("/screens/announcements"),
      icon: <Megaphone size={28} color="white" />,
    },
    {
      id: 2,
      title: "Learning Materials",
      description: "Access and download course materials and resources ",
      color: "#8C2323",
      count: 24,
      bgImage: folderImages[1],
      onPress: () => router.push("/screens/learning-materials"),
      icon: <BookOpen size={28} color="white" />,
    },
    {
      id: 3,
      title: "Events Calendar",
      description: "Don't miss out-mark your calendar with key dates for assembles, sports and celebrations",
      color: "#8C2323",
      count: 3,
      bgImage: folderImages[2],
      onPress: () => router.push("/screens/calendar"),
      icon: <CalendarDays size={28} color="white" />,
    },
    {
      id: 4,
      title: "School Calendar",
      description: "View and download the latest updated school calendar",
      color: "#8C2323",
      count: 24,
      bgImage: folderImages[3],
      onPress: () => router.push("/screens/school-calendar"),
      icon: <CalendarDays size={28} color="white" />,
    },
  ];

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        if (!authLoading && !user) {
          // No user session found, redirect to login
          router.replace("/auth/login");
          return;
        }

        // Simulate loading delay only if user exists
        if (user) {
          const timer = setTimeout(() => {
            setIsLoading(false);
          }, 1500);

          return () => clearTimeout(timer);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [user, authLoading]);

  const handleProfilePress = () => {
    router.push("/profile");
  };

  const handleForceLogout = async () => {
    await clearUser();
    router.replace("/auth/login");
  };

  // Show nothing while checking authentication
  if (authLoading || (!user && !authLoading)) {
    return null;
  }

  // Show the skeleton loader if loading
  if (isLoading) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor, padding: isLargeWeb ? 16 : 12 }}
        className={isLargeWeb ? "max-w-4xl mx-auto" : ""}
      >
        {/* Welcome Header Skeleton */}
        <View className="flex-row justify-between p-2 items-center mb-4">
          <View className="flex-1">
            <SkeletonLoader width={120} height={16}>
              <SkeletonPulse />
            </SkeletonLoader>
            <SkeletonLoader width={200} height={32} style={{ marginTop: 4 }}>
              <SkeletonPulse />
            </SkeletonLoader>
          </View>
        </View>

        {/* Section Title Skeleton */}
        <View className="mb-6 ml-2">
          <SkeletonLoader width={120} height={24}>
            <SkeletonPulse />
          </SkeletonLoader>
          <SkeletonLoader width={200} height={16} style={{ marginTop: 4 }}>
            <SkeletonPulse />
          </SkeletonLoader>
        </View>

        {/* Quick Links Grid Skeleton */}
        <View className="flex-col">
          {[1, 2, 3, 4].map((item) => (
            <View
              key={item}
              className="mb-4 rounded-2xl overflow-hidden"
              style={{ width: "100%" }}
            >
              <SkeletonLoader width="100%" height={145} borderRadius={16}>
                <SkeletonPulse />
              </SkeletonLoader>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor, padding: isLargeWeb ? 16 : 12 }}
      className={isLargeWeb ? "max-w-4xl mx-auto" : ""}
    >
      {/* Welcome Header */}
      <WelcomeHeader user={user} onProfilePress={handleProfilePress} />

      {/* Section Title */}
      <View className="mb-3 ml-2">
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: textColor }}>
          Quick Access
        </Text>
        <Text style={{ fontSize: 14, color: mutedColor }}>
          Quickly navigate to important sections
        </Text>
      </View>

      {/* Quick Links Grid */}
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

      {/* Force logout button for testing */}
      {isWeb && (
        <TouchableOpacity
          onPress={handleForceLogout}
          className="mt-8 p-3 bg-red-100 dark:bg-red-900 rounded-lg"
        >
          <Text className="text-red-600 dark:text-red-200 text-center">
            Force Logout (Testing)
          </Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
});

Home.displayName = 'Home';

export default Home;
