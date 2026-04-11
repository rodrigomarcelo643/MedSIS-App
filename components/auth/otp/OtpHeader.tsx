import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft } from "lucide-react-native";

interface OtpHeaderProps {
  onBack: () => void;
  title: string;
}

export const OtpHeader: React.FC<OtpHeaderProps> = ({ onBack, title }) => (
  <View className="flex-row items-center mb-6">
    <TouchableOpacity onPress={onBack} className="mr-4 p-2 rounded-full bg-gray-100">
      <ArrowLeft size={24} color="#af1616" />
    </TouchableOpacity>
    <Text className="text-2xl font-bold text-[#af1616]">{title}</Text>
  </View>
);
