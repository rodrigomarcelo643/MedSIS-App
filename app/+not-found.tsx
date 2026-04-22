import { Link, Stack } from 'expo-router';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NotFoundScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({}, 'muted');
  const insets = useSafeAreaInsets();
  const { width } = Dimensions.get('window');

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ flex: 1, backgroundColor }} className="items-center justify-center px-8">
        {/* Background Decorations */}
        <View 
          className="absolute opacity-5" 
          style={{ 
            top: -100, 
            right: -100, 
            width: 300, 
            height: 300, 
            borderRadius: 150, 
            backgroundColor: '#af1616' 
          }} 
        />
        <View 
          className="absolute opacity-5" 
          style={{ 
            bottom: -50, 
            left: -50, 
            width: 200, 
            height: 200, 
            borderRadius: 100, 
            backgroundColor: '#15803d' 
          }} 
        />

        {/* 404 Illustration */}
        <View className="items-center mb-10">
          <View className="w-40 h-40 bg-red-50 rounded-full items-center justify-center mb-6">
            <FileQuestion size={80} color="#af1616" strokeWidth={1.5} />
          </View>
          <Text className="text-8xl font-black tracking-tighter" style={{ color: '#af1616' }}>
            404
          </Text>
          <View className="h-1.5 w-16 bg-green-600 rounded-full mt-2" />
        </View>

        {/* Text Content */}
        <View className="items-center mb-12">
          <Text className="text-2xl font-bold text-center mb-3" style={{ color: textColor }}>
            Page Not Found
          </Text>
          <Text className="text-base text-center leading-6" style={{ color: mutedColor }}>
            Oops! It seems you've wandered into an uncharted area of ARDMS. The page you're looking for doesn't exist or has been moved.
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="w-full space-y-4">
          <Link href="/(tabs)/home" asChild>
            <TouchableOpacity 
              className="bg-[#af1616] h-14 rounded-xl flex-row items-center justify-center shadow-lg"
              style={{ elevation: 4 }}
            >
              <Home size={20} color="white" className="mr-2" />
              <Text className="text-white text-lg font-bold ml-2">Back to Dashboard</Text>
            </TouchableOpacity>
          </Link>

          <Link href=".." asChild>
            <TouchableOpacity 
              className="h-14 rounded-xl flex-row items-center justify-center border border-gray-200"
              style={{ backgroundColor: backgroundColor === '#ffffff' ? '#f9fafb' : '#1f293720' }}
            >
              <ArrowLeft size={18} color={mutedColor} className="mr-2" />
              <Text className="text-base font-semibold ml-2" style={{ color: mutedColor }}>Go Back</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Footer Branding */}
        <View className="absolute bottom-10 items-center">
          <Text className="text-xs uppercase tracking-widest font-bold" style={{ color: mutedColor + '80' }}>
            ARDMS • SWU Medicine
          </Text>
        </View>
      </View>
    </>
  );
}
