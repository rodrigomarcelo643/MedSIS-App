import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ScrollView } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

/**
 * Skeleton Loader for the Evaluations Screen
 * Matches the structure of:
 * - Permission Banner
 * - Summary Card
 * - Year Level Sections
 * 
 * Uses a pulsing animation for a premium feel.
 */
const EvaluationSkeleton: React.FC = () => {
  const backgroundColor = useThemeColor({}, 'background');
  const loaderColor = useThemeColor({}, 'loaderCard');
  
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const SkeletonItem = ({ style }: { style: any }) => (
    <Animated.View
      style={[
        { backgroundColor: loaderColor, opacity: pulseAnim, borderRadius: 2 },
        style,
      ]}
    />
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor }} contentContainerStyle={{ paddingVertical: 12 }}>
      
      {/* 1. Permission Banner Skeleton */}
      <View style={styles.sectionContainer}>
        <SkeletonItem style={{ height: 48, width: '100%' }} />
      </View>

      {/* 2. Summary Card Skeleton */}
      <View style={[styles.card, { padding: 20 }]}>
        <View style={{ alignItems: 'center' }}>
            <SkeletonItem style={{ height: 20, width: 140, marginBottom: 20 }} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* Circle */}
            <View style={{ flex: 1, alignItems: 'center' }}>
                <SkeletonItem style={{ width: 100, height: 100, borderRadius: 50 }} />
            </View>
            {/* Stats */}
            <View style={{ flex: 1, paddingLeft: 16 }}>
                {[1, 2, 3].map((i) => (
                    <View key={i} style={{ marginBottom: 12 }}>
                        <SkeletonItem style={{ height: 24, width: 40, marginBottom: 4 }} />
                        <SkeletonItem style={{ height: 12, width: 60 }} />
                    </View>
                ))}
            </View>
        </View>
      </View>

      {/* 3. Year Level Cards Skeleton (4 levels) */}
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={styles.card}>
            {/* Header */}
            <SkeletonItem style={{ height: 44, width: '100%' }} />
            {/* Content */}
            <View style={{ padding: 12 }}>
                {[1, 2].map((j) => (
                    <View key={j} style={{ padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#f3f4f6', borderRadius: 2 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                            <SkeletonItem style={{ height: 16, width: 60 }} />
                            <SkeletonItem style={{ height: 16, width: 80 }} />
                        </View>
                        <SkeletonItem style={{ height: 14, width: '80%', marginBottom: 12 }} />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <SkeletonItem style={{ height: 12, width: 40 }} />
                            <SkeletonItem style={{ height: 12, width: 50 }} />
                        </View>
                    </View>
                ))}
            </View>
        </View>
      ))}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginHorizontal: 12,
    marginBottom: 12,
  },
  card: {
    marginHorizontal: 12,
    marginBottom: 12,
    backgroundColor: 'transparent', // loaderColor will show via opacity
    borderRadius: 2,
    overflow: 'hidden',
  }
});

export default EvaluationSkeleton;
