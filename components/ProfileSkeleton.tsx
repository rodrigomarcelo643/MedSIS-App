import React from 'react';
import { View, Text } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

const SkeletonBox = ({ width, height, style }: { width: number | string; height: number; style?: any }) => {
  const backgroundColor = useThemeColor({}, 'muted');
  
  return (
    <View
      style={[
        {
          width,
          height,
          backgroundColor: backgroundColor + '40',
          borderRadius: 8,
        },
        style,
      ]}
    />
  );
};

const ProfileSkeleton = () => {
  const cardColor = useThemeColor({}, 'card');
  
  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Header Skeleton */}
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <SkeletonBox width={112} height={112} style={{ borderRadius: 56, marginBottom: 16 }} />
        <SkeletonBox width={200} height={24} style={{ marginBottom: 8 }} />
        <SkeletonBox width={120} height={40} style={{ borderRadius: 20 }} />
      </View>

      {/* Section Skeletons */}
      {[1, 2, 3].map((section) => (
        <View
          key={section}
          style={{
            backgroundColor: cardColor,
            borderRadius: 12,
            padding: 20,
            marginBottom: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          }}
        >
          {/* Section Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <SkeletonBox width={40} height={40} style={{ borderRadius: 8, marginRight: 12 }} />
            <SkeletonBox width={150} height={20} />
          </View>

          {/* Section Items */}
          {[1, 2, 3].map((item) => (
            <View
              key={item}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                borderBottomWidth: item < 3 ? 1 : 0,
                borderBottomColor: '#f3f4f6',
              }}
            >
              <SkeletonBox width={32} height={32} style={{ borderRadius: 8, marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <SkeletonBox width={80} height={14} style={{ marginBottom: 4 }} />
                <SkeletonBox width="60%" height={16} />
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

export default ProfileSkeleton;