import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { User } from '@/@types/screens/messages';
import { getInitials } from './utils';

interface ActiveUserItemProps {
  item: User;
  onPress: () => void;
  textColor: string;
}

export const ActiveUserItem = ({ item, onPress, textColor }: ActiveUserItemProps) => {
  return (
    <View className="items-center mr-4">
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className="items-center"
      >
        <View className="relative">
          {item.avatar_url ? (
            <Image
              source={{ uri: item.avatar_url }}
              className="w-14 h-14 rounded-full"
              style={{ backgroundColor: '#af1616' }}
            />
          ) : (
            <View className="w-14 h-14 rounded-full items-center justify-center" style={{ backgroundColor: '#af1616' }}>
              <Text className="text-white font-bold text-sm">
                {getInitials(item.name || '')}
              </Text>
            </View>
          )}
          {item.isOnline === true && (
            <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
          )}
        </View>
        <Text 
          className="text-xs mt-2 text-center" 
          style={{ color: textColor, width: 60 }}
          numberOfLines={1}
        >
          {(item.name || '').split(' ')[0]}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
