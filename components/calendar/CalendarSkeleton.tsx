import React from 'react';
import { View } from 'react-native';
import { ViewMode } from '@/@types/screens/calendar';
import { days } from './constants';

interface SkeletonLoaderProps {
  backgroundColor: string;
  loadColor: string;
  cardColor: string;
  gridBorderColor: string;
  viewMode: ViewMode;
}

export const CalendarSkeleton: React.FC<SkeletonLoaderProps> = ({
  backgroundColor,
  loadColor,
  cardColor,
  gridBorderColor,
  viewMode,
}) => {
  return (
    <View className="flex-1 p-4 mt-6" style={{backgroundColor}}>
      {/* Header skeleton */}
      <View className="h-12 rounded-md mb-4 animate-pulse" style={{backgroundColor: loadColor}}></View>
      
      {/* Navigation skeleton */}
      <View className="flex-row justify-between items-center mb-4">
        <View className="h-10 w-10 rounded-full animate-pulse" style={{backgroundColor: loadColor}}></View>
        <View className="flex-row">
          <View className="h-10 w-24 rounded-md mr-2 animate-pulse" style={{backgroundColor: loadColor}}></View>
          <View className="h-10 w-20 rounded-md animate-pulse" style={{backgroundColor: loadColor}}></View>
        </View>
        <View className="h-10 w-10 rounded-full animate-pulse" style={{backgroundColor: loadColor}}></View>
      </View>
      
      {/* Calendar grid skeleton */}
      {viewMode === "month" && (
        <View className="flex-1">
          {/* Weekday headers skeleton */}
          <View className="flex-row mb-2">
            {days.map((_, i) => (
              <View key={i} className="flex-1 items-center">
                <View className="h-6 w-10 rounded-md animate-pulse" style={{backgroundColor: loadColor}}></View>
              </View>
            ))}
          </View>
          
          {/* Calendar days skeleton */}
          {Array.from({ length: 6 }).map((_, rowIndex) => (
            <View key={rowIndex} className="flex-row mb-1 mt-2">
              {Array.from({ length: 4 }).map((_, colIndex) => (
                <View key={colIndex} className="flex-1 aspect-square p-1">
                  <View className="flex-1 rounded-md animate-pulse" style={{backgroundColor: loadColor}}></View>
                </View>
              ))}
            </View>
          ))}
        </View>
      )}
      
      {viewMode === "week" && (
        <View className="flex-1">
          {/* Week header skeleton */}
          <View className="flex-row mb-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <View key={i} className="flex-1 items-center">
                <View className="h-8 w-8 rounded-full mb-1 animate-pulse" style={{backgroundColor: loadColor}}></View>
                <View className="h-4 w-12 rounded-md animate-pulse" style={{backgroundColor: loadColor}}></View>
              </View>
            ))}
          </View>
          
          {/* Time slots skeleton */}
          {Array.from({ length: 24 }).map((_, hourIndex) => (
            <View key={hourIndex} className="flex-row h-16 mb-2">
              <View className="w-14 items-end pr-2">
                <View className="h-4 w-10 rounded-md animate-pulse" style={{backgroundColor: loadColor}}></View>
              </View>
              <View className="flex-1 flex-row">
                {Array.from({ length: 7 }).map((_, dayIndex) => (
                  <View key={dayIndex} className="flex-1 mx-0.5" style={{borderColor: gridBorderColor, borderWidth: 1}}>
                    <View className="h-12 rounded-sm animate-pulse" style={{backgroundColor: cardColor}}></View>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}
      
      {viewMode === "day" && (
        <View className="flex-1">
          {/* Day header skeleton */}
          <View className="items-center py-4 mb-4">
            <View className="h-6 w-48 rounded-md mb-2 animate-pulse" style={{backgroundColor: loadColor}}></View>
            <View className="h-4 w-32 rounded-md animate-pulse" style={{backgroundColor: loadColor}}></View>
          </View>
          
          {/* Events skeleton */}
          {Array.from({ length: 3 }).map((_, i) => (
            <View key={i} className="p-4 rounded-xl mb-4 animate-pulse" style={{backgroundColor: cardColor}}>
              <View className="flex-row justify-between items-start mb-3">
                <View className="h-5 w-32 rounded-md" style={{backgroundColor: loadColor}}></View>
                <View className="h-6 w-16 rounded-md" style={{backgroundColor: loadColor}}></View>
              </View>
              <View className="flex-row items-center mb-2">
                <View className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: loadColor}}></View>
                <View className="h-4 w-40 rounded-md" style={{backgroundColor: loadColor}}></View>
              </View>
              <View className="h-4 w-full rounded-md mt-2" style={{backgroundColor: loadColor}}></View>
              <View className="h-4 w-3/4 rounded-md mt-1" style={{backgroundColor: loadColor}}></View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};
