import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft } from "lucide-react-native";

interface PolicyHeaderProps {
  onBack: () => void;
  title: string;
}

export const PolicyHeader: React.FC<PolicyHeaderProps> = ({ onBack, title }) => (
  <View className="bg-[#af1616] pt-16 px-4 pb-4 rounded-b-2xl shadow-sm">
    <View className="flex-row items-center mb-2">
      <TouchableOpacity
        onPress={onBack}
        className="mr-4 p-2 rounded-full bg-white/20"
      >
        <ArrowLeft size={20} color="white" />
      </TouchableOpacity>
      <Text className="text-2xl font-bold text-white flex-1" numberOfLines={1}>
        {title}
      </Text>
    </View>
    <Text className="text-white/90 text-sm ml-12">
      Please read carefully before accepting
    </Text>
  </View>
);
