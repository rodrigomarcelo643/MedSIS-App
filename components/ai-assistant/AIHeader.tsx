import React from 'react';
import { View, Text, Image } from 'react-native';

interface AIHeaderProps {
  cardColor: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
}

export const AIHeader: React.FC<AIHeaderProps> = ({ cardColor, textColor, mutedColor, borderColor }) => (
  <View style={{ backgroundColor: cardColor, paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: borderColor }}>
    <View className="flex-row items-center">
      <View className="w-10 h-10 rounded-full items-center justify-center mr-3">
        <Image
          source={require("../../assets/images/chatbot.png")}
          className="w-10 h-10"
        />
      </View>
      <View>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: textColor }}>
          <Text className="text-[#af1616] font-extrabold">ARD</Text>
          <Text className="text-[#16a34a] font-extrabold">MS</Text> AI
        </Text>
        <Text style={{ fontSize: 14, color: mutedColor }}>
          Academic Records Support
        </Text>
      </View>
    </View>
  </View>
);
