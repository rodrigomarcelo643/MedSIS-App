import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ViewStyle
} from 'react-native';

interface SkeletonLoaderProps {
  width: number | string;
  height: number | string;
  borderRadius?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
}

interface QuickLinkCardProps {
  title: string;
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
}

// Skeleton Loader Component
const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ width, height, borderRadius = 4, style = {}, children }) => {
  return (
    <View 
      className="bg-gray-100 dark:bg-gray-800 mb-2 overflow-hidden"
      style={[{ width, height, borderRadius }, style]}
    >
      <View className="w-full h-full mb-2 bg-gray-200 dark:bg-gray-700" style={{ opacity: 0.5 }}>
        {children}
      </View>
    </View>
  );
};

// Skeleton with pulse animation
const SkeletonPulse = () => {
  return (
    <View className="absolute top-0 left-0 mb-2 right-0 bottom-0 bg-gray-300 dark:bg-gray-600 opacity-20" 
      style={{
        animationDuration: '1.5s',
        animationIterationCount: 'infinite',
        animationTimingFunction: 'ease-in-out',
        animationKeyframes: {
          '0%': { opacity: 0.2 },
          '50%': { opacity: 0.4 },
          '100%': { opacity: 0.2 },
        }
      }}
    />
  );
};

const QuickLinkCard: React.FC<QuickLinkCardProps> = ({ title, onPress, color, bgImage }) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
      className="mb-0 -mt-2 rounded-2xl  overflow-hidden"
      activeOpacity={0.8}
      style={{ width: '48%', marginHorizontal: '1%'}}
    >
      <View className="rounded-2xl overflow-hidden" style={{ height: 145  }}>
        {/* Background Image */}
        <Image 
          source={bgImage}
          className="w-full h-full absolute shadow-3xl"
          resizeMode="cover"
        />
        {/* Content Overlay */}
      <View className="flex-1 p-6 justify-center  items-center">
        <View className="flex-row items-center justify-center">
          <View className="flex-1  items-center">
            <Text className="text-md font-semibold whitespace-nowrap text-white  text-center">
              {title}
            </Text>       
          </View>
        </View>
      </View>
      </View>
    </TouchableOpacity>
  );
};

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ user, onProfilePress }) => {
  return (
    <View className="flex-row justify-between p-2 items-center mb-4">
      <View className="flex-1">
        <Text className="text-md text-gray-500 dark:text-gray-400 mb-1">
          Welcome back,
        </Text>
        <Text className="text-3xl font-bold text-red-700 dark:text-white">
          {user?.first_name} {user?.last_name}
        </Text>
      </View>
    </View>
  );
};

export default function Home() {
  const { width } = useWindowDimensions();
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading, clearUser } = useAuth();
  const router = useRouter();
  const isWeb = Platform.OS === 'web';
  const isLargeWeb = isWeb && width >= 1024;

  // Different folder background images for each card
  const folderImages = [
    require('../../assets/images/folder5.png'),
    require('../../assets/images/folder5.png'),
    require('../../assets/images/folder5.png'),
    require('../../assets/images/folder.png'),
    require('../../assets/images/folder.png'),
  ];
  // Quick links data - Only Evaluations, Learning Materials, and Announcements
  const quickLinks: QuickLink[] = [
    {
      id: 1,
      title: 'Announcements',
        description: 'Latest updates and important notices',
      color: '#8C2323', 
      count: 5,
      bgImage: folderImages[0],
      onPress: () => router.push('/screens/announcements')
    },
        {
      id: 2,
      title: 'Learning Materials',
      description: 'Access course materials and resources',
      color: '#8C2323', 
      count: 24,
      bgImage: folderImages[1],
      onPress: () => router.push('/screens/learning-materials')
    },
        {
      id: 3,
      title: 'Events Calendar',
      description: 'Latest updates and important notices',
      color: '#8C2323', 
      count: 3,
      bgImage: folderImages[2],
      onPress: () => router.push('/screens/calendar')
    },

       {
      id: 4,
      title: 'School Calendar',
      description: 'University Calendar ',
      color: '#8C2323', 
      count: 24,
      bgImage: folderImages[1],
      onPress: () => router.push('/screens/school-calendar')
    },


  ];

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
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
    };
    
    checkAuth();
  }, [user, authLoading]);

  const handleProfilePress = () => {
    router.push('/profile');
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
      <ScrollView className={`flex-1 bg-gray-50 dark:bg-gray-900 ${isLargeWeb ? 'p-4 max-w-4xl mx-auto' : 'p-3'}`}>
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
        <View className="flex-row flex-wrap justify-between">
          {[1, 2, 3, 4].map((item) => (
            <View key={item} className="mb-0 -mt-2 rounded-2xl overflow-hidden" style={{ width: '48%', marginHorizontal: '1%' }}>
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
    <ScrollView className={`flex-1  bg-gray-50 dark:bg-gray-900 ${isLargeWeb ? 'p-4 max-w-4xl mx-auto' : 'p-3'}`}>
      {/* Welcome Header */}
      <WelcomeHeader 
        user={user} 
        onProfilePress={handleProfilePress}      
      />
        {/* Section Title */}
      <View className="mb-6 ml-2">
        <Text className="text-xl font-bold text-gray-800 dark:text-white">
          Quick Access
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400">
          Quickly navigate to important sections
        </Text>
      </View>
      {/* Quick Links Grid */}
      <View className="flex-row flex-wrap justify-between">
        {quickLinks.map((link) => (
          <QuickLinkCard
            key={link.id}
            title={link.title}
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
          <Text className="text-red-600 dark:text-red-200 text-center">Force Logout (Testing)</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}