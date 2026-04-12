import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { User } from '@/@types/screens/messages';
import { getInitials } from './utils';

interface ConversationItemProps {
  item: User;
  onPress: () => void;
  textColor: string;
  mutedColor: string;
}

export const ConversationItem = ({ item, onPress, textColor, mutedColor }: ConversationItemProps) => {
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
        <View className="flex-row items-center justify-between">
          <Text className={`text-base ${item.unreadCount > 0 ? 'font-bold' : 'font-semibold'}`} style={{ color: textColor }}>
            {item.name}
          </Text>
          <Text className="text-xs" style={{ color: mutedColor }}>
            {item.lastMessageTime}
          </Text>
        </View>
        <View className="flex-row items-center justify-between mt-1">
          <View className="flex-1 flex-row items-center">
            <Text
              className={`text-sm flex-1 ${item.unreadCount > 0 ? 'font-semibold' : ''}`}
              style={{ color: item.unreadCount > 0 ? textColor : mutedColor }}
              numberOfLines={1}
            >
              {item.lastMessage && item.lastMessage.length > 30 
                ? `${item.lastMessage.substring(0, 30)}...` 
                : item.lastMessage
              }
            </Text>
            {item.messageStatus && (
              <View className="flex-row items-center ml-2">
                {item.messageStatus.toLowerCase().trim() === 'seen' ? (
                  <View className="flex-row items-center">
                    {item.avatar_url ? (
                      <Image
                        source={{ uri: item.avatar_url }}
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: '#af1616' }}
                      />
                    ) : (
                      <View className="w-4 h-4 rounded-full items-center justify-center" style={{ backgroundColor: '#af1616' }}>
                        <Text className="text-white text-xs font-bold text-center" style={{ fontSize: 8, lineHeight: 16 }}>
                          {getInitials(item.name || '').charAt(0)}
                        </Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <Text className="text-xs" style={{ color: mutedColor }}>
                    {item.messageStatus.toLowerCase().trim() === 'delivered' && !item.isOnline 
                      ? 'Sent' 
                      : item.messageStatus
                    }
                  </Text>
                )}
              </View>
            )}
          </View>
          {item.unreadCount > 0 && (
            <View className="bg-[#af1616] rounded-full min-w-[20px] h-5 items-center justify-center ml-2">
              <Text className="text-white text-xs font-bold">
                {item.unreadCount > 99 ? '99+' : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};
