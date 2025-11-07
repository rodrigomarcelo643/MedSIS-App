import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput, 
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

const SkeletonLoader = ({ width, height, borderRadius = 4 }) => {
  const mutedColor = useThemeColor({}, 'muted');
  
  return (
    <View
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: mutedColor + '30',
      }}
    />
  );
};
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowLeft,
  Send,
  Paperclip,
  Camera,
  Image as ImageIcon,
  File,
  Info,
  ArrowDown,
  MoreVertical,
  Edit3,
  Trash2,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { messageService, Message } from '@/services/messageService';

export default function ChatScreen() {
  const router = useRouter();
  const { id, name, avatar, user_type } = useLocalSearchParams();
  const { user } = useAuth();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardColor = useThemeColor({}, 'card');
  const mutedColor = useThemeColor({}, 'muted');
  
  // Extract actual user ID from unique_key format (user_type_id)
  const actualUserId = (id as string).includes('_') ? (id as string).split('_')[1] : id as string;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [showAttachments, setShowAttachments] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [unsendingMessage, setUnsendingMessage] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUnsendModal, setShowUnsendModal] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    setLoading(true);
    loadMessages(1, false);
    markAsRead();
  }, [actualUserId]);
  
  useEffect(() => {
    const messageInterval = setInterval(() => {
      if (!editingMessage && !selectedMessage) {
        silentLoadMessages();
      }
    }, 5000);
    
    return () => clearInterval(messageInterval);
  }, []);

  const loadMessages = async (pageNum = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);
      
      const response = await fetch(`https://msis.eduisync.io/api/messages/get_messages.php?sender_id=${user?.id}&receiver_id=${actualUserId}&page=${pageNum}&limit=20`);
      const data = await response.json();
      
      if (data.success) {
        const newMessages = (data.messages || []).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        
        if (append) {
          setMessages(prev => {
            const combined = [...newMessages, ...prev];
            return combined.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          });
        } else {
          setMessages(newMessages);
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: false });
          }, 100);
        }
        setHasMore(data.hasMore || false);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      if (!append) setMessages([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const silentLoadMessages = async () => {
    try {
      const response = await fetch(`https://msis.eduisync.io/api/messages/get_messages.php?sender_id=${user?.id}&receiver_id=${actualUserId}&page=1&limit=20`);
      const data = await response.json();
      
      if (data.success) {
        const newMessages = (data.messages || []).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        
        setMessages(prev => {
          const prevIds = new Set(prev.map(m => m.id));
          const hasNewMessages = newMessages.some(m => !prevIds.has(m.id));
          
          if (hasNewMessages) {
            return newMessages;
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Silent load error:', error);
    }
  };

  const markAsRead = async () => {
    try {
      await messageService.markAsRead(user?.id || '', actualUserId);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || sending) return;

    const messageText = inputText;
    setInputText('');
    setSending(true);

    console.log('Sending message:', {
      senderId: user?.id,
      receiverId: actualUserId,
      text: messageText
    });

    try {
      const newMessage = await messageService.sendMessage({
        text: messageText,
        senderId: user?.id || '',
        receiverId: actualUserId,
        type: 'text',
      });

      console.log('Message sent successfully:', newMessage);
      setMessages(prev => [...prev, newMessage]);
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
      setInputText(messageText); // Restore text on error
    } finally {
      setSending(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setSending(true);
        const newMessage = await messageService.sendMessage({
          text: 'Image',
          senderId: user?.id || '',
          receiverId: actualUserId,
          type: 'image',
          fileUrl: result.assets[0].uri,
        });

        setMessages(prev => [...prev, newMessage]);
        setShowAttachments(false);
        setSending(false);
      }
    } catch (error) {
      console.error('Error sending image:', error);
      Alert.alert('Error', 'Failed to send image');
      setSending(false);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setSending(true);
        const newMessage = await messageService.sendMessage({
          text: 'Document',
          senderId: user?.id || '',
          receiverId: actualUserId,
          type: 'file',
          fileName: result.assets[0].name,
          fileUrl: result.assets[0].uri,
        });

        setMessages(prev => [...prev, newMessage]);
        setShowAttachments(false);
        setSending(false);
      }
    } catch (error) {
      console.error('Error sending document:', error);
      Alert.alert('Error', 'Failed to send document');
      setSending(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const loadMoreMessages = () => {
    if (hasMore && !loadingMore) {
      loadMessages(page + 1, true);
    }
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-PH', {
        timeZone: 'Asia/Manila',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const canEditMessage = (timestamp: string) => {
    const messageTime = new Date(timestamp);
    const now = new Date();
    const diffMinutes = (now.getTime() - messageTime.getTime()) / (1000 * 60);
    return diffMinutes <= 3;
  };

  const editMessage = async () => {
    if (!editingMessage || !editText.trim()) return;
    
    setEditLoading(true);
    setShowEditModal(true);
    try {
      const response = await fetch('https://msis.eduisync.io/api/messages/edit_message.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_id: editingMessage,
          new_text: editText.trim(),
          user_id: user?.id
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      if (!text) {
        throw new Error('Empty response from server');
      }
      
      const data = JSON.parse(text);
      if (data.success) {
        setMessages(prev => prev.map(msg => 
          msg.id === editingMessage ? { ...msg, text: editText.trim(), isEdited: true } : msg
        ));
      } else {
        Alert.alert('Error', data.message || 'Failed to edit message');
      }
    } catch (error) {
      console.error('Error editing message:', error);
      Alert.alert('Error', 'Failed to edit message');
    } finally {
      setEditLoading(false);
      setShowEditModal(false);
      setEditingMessage(null);
      setEditText('');
    }
  };

  const unsendMessage = async (messageId: string) => {
    setUnsendingMessage(messageId);
    setShowUnsendModal(true);
    try {
      const response = await fetch('https://msis.eduisync.io/api/messages/unsend_message.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_id: messageId,
          user_id: user?.id
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      if (!text) {
        throw new Error('Empty response from server');
      }
      
      const data = JSON.parse(text);
      if (data.success) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, text: 'Message removed' } : msg
        ));
      } else {
        Alert.alert('Error', data.message || 'Failed to unsend message');
      }
    } catch (error) {
      console.error('Error unsending message:', error);
      Alert.alert('Error', 'Failed to unsend message');
    } finally {
      setUnsendingMessage(null);
      setShowUnsendModal(false);
    }
  };

  const renderDateSeparator = (date: string) => (
    <View className="items-center my-4">
      <View className="px-3 py-1 rounded-full" style={{ backgroundColor: mutedColor + '20' }}>
        <Text className="text-xs font-medium" style={{ color: mutedColor }}>
          {formatDate(new Date(date))}
        </Text>
      </View>
    </View>
  );

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMyMessage = String(item.senderId) === String(user?.id);
    const showDateSeparator = index === 0 || 
      new Date(item.timestamp).toDateString() !== new Date(messages[index - 1]?.timestamp).toDateString();
    
    return (
      <View>
        {showDateSeparator && renderDateSeparator(item.timestamp)}
        {item.isEdited && (
          <View className={`mb-1 ${isMyMessage ? 'items-end mr-2' : 'items-start ml-10'}`}>
            <Text className="text-xs" style={{ color: mutedColor }}>edited</Text>
          </View>
        )}
        <View className="mb-4">
          <View className={`flex-row ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
            {isMyMessage && item.text !== 'Message removed' && (
              <View className="relative">
                <TouchableOpacity
                  onPress={() => setSelectedMessage(selectedMessage === item.id ? null : item.id)}
                  className="mr-2 mt-2 p-1"
                >
                  <MoreVertical size={16} color={mutedColor} />
                </TouchableOpacity>
                
                {selectedMessage === item.id && (
                  <View className="absolute top-8 right-0 bg-white rounded-lg shadow-lg border border-gray-200 py-1" style={{ minWidth: 100, zIndex: 1000 }}>
                    {canEditMessage(item.timestamp) && (
                      <TouchableOpacity
                        onPress={() => {
                          setEditingMessage(item.id);
                          setEditText(item.text);
                          setSelectedMessage(null);
                        }}
                        className="flex-row items-center px-3 py-2"
                        disabled={editLoading}
                      >
                        {editLoading ? (
                          <ActivityIndicator size={14} color={textColor} />
                        ) : (
                          <Edit3 size={14} color={textColor} />
                        )}
                        <Text className="ml-2 text-sm" style={{ color: textColor }}>Edit</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={() => {
                        unsendMessage(item.id);
                        setSelectedMessage(null);
                      }}
                      className="flex-row items-center px-3 py-2"
                      disabled={unsendingMessage === item.id}
                    >
                      {unsendingMessage === item.id ? (
                        <ActivityIndicator size={14} color="#ef4444" />
                      ) : (
                        <Trash2 size={14} color="#ef4444" />
                      )}
                      <Text className="ml-2 text-sm" style={{ color: '#ef4444' }}>Unsend</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
            
            <View className={`flex-row max-w-[80%] ${isMyMessage ? 'flex-row-reverse' : ''}`}>
              {!isMyMessage && (
                <View className="relative mr-2">
                  {avatar ? (
                    <Image
                      source={{ uri: avatar as string }}
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: '#af1616' }}
                    />
                  ) : (
                    <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: '#af1616' }}>
                      <Text className="text-white font-bold text-xs">
                        {getInitials(name as string)}
                      </Text>
                    </View>
                  )}
                </View>
              )}
              
              <View className={`rounded-2xl px-4 py-3 ${isMyMessage ? 'bg-blue-500 rounded-br-sm' : 'bg-gray-200 rounded-bl-sm'}`}>
                {item.type === 'image' && item.fileUrl && (
                  <Image
                    source={{ uri: item.fileUrl }}
                    className="w-48 h-36 rounded-lg mb-2"
                    resizeMode="cover"
                  />
                )}
              
                {item.type === 'file' && (
                  <View className="flex-row items-center mb-2">
                    <File size={20} color={isMyMessage ? '#fff' : '#666'} />
                    <Text
                      className={`ml-2 font-medium ${
                        isMyMessage ? 'text-white' : 'text-gray-800'
                      }`}
                    >
                      {item.fileName}
                    </Text>
                  </View>
                )}
                
                {item.type === 'text' && (
                  <Text
                    className={`text-base ${
                      isMyMessage ? 'text-white' : 'text-gray-800'
                    }`}
                  >
                    {item.text}
                  </Text>
                )}
                
                <View className="mt-1">
                  <Text className={`text-xs ${isMyMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                    {new Date(item.timestamp).toLocaleTimeString('en-PH', {
                      timeZone: 'Asia/Manila',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
              </View>
            </View>

          </View>
        
          {isMyMessage && (
            <View className={`flex-row items-center mt-1 justify-end mr-2`}>
              {item.isSeen ? (
                <>
                  <Text className="text-xs mr-1" style={{ color: mutedColor }}>Seen</Text>
                  {avatar ? (
                    <Image
                      source={{ uri: avatar as string }}
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: '#af1616' }}
                    />
                  ) : (
                    <View className="w-4 h-4 rounded-full" style={{ backgroundColor: '#af1616' }}>
                      <Text className="text-white text-xs font-bold text-center" style={{ fontSize: 8, lineHeight: 16 }}>
                        {getInitials(name as string).charAt(0)}
                      </Text>
                    </View>
                  )}
                </>
              ) : (
                <Text className="text-xs" style={{ color: mutedColor }}>Delivered</Text>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <TouchableOpacity 
      style={{ flex: 1, backgroundColor }} 
      activeOpacity={1}
      onPress={() => setSelectedMessage(null)}
    >
      
      {/* Header */}
      <View
        className="flex-row items-center px-4 py-4 pt-[50px] border-b"
        style={{ backgroundColor: cardColor, borderBottomColor: mutedColor + '30' }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ArrowLeft size={24} color={textColor} />
        </TouchableOpacity>
        
        <View className="relative mr-3">
          {avatar ? (
            <Image
              source={{ uri: avatar as string }}
              className="w-10 h-10 rounded-full"
              style={{ backgroundColor: '#af1616' }}
            />
          ) : (
            <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: '#af1616' }}>
              <Text className="text-white font-bold text-sm">
                {getInitials(name as string)}
              </Text>
            </View>
          )}
          <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
        </View>
        
        <View className="flex-1">
          <Text className="font-semibold text-lg" style={{ color: textColor }}>
            {name}
          </Text>
          <Text className="text-sm" style={{ color: mutedColor }}>
            Online
          </Text>
        </View>
        
        <TouchableOpacity onPress={() => router.push(`/chat-info/${id}?name=${encodeURIComponent(name as string)}${avatar ? `&avatar=${encodeURIComponent(avatar as string)}` : ''}&user_type=${user_type}`)}>
          <Info size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Messages */}
        {messages.length > 0 ? (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            className="flex-1 px-4"
            contentContainerStyle={{ paddingTop: 8, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            onScroll={(event) => {
              const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
              const isAtBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 100;
              setShowScrollDown(!isAtBottom);
              
              if (contentOffset.y <= 50 && hasMore && !loadingMore) {
                loadMoreMessages();
              }
            }}
            scrollEventThrottle={16}
            ListHeaderComponent={loadingMore ? (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#3B82F6" />
              </View>
            ) : null}
          />
        ) : loading ? (
          <View className="flex-1 px-4 pt-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
              <View key={item} className="mb-4">
                <View className={`flex-row ${item % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                  <View className={`flex-row max-w-[80%] ${item % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                    {item % 2 !== 0 && (
                      <View className="mr-2">
                        <SkeletonLoader width={32} height={32} borderRadius={16} />
                      </View>
                    )}
                    <View className="rounded-2xl px-4 py-3" style={{ backgroundColor: item % 2 === 0 ? '#3B82F6' : '#E5E7EB' }}>
                      <SkeletonLoader width={120 + Math.random() * 80} height={16} borderRadius={8} />
                      <View className="mt-2">
                        <SkeletonLoader width={60} height={12} borderRadius={6} />
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="flex-1 justify-center items-center px-4">
            <Text className="text-lg font-medium" style={{ color: mutedColor }}>No messages yet</Text>
            <Text className="text-sm text-center mt-2" style={{ color: mutedColor }}>Start the conversation by sending a message</Text>
          </View>
        )}

        {/* Scroll Down Button */}
        {showScrollDown && messages.length > 0 && (
          <View className="absolute bottom-20 items-center" style={{ left: 0, right: 0 }}>
            <TouchableOpacity
              onPress={() => {
                flatListRef.current?.scrollToEnd({ animated: true });
                setShowScrollDown(false);
              }}
              className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center shadow-lg"
              style={{ elevation: 5 }}
            >
              <ArrowDown size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {/* Attachment Options */}
        {showAttachments && (
          <View className="flex-row justify-around py-4 border-t" style={{ backgroundColor, borderTopColor: mutedColor + '30' }}>
            <TouchableOpacity
              onPress={pickImage}
              className="items-center"
            >
              <View className="w-12 h-12 rounded-full bg-green-500 items-center justify-center mb-1">
                <ImageIcon size={24} color="#fff" />
              </View>
              <Text className="text-xs" style={{ color: textColor }}>Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={pickDocument}
              className="items-center"
            >
              <View className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center mb-1">
                <File size={24} color="#fff" />
              </View>
              <Text className="text-xs" style={{ color: textColor }}>Document</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Input Area */}
        <View
          className="flex-row items-end px-4 py-3 border-t"
          style={{ backgroundColor, borderTopColor: mutedColor + '30' }}
        >
          <TouchableOpacity
            onPress={() => setShowAttachments(!showAttachments)}
            className="mr-2 p-2"
          >
            <Paperclip size={24} color={textColor} />
          </TouchableOpacity>
          
          {editingMessage ? (
            <View className="flex-1 flex-row items-center rounded-full px-4 py-0 border" style={{ backgroundColor: cardColor, borderColor: mutedColor + '30' }}>
              <TextInput
                style={{ color: textColor, fontSize: 16, flex: 1, maxHeight: 100 }}
                placeholder="Edit message..."
                placeholderTextColor={mutedColor}
                value={editText}
                onChangeText={setEditText}
                multiline
              />
              <TouchableOpacity onPress={editMessage} className="ml-2">
                <Text style={{ color: '#3B82F6' }}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setEditingMessage(null); setEditText(''); }} className="ml-2">
                <Text style={{ color: mutedColor }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="flex-1 rounded-full px-4 py-0 border" style={{ backgroundColor: cardColor, borderColor: mutedColor + '30' }}>
              <TextInput
                style={{ color: textColor, fontSize: 16, maxHeight: 100 }}
                placeholder="Type a message..."
                placeholderTextColor={mutedColor}
                value={inputText}
                onChangeText={setInputText}
                multiline
              />
            </View>
          )}
          
          {!editingMessage && (
            <TouchableOpacity
              onPress={sendMessage}
              disabled={!inputText.trim() || sending}
              className={`ml-2 p-2 rounded-full ${!inputText.trim() || sending ? 'bg-gray-300' : 'bg-blue-500'}`}
            >
              {sending ? (
                <ActivityIndicator size={20} color="#fff" />
              ) : (
                <Send size={20} color="#fff" />
              )}
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
      
      {/* Edit Loading Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="fade"
      >
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="bg-white rounded-lg p-6 items-center" style={{ minWidth: 200 }}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="mt-4 text-base font-medium" style={{ color: textColor }}>Saving changes...</Text>
          </View>
        </View>
      </Modal>
      
      {/* Unsend Loading Modal */}
      <Modal
        visible={showUnsendModal}
        transparent={true}
        animationType="fade"
      >
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="bg-white rounded-lg p-6 items-center" style={{ minWidth: 200 }}>
            <ActivityIndicator size="large" color="#ef4444" />
            <Text className="mt-4 text-base font-medium" style={{ color: textColor }}>Unsending message...</Text>
          </View>
        </View>
      </Modal>
    </TouchableOpacity>
  );
}