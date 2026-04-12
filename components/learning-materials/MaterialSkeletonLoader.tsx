import React from 'react';
import { View } from 'react-native';

export const MaterialSkeletonLoader = () => {
  return (
    <View className="p-4">
      {[1, 2, 3].map((item) => (
        <View key={item} className="bg-white rounded-xl p-4 mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <View className="h-6 w-24 bg-gray-200 rounded-full"></View>
            <View className="h-6 w-16 bg-gray-200 rounded-full"></View>
          </View>
          <View className="h-6 w-3/4 bg-gray-200 rounded mb-2"></View>
          <View className="h-4 w-full bg-gray-200 rounded mb-1"></View>
          <View className="h-4 w-5/6 bg-gray-200 rounded mb-3"></View>
          <View className="flex-row justify-between items-center">
            <View className="h-4 w-20 bg-gray-200 rounded"></View>
            <View className="h-4 w-24 bg-gray-200 rounded"></View>
          </View>
        </View>
      ))}
    </View>
  );
};
