import React from 'react';
import { View } from 'react-native';
import { Skeleton } from '@/components/ui/Skeleton';

export const NmatScoreSkeleton: React.FC = () => (
  <View style={{ gap: 12 }}>
    <Skeleton width="100%" height={120} borderRadius={12} />
    <Skeleton width="100%" height={60} borderRadius={8} />
  </View>
);
