import React from 'react';
import { View } from 'react-native';

export const SkeletonLoader = ({ width, height, borderRadius = 4, mutedColor }: { width: number | string; height: number; borderRadius?: number; mutedColor: string }) => {
  return (
    <View
      style={{
        width: width as any,
        height,
        borderRadius,
        backgroundColor: mutedColor + '30',
      } as any}
    />
  );
};

export const ActiveSkeleton = ({ mutedColor }: { mutedColor: string }) => (
  <View className="flex-row px-4 pb-4">
    {[1, 2, 3, 4, 5 ].map((item) => (
      <View key={item} className="items-center mr-4">
        <SkeletonLoader width={56} height={56} borderRadius={28} mutedColor={mutedColor} />
        <View style={{ marginTop: 8 }}>
          <SkeletonLoader width={50} height={12} borderRadius={6} mutedColor={mutedColor} />
        </View>
      </View>
    ))}
  </View>
);

export const ConversationSkeleton = ({ cardColor, mutedColor }: { cardColor: string, mutedColor: string }) => (
  <View style={{ backgroundColor: cardColor }}>
    {[1, 2, 3, 4, 5, 6].map((item) => (
      <View key={item} className="flex-row items-center p-4" style={{ borderBottomWidth: 1, borderBottomColor: mutedColor + '30' }}>
        <SkeletonLoader width={48} height={48} borderRadius={24} mutedColor={mutedColor} />
        <View className="flex-1 ml-3">
          <View className="flex-row items-center justify-between">
            <SkeletonLoader width={120} height={16} borderRadius={8} mutedColor={mutedColor} />
            <SkeletonLoader width={40} height={12} borderRadius={6} mutedColor={mutedColor} />
          </View>
          <View style={{ marginTop: 4 }}>
            <SkeletonLoader width={180} height={12} borderRadius={6} mutedColor={mutedColor} />
          </View>
        </View>
      </View>
    ))}
  </View>
);
