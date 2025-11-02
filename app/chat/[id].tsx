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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowLeft,
  Send,
  Paperclip,
  Camera,
  Image as ImageIcon,
  File,
  Info,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { messageService, Message } from '@/services/messageService';

export default function ChatScreen() {
  const router = useRouter();
  const { id, name, avatar } = useLocalSearchParams();
  const { user } = useAuth();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardColor = useThemeColor({}, 'card');
  const mutedColor = useThemeColor({}, 'muted');
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [showAttachments, setShowAttachments] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadMessages();
    markAsRead();
  }, [id]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const chatMessages = await messageService.getChatMessages(id as string);
      setMessages(chatMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    try {
      await messageService.markAsRead(id as string);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || sending) return;

    const messageText = inputText;
    setInputText('');
    setSending(true);

    try {
      const newMessage = await messageService.sendMessage({
        text: messageText,
        senderId: user?.id || 'current',
        receiverId: id as string,
        type: 'text',
      });

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
          senderId: user?.id || 'current',
          receiverId: id as string,
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
          senderId: user?.id || 'current',
          receiverId: id as string,
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

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.senderId === (user?.id || 'current');
    
    return (
      <View
        className={`flex-row mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
      >
        <View
          className={`flex-row max-w-[80%] ${isCurrentUser ? 'flex-row-reverse' : ''}`}
        >
          {!isCurrentUser && (
            <View className="relative mr-2">
              <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: '#af1616' }}>
                <Text className="text-white font-bold text-xs">
                  {getInitials(name as string)}
                </Text>
              </View>
              {avatar && (
                <Image
                  source={{ uri: avatar as string }}
                  className="absolute inset-0 w-8 h-8 rounded-full"
                />
              )}
            </View>
          )}
          
          <View
            className={`rounded-2xl px-4 py-3 ${
              isCurrentUser
                ? 'bg-blue-500 rounded-br-sm'
                : 'bg-gray-200 rounded-bl-sm'
            }`}
          >
            {item.type === 'image' && item.fileUrl && (
              <Image
                source={{ uri: item.fileUrl }}
                className="w-48 h-36 rounded-lg mb-2"
                resizeMode="cover"
              />
            )}
            
            {item.type === 'file' && (
              <View className="flex-row items-center mb-2">
                <File size={20} color={isCurrentUser ? '#fff' : '#666'} />
                <Text
                  className={`ml-2 font-medium ${
                    isCurrentUser ? 'text-white' : 'text-gray-800'
                  }`}
                >
                  {item.fileName}
                </Text>
              </View>
            )}
            
            {item.type === 'text' && (
              <Text
                className={`text-base ${
                  isCurrentUser ? 'text-white' : 'text-gray-800'
                }`}
              >
                {item.text}
              </Text>
            )}
            
            <View className="flex-row items-center justify-between mt-1">
              <Text
                className={`text-xs ${
                  isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                }`}
              >
                {item.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              {isCurrentUser && (
                <View className="flex-row items-center ml-2">
                  <Text className="text-xs text-blue-100 mr-1">Seen</Text>
                  <View className="relative">
                    <View className="w-4 h-4 rounded-full" style={{ backgroundColor: '#af1616' }}>
                      <Text className="text-white text-xs font-bold text-center" style={{ fontSize: 8, lineHeight: 16 }}>
                        {getInitials(name as string).charAt(0)}
                      </Text>
                    </View>
                    {avatar && (
                      <Image
                        source={{ uri: avatar as string }}
                        className="absolute inset-0 w-4 h-4 rounded-full"
                      />
                    )}
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor }}>
      
      {/* Header */}
      <View
        className="flex-row items-center px-4 py-4 pt-[50px] border-b"
        style={{ backgroundColor: cardColor, borderBottomColor: mutedColor + '30' }}
      >
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ArrowLeft size={24} color={textColor} />
        </TouchableOpacity>
        
        <View className="relative mr-3">
          <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: '#af1616' }}>
            <Text className="text-white font-bold text-sm">
              {getInitials(name as string)}
            </Text>
          </View>
          {avatar && (
            <Image
              source={{ uri: avatar as string }}
              className="absolute inset-0 w-10 h-10 rounded-full"
            />
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
        
        <TouchableOpacity onPress={() => router.push(`/chat-info/${id}?name=${encodeURIComponent(name as string)}${avatar ? `&avatar=${encodeURIComponent(avatar as string)}` : ''}`)}>
          <Info size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Messages */}
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="mt-2" style={{ color: mutedColor }}>Loading messages...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            className="flex-1 px-4"
            contentContainerStyle={{ paddingTop: 8, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onScroll={(event) => {
              const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
              const isAtBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 50;
              setShowScrollDown(!isAtBottom);
            }}
            scrollEventThrottle={16}
          />
        )}

        {/* Scroll Down Button */}
        {showScrollDown && (
          <TouchableOpacity
            onPress={() => flatListRef.current?.scrollToEnd({ animated: true })}
            className="absolute bottom-20 right-4 w-12 h-12 rounded-full bg-blue-500 items-center justify-center shadow-lg"
            style={{ elevation: 5 }}
          >
            <Text className="text-white font-bold">↓</Text>
          </TouchableOpacity>
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
          
          <TouchableOpacity
            onPress={sendMessage}
            disabled={!inputText.trim() || sending}
            className={`ml-2 p-2 rounded-full ${
              !inputText.trim() || sending ? 'bg-gray-300' : 'bg-blue-500'
            }`}
          >
            {sending ? (
              <ActivityIndicator size={20} color="#fff" />
            ) : (
              <Send size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}