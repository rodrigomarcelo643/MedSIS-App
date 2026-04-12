import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { User } from '@/@types/screens/messages';
import { getInitials } from './utils';

interface SearchResultItemProps {
  item: User;
  onPress: () => void;
  textColor: string;
  mutedColor: string;
}

export const SearchResultItem = ({ item, onPress, textColor, mutedColor }: SearchResultItemProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center p-4 border-b border-gray-100"
      style={{ borderBottomColor: mutedColor + '30' }}
    >
      <View className="relative">
        {item.avatar_url ? (
          <Image
            source={{ uri: item.avatar_url }}
            className="w-12 h-12 rounded-full"
            style={{ backgroundColor: '#af1616' }}
          />
        ) : (
          <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: '#af1616' }}>
            <Text className="text-white font-bold text-sm">
              {getInitials(item.name || '')}
            </Text>
          </View>
        )}
        {item.isOnline === true && (
          <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
        )}
      </View>
      
      <View className="flex-1 ml-3">
        <Text className="font-semibold text-base" style={{ color: textColor }}>
          {item.name}
        </Text>
        <Text className="text-sm" style={{ color: mutedColor }} numberOfLines={1}>
          {item.lastMessage && item.lastMessage.length > 40 
            ? `${item.lastMessage.substring(0, 40)}...` 
            : (item.lastMessage || (item.isOnline ? 'Online' : 'Offline'))
          }
        </Text>
      </View>
    </TouchableOpacity>
  );
};
