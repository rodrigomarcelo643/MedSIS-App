import { WelcomeHeaderProps } from "@/@types/tabs";
import React from "react";
import { Text, View } from "react-native";

export const WelcomeHeader: React.FC<
  WelcomeHeaderProps & { mutedColor: string }
> = ({ user, mutedColor }) => {
  return (
    <View className="flex-row justify-between p-2 items-center ">
      <View className="flex-1">
        <Text style={{ fontSize: 16, color: mutedColor, marginBottom: 4 }}>
          Welcome back,
        </Text>
        <Text style={{ fontSize: 30, fontWeight: "bold", color: "#dc2626" }}>
          {user?.first_name} {user?.last_name}
        </Text>
      </View>
    </View>
  );
};
