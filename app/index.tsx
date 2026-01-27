import { useAuth } from "@/contexts/AuthContext";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const authContext = useAuth();
  
  if (!authContext || !authContext.hasOwnProperty('user')) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#af1616" />
      </View>
    );
  }
  
  const { user, loading } = authContext;

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#af1616" />
      </View>
    );
  }

  if (user) {
   return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/auth/login" />;
}