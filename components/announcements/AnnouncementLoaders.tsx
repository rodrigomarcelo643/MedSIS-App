import React from 'react';
import { View } from 'react-native';

export const SkeletonLoader = ({ cardColor, loadColor }: { cardColor: string; loadColor: string }) => {
  return (
    <View className="p-4">
      {[1, 2, 3, 4].map((item) => (
        <View key={item} className="bg-white rounded-xl p-4 mb-4" style={{ backgroundColor: cardColor }}>
          <View className="flex-row justify-between items-center mb-3">
            <View className="h-6 w-24 bg-gray-200 rounded-full" style={{ backgroundColor: loadColor }}></View>
            <View className="h-6 w-16 bg-gray-200 rounded-full" style={{ backgroundColor: loadColor }}></View>
          </View>
          <View className="h-6 w-3/4 bg-gray-200 rounded mb-2" style={{ backgroundColor: loadColor }}></View>
          <View className="h-4 w-full bg-gray-200 rounded mb-1" style={{ backgroundColor: loadColor }}></View>
          <View className="h-4 w-5/6 bg-gray-200 rounded mb-3" style={{ backgroundColor: loadColor }}></View>
          <View className="flex-row justify-between items-center">
            <View className="h-4 w-20 bg-gray-200 rounded" style={{ backgroundColor: loadColor }}></View>
            <View className="h-4 w-24 bg-gray-200 rounded" style={{ backgroundColor: loadColor }}></View>
          </View>
        </View>
      ))}
    </View>
  );
};

export const LazyLoader = ({ cardColor, loadColor }: { cardColor: string; loadColor: string }) => {
  return (
    <View className="p-4">
      {[1, 2].map((item) => (
        <View key={item} className="bg-white rounded-xl p-4 mb-4" style={{ backgroundColor: cardColor }}>
          <View className="flex-row justify-between items-center mb-3">
            <View className="h-6 w-24 bg-gray-200 rounded-full" style={{ backgroundColor: loadColor }}></View>
            <View className="h-6 w-16 bg-gray-200 rounded-full" style={{ backgroundColor: loadColor }}></View>
          </View>
          <View className="h-6 w-3/4 bg-gray-200 rounded mb-2" style={{ backgroundColor: loadColor }}></View>
          <View className="h-4 w-full bg-gray-200 rounded mb-1" style={{ backgroundColor: loadColor }}></View>
          <View className="h-4 w-5/6 bg-gray-200 rounded mb-3" style={{ backgroundColor: loadColor }}></View>
          <View className="flex-row justify-between items-center">
            <View className="h-4 w-20 bg-gray-200 rounded" style={{ backgroundColor: loadColor }}></View>
            <View className="h-4 w-24 bg-gray-200 rounded" style={{ backgroundColor: loadColor }}></View>
          </View>
        </View>
      ))}
    </View>
  );
};
