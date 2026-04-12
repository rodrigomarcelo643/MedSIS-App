import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ChevronLeft } from 'lucide-react-native';

export const SkeletonLoader = ({ backgroundColor, cardColor, loadColor }: { backgroundColor: string, cardColor: string, loadColor: string }) => {
  return (
    <View className="flex-1" style={{ backgroundColor }}>
      <View className="bg-[#af1616] pt-12 pb-4 px-5 flex-row items-center">
        <View className="h-6 w-6 bg-[#af1616]-light rounded mr-3"></View>
        <View className="h-6 bg-[#af1616]-light rounded w-40"></View>
      </View>
      <View className="p-5">
        {[1, 2, 3].map((item) => (
          <View key={item} className="p-4 rounded-lg shadow mb-4" style={{ backgroundColor: cardColor }}>
            <View className="h-6 rounded w-3/4 mb-3" style={{ backgroundColor: loadColor }}></View>
            <View className="h-4 rounded w-1/2 mb-2" style={{ backgroundColor: loadColor }}></View>
            <View className="h-4 rounded w-2/3 mb-4" style={{ backgroundColor: loadColor }}></View>
            <View className="h-12 rounded" style={{ backgroundColor: loadColor }}></View>
          </View>
        ))}
      </View>
    </View>
  );
};

export const ErrorState = ({ error, onRetry }: { error: string | null, onRetry: () => void }) => (
  <View className="flex-1 justify-center items-center p-5 bg-gray-100">
    <Ionicons
      name="alert-circle"
      size={48}
      color="#dc2626"
      className="mb-4"
    />
    <Text className="text-gray-600 mb-2 text-center">
      Failed to load calendar data
    </Text>
    <Text className="text-gray-500 mb-4 text-center text-sm">{error}</Text>
    <TouchableOpacity
      onPress={onRetry}
      className="bg-[#af1616] px-4 py-2 rounded flex-row items-center"
    >
      <Ionicons name="refresh" size={16} color="white" className="mr-2" />
      <Text className="text-white">Try Again</Text>
    </TouchableOpacity>
  </View>
);

export const MainEmptyState = ({ 
  backgroundColor, cardColor, textColor, mutedColor, loadColor, onRetry, onBack 
}: { 
  backgroundColor: string, cardColor: string, textColor: string, mutedColor: string, loadColor: string, onRetry: () => void, onBack: () => void 
}) => (
  <View className="flex-1" style={{ backgroundColor }}>
    <View className="pt-12 pb-4 px-5 flex-row items-center">
      <TouchableOpacity onPress={onBack} className="mr-4">
        <ChevronLeft size={24} color="gray" />
      </TouchableOpacity>
      <Text className="text-xl font-bold">School Calendar</Text>
    </View>
    <View className="flex-1 justify-center items-center p-8">
      <View className="rounded-2xl p-8 items-center shadow-lg" style={{ backgroundColor: cardColor }}>
        <View className="rounded-full p-6 mb-4" style={{ backgroundColor: loadColor }}>
          <Ionicons name="calendar-outline" size={64} color="#9ca3af" />
        </View>
        <Text className="text-xl font-bold mb-2 text-center" style={{ color: textColor }}>
          No Calendar Data
        </Text>
        <Text className="text-center mb-6" style={{ color: mutedColor }}>
          There are no academic calendars available at the moment.
        </Text>
        <TouchableOpacity
          onPress={onRetry}
          className="bg-[#af1616] px-8 py-3 rounded-xl flex-row items-center shadow-sm"
        >
          <Ionicons name="refresh" size={20} color="white" className="mr-2" />
          <Text className="text-white font-semibold ml-2">Retry</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

export const FilteredEmptyState = ({ 
  cardColor, textColor, mutedColor, loadColor, onRefresh 
}: { 
  cardColor: string, textColor: string, mutedColor: string, loadColor: string, onRefresh: () => void 
}) => (
  <View className="p-8 rounded-2xl shadow-lg items-center" style={{ backgroundColor: cardColor }}>
    <View className="rounded-full p-6 mb-4" style={{ backgroundColor: loadColor }}>
      <Ionicons
        name="calendar-outline"
        size={56}
        color="#9ca3af"
      />
    </View>
    <Text className="text-lg font-bold mb-2 text-center" style={{ color: textColor }}>
      No Calendars Found
    </Text>
    <Text className="text-center mb-6" style={{ color: mutedColor }}>
      No academic calendars available for your year level at this time.
    </Text>
    <TouchableOpacity
      onPress={onRefresh}
      className="bg-[#af1616] px-6 py-3 rounded-xl flex-row items-center shadow-sm"
    >
      <Ionicons
        name="refresh"
        size={18}
        color="white"
      />
      <Text className="text-white font-semibold ml-2">Refresh</Text>
    </TouchableOpacity>
  </View>
);
