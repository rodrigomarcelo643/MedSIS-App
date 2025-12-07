import { useAuth } from "@/contexts/AuthContext";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#af1616" />
      </View>
    );
  }

  if (user) {
    // Check if user has accepted policy
    if (user.policy_accepted === 1) {
      return <Redirect href="/(tabs)/home" />;
    }
    // If user exists but hasn't accepted policy, stay on current screen
    // The policy acceptance screen will handle the flow
    return null;
  }

  return <Redirect href="/auth/login" />;
}