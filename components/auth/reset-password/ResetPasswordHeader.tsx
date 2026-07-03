import { ArrowLeft } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ResetPasswordHeaderProps {
  onBack: () => void;
  title: string;
}

export const ResetPasswordHeader: React.FC<ResetPasswordHeaderProps> = ({
  onBack,
  title,
}) => (
  <View className="flex-row items-center px-4 py-4 pt-10 bg-white border-b border-gray-200">
    <TouchableOpacity onPress={onBack} className="mr-3">
      <ArrowLeft size={24} color="#1f2937" />
    </TouchableOpacity>
    <Text className="text-xl font-bold text-gray-900">{title}</Text>
  </View>
);
