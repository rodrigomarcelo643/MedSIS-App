import React from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { ArrowDown } from 'lucide-react-native';
import { Message } from '@/@types/screens/messages';
import { ChatMessageItem } from './ChatMessageItem';
import { SkeletonLoader } from './ChatUIElements';

interface ChatMessageListProps {
  flatListRef: any;
  messages: Message[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  renderDateSeparator: (date: string) => React.ReactNode;
  user: any;
  avatar?: string;
  name: string;
  cardColor: string;
  textColor: string;
  mutedColor: string;
  highlightedMessageId: string | null;
  selectedMessage: string | null;
  editLoading: boolean;
  unsendingMessage: string | null;
  userOnlineStatus: boolean;
  showScrollDown: boolean;
  onScrollToBottom: () => void;
  onScroll: (event: any) => void;
  onSelectMessage: (id: string | null) => void;
  onEditMessage: (item: Message) => void;
  onUnsendMessage: (id: string) => void;
  onImagePress: (url: string) => void;
  getInitials: (name: string) => string;
  canEditMessage: (timestamp: string) => boolean;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  flatListRef,
  messages,
  loading,
  loadingMore,
  hasMore,
  onLoadMore,
  renderDateSeparator,
  user,
  avatar,
  name,
  cardColor,
  textColor,
  mutedColor,
  highlightedMessageId,
  selectedMessage,
  editLoading,
  unsendingMessage,
  userOnlineStatus,
  showScrollDown,
  onScrollToBottom,
  onScroll,
  onSelectMessage,
  onEditMessage,
  onUnsendMessage,
  onImagePress,
  getInitials,
  canEditMessage,
}) => {
  if (messages.length === 0 && loading) {
    return (
      <View className="flex-1 px-4 pt-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
          <View key={item} className="mb-4">
            <View className={`flex-row ${item % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
              <View className={`flex-row max-w-[80%] ${item % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                {item % 2 !== 0 && (
                  <View className="mr-2">
                    <SkeletonLoader width={32} height={32} borderRadius={16} mutedColor={mutedColor} />
                  </View>
                )}
                <View className="rounded-2xl px-4 py-3" style={{ backgroundColor: item % 2 === 0 ? '#3B82F6' : '#E5E7EB' }}>
                  <SkeletonLoader width={120 + Math.random() * 80} height={16} borderRadius={8} mutedColor={mutedColor} />
                  <View className="mt-2">
                    <SkeletonLoader width={60} height={12} borderRadius={6} mutedColor={mutedColor} />
                  </View>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (messages.length === 0) {
    return (
      <View className="flex-1 justify-center items-center px-4">
        <Text className="text-lg font-medium" style={{ color: mutedColor }}>No messages yet</Text>
        <Text className="text-sm text-center mt-2" style={{ color: mutedColor }}>Start the conversation by sending a message</Text>
      </View>
    );
  }

  return (
    <>
      <FlatList
        ref={flatListRef}
        data={messages.filter(m => m && m.id && m.timestamp)}
        renderItem={({ item, index }) => {
          const isMyMessage = String(item.senderId) === String(user?.id);
          const showDateSeparator = index === messages.length - 1 || 
            new Date(item.timestamp).toDateString() !== new Date(messages[index + 1]?.timestamp).toDateString();
          
          return (
            <View>
              {showDateSeparator && renderDateSeparator(new Date(item.timestamp).toISOString())}
              {item.isEdited && (
                <View className={`mb-1 ${isMyMessage ? 'items-end mr-2' : 'items-start ml-10'}`}>
                  <Text className="text-xs" style={{ color: mutedColor }}>edited</Text>
                </View>
              )}
              <ChatMessageItem
                item={item}
                isMyMessage={isMyMessage}
                avatar={avatar}
                name={name}
                cardColor={cardColor}
                textColor={textColor}
                mutedColor={mutedColor}
                highlightedMessageId={highlightedMessageId}
                selectedMessage={selectedMessage}
                editLoading={editLoading}
                unsendingMessage={unsendingMessage}
                userOnlineStatus={userOnlineStatus}
                onSelectMessage={onSelectMessage}
                onEditMessage={onEditMessage}
                onUnsendMessage={onUnsendMessage}
                onImagePress={onImagePress}
                getInitials={getInitials}
                canEditMessage={canEditMessage}
                isLastMessage={index === 0}
              />
            </View>
          );
        }}
        keyExtractor={(item, index) => item?.id ? `${item.id}-${index}` : `fallback-${index}`}
        className="flex-1 px-4"
        contentContainerStyle={{ 
          paddingTop: 8, 
          paddingBottom: 20,
          flexGrow: 1,
          justifyContent: messages.length < 10 ? 'flex-end' : 'flex-start'
        }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.1}
        inverted={true}
        scrollEventThrottle={16}
        ListFooterComponent={loadingMore ? (
          <View className="py-4 items-center">
            <ActivityIndicator size="small" color="#af1616" />
            <Text className="mt-2 text-xs" style={{ color: mutedColor }}>Loading older messages...</Text>
          </View>
        ) : null}
      />
      
      {showScrollDown && messages.length > 0 && (
        <View className="absolute bottom-20 items-center" style={{ left: 0, right: 0 }}>
          <TouchableOpacity
            onPress={onScrollToBottom}
            className="w-10 h-10 mb-5 rounded-full bg-[#af1616] items-center justify-center shadow-lg"
            style={{ elevation: 5 }}
          >
            <ArrowDown size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};
