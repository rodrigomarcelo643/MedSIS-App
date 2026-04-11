import React from 'react';
import { View, ScrollView } from 'react-native';

interface RequirementSkeletonProps {
  backgroundColor: string;
  loadColor: string;
}

export const RequirementSkeleton: React.FC<RequirementSkeletonProps> = ({
  backgroundColor,
  loadColor,
}) => {
  return (
    <View className="flex-1 bg-white p-4" style={{ backgroundColor }}>
      {/* Header Skeleton */}
      <View className="mb-6">
        <View className="h-8 bg-gray-200 rounded w-3/4 mb-2" style={{ backgroundColor: loadColor }}></View>
        <View className="h-4 bg-gray-200 rounded w-full" style={{ backgroundColor: loadColor }}></View>
      </View>

      {/* Search Bar Skeleton */}
      <View className="h-12 bg-gray-200 rounded-lg mb-4" style={{ backgroundColor: loadColor }}></View>

      {/* Stats Cards Skeleton */}
      <View className="flex-row justify-between mb-4 gap-1" >
        <View className="bg-gray-200 rounded-lg p-4 w-1/3 items-center shadow-md" style={{ backgroundColor: loadColor }}>
          <View className="h-4 bg-gray-300 rounded w-3/4 mb-2" style={{ backgroundColor: loadColor }}></View>
          <View className="h-8 bg-gray-300 rounded w-1/2" style={{ backgroundColor: loadColor }} ></View>
        </View>
        <View className="bg-gray-200 rounded-lg p-4 w-1/3 items-center shadow-md " style={{ backgroundColor: loadColor }}>
          <View className="h-4 bg-gray-300 rounded w-3/4 mb-2" style={{ backgroundColor: loadColor }}></View>
          <View className="h-8 bg-gray-300 rounded w-1/2" style={{ backgroundColor: loadColor }}></View>
        </View>
        <View className="bg-gray-200 rounded-lg p-4 w-1/3 items-center shadow-md" style={{ backgroundColor: loadColor }}>
          <View className="h-4 bg-gray-300 rounded w-3/4 mb-2" style={{ backgroundColor: loadColor }}></View>
          <View className="h-8 bg-gray-300 rounded w-1/2" style={{ backgroundColor: loadColor }}></View>
        </View>
      </View>

      {/* Filter Row Skeleton */}
      <View className="flex-row items-center gap-3 justify-between mb-4">
        <View className="h-10 bg-gray-200 rounded-lg w-1/3" style={{ backgroundColor: loadColor }}></View>
        <View className="h-10 bg-gray-200 rounded-lg w-2/3" style={{ backgroundColor: loadColor }}></View>
      </View>

      {/* Requirements List Skeleton */}
      <ScrollView className="mb-6">
        {[1, 2, 3].map((item) => (
          <View
            key={item}
            style={{ backgroundColor: loadColor }}
            className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 mb-4"
          >
            <View className="flex-row justify-between items-start mb-4">
              <View className="h-6 bg-gray-200 rounded w-3/4" style={{ backgroundColor: loadColor }}></View>
              <View className="w-6 h-6 bg-gray-200 rounded-md" style={{ backgroundColor: loadColor }}></View>
            </View>
            <View>
              <View className="flex-row justify-between items-center mb-4">
                <View className="h-4 bg-gray-200 rounded w-1/3" style={{ backgroundColor: loadColor }}></View>
                <View className="h-4 bg-gray-200 rounded w-1/6" style={{ backgroundColor: loadColor }}></View>
              </View>
              <View className="h-16 bg-gray-100 rounded-lg mb-2" style={{ backgroundColor: loadColor }}></View>
              <View className="items-end mt-2">
                <View className="h-10 bg-gray-200 rounded-lg w-32" style={{ backgroundColor: loadColor }}></View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
