import React from 'react';
import { View, Text } from 'react-native';

interface PolicyCardProps {
  icon: React.ReactNode;
  iconBgColor: string;
  title: string;
  children: React.ReactNode;
}

export const PolicyCard: React.FC<PolicyCardProps> = ({
  icon,
  iconBgColor,
  title,
  children,
}) => (
  <View className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-gray-100">
    <View className="flex-row items-center mb-3">
      <View className={`p-2 rounded-lg mr-3 ${iconBgColor}`}>
        {icon}
      </View>
      <Text className="text-lg font-bold text-gray-800 flex-1">
        {title}
      </Text>
    </View>
    {children}
  </View>
);
