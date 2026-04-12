import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/constants/Config';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker';
import { getDocumentAsync } from 'expo-document-picker';
import { Message } from '@/@types/screens/messages'
import { messageService } from '@/services/messageService';
import { messageStorage } from '@/lib/messageStorage';
import axios from 'axios';

// Import modular components
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatMessageList } from '@/components/chat/ChatMessageList';
import { ChatInputArea } from '@/components/chat/ChatInputArea';
import { ChatAttachments } from '@/components/chat/ChatAttachments';
import { ChatModals } from '@/components/chat/ChatModals';

export default function ChatScreen() {
  const router = useRouter();
  const { id, name, avatar, user_type, isOnline, highlightMessage } = useLocalSearchParams();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  
  // Theme Color
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardColor = useThemeColor({}, 'card');
  const mutedColor = useThemeColor({}, 'muted');
  
  // Navigation detection
  const hasThreeButtonNav = React.useMemo(() => Platform.OS === 'ios' ? insets.bottom > 20 : insets.bottom > 0, [insets.bottom]);
  const isGestureNav = React.useMemo(() => Platform.OS === 'android' && insets.bottom === 0, [insets.bottom]);
  
  // Actual user ID logic
  const safeId = String(id || '').substring(0, 50);
  const actualUserId = safeId.includes('_') ? safeId.split('_')[1] : safeId;
  
  // State
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
  const [userOnlineStatus, setUserOnlineStatus] = useState(isOnline === 'true');
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [imageCarousel, setImageCarousel] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [navigatingToInfo, setNavigatingToInfo] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  const isMountedRef = useRef(true);

  // Initial Load and Setup
  useEffect(() => {
    isMountedRef.current = true;
    setLoading(true);
    
    // Load from cache first
    const loadFromCache = async () => {
      if (user?.id && actualUserId) {
        try {
          const cached = await messageStorage.getMessages(user.id, actualUserId);
          if (cached && cached.length > 0 && isMountedRef.current) {
            setMessages(cached);
            setLoading(false); // Hide loading if we have cache
          }
        } catch (e) {
          console.error('Error loading chat from cache:', e);
        }
      }
    };
    
    loadFromCache().then(() => {
      loadMessages(1, false);
      markAsRead();
    });
    
    const kbShow = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const kbHide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    
    if (highlightMessage) {
      setHighlightedMessageId(highlightMessage as string);
      setTimeout(() => isMountedRef.current && setHighlightedMessageId(null), 3000);
    }
    
    return () => {
      isMountedRef.current = false;
      kbShow.remove();
      kbHide.remove();
    };
  }, [actualUserId, highlightMessage]);

  // Polling Effect
  useEffect(() => {
    let interval: any;
    const startPolling = () => {
      interval = setInterval(async () => {
        if (isMountedRef.current && !editingMessage && !selectedMessage) {
          try {
            await Promise.all([silentLoadMessages(), checkUserOnlineStatus(), updateUserSession()]);
          } catch (e) {}
        }
      }, 8000);
    };
    const timer = setTimeout(startPolling, 1000);
    return () => { clearTimeout(timer); clearInterval(interval); };
  }, [editingMessage, selectedMessage]);

  // Logic Functions
  const updateUserSession = async () => {
    if (user?.id) await axios.post(`${API_BASE_URL}/api/login.php`, { update_session: true, user_id: user.id });
  };

  const checkUserOnlineStatus = async () => {
    try {
      if (user?.id) await messageService.updateMessageStatuses(user.id);
      const { users } = await messageService.getActiveUsers(user?.id || '', 1, 100);
      const targetUser = users.find(u => (u.unique_key || u.id) === id);
      if (targetUser) setUserOnlineStatus(targetUser.isOnline);
    } catch (e) {}
  };

  const loadMessages = async (pageNum = 1, append = false) => {
    try {
      if (!user?.id || !actualUserId) return;
      if (!append) setLoading(true); else setLoadingMore(true);
      const response = await axios.get(`${API_BASE_URL}/api/messages/get_messages.php?sender_id=${encodeURIComponent(user.id)}&receiver_id=${encodeURIComponent(actualUserId)}&page=${pageNum}&limit=20`);
      if (response.data.success) {
        const newMessages = (response.data.messages || []).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setMessages(prev => {
          const combined = append ? [...prev, ...newMessages.filter((m: any) => !prev.find(p => p.id === m.id))] : newMessages;
          
          // Only cache the first page to keep it clean and fast
          if (pageNum === 1 && user?.id && actualUserId) {
            messageStorage.saveMessages(user.id, actualUserId, combined.slice(0, 50));
          }
          
          return combined;
        });
        setHasMore(response.data.hasMore || false);
        setPage(pageNum);
      }
    } catch (e) { if (!append) setMessages([]); } finally { setLoading(false); setLoadingMore(false); }
  };

  const silentLoadMessages = async () => {
    if (!user?.id || !actualUserId || !isMountedRef.current) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/api/messages/get_messages.php?sender_id=${encodeURIComponent(user.id)}&receiver_id=${encodeURIComponent(actualUserId)}&page=1&limit=20`);
      if (response.data.success && isMountedRef.current) {
        const incoming = response.data.messages || [];
        setMessages(prev => {
          const temp = prev.filter(m => m.id.startsWith('temp_'));
          const existing = prev.filter(m => !m.id.startsWith('temp_'));
          const ids = new Set(existing.map(m => m.id));
          const updated = existing.map(m => incoming.find((i: any) => i.id === m.id) || m);
          const brandNew = incoming.filter((i: any) => !ids.has(i.id));
          const combined = [...temp, ...brandNew, ...updated].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          
          // Cache the latest messages
          if (user?.id && actualUserId) {
            messageStorage.saveMessages(user.id, actualUserId, combined.slice(0, 50));
          }
          
          return combined;
        });
      }
    } catch (e) {}
  };

  const markAsRead = async () => {
    if (user?.id && actualUserId) await messageService.markAsRead(user.id, actualUserId);
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !user?.id) return;
    const text = inputText; const tempId = `temp_${Date.now()}`;
    setInputText(''); setMessages(prev => [{ id: tempId, text, senderId: user.id, receiverId: actualUserId, timestamp: new Date(), type: 'text', isSeen: false, isCurrentUser: true, isEdited: false }, ...prev]);
    setTimeout(() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true }), 100);
    try {
      const res = await messageService.sendMessage({ text, senderId: user.id, receiverId: actualUserId, type: 'text', isSeen: false, recipientOnline: userOnlineStatus });
      setMessages(prev => prev.map(m => m.id === tempId ? res : m));
    } catch (e) { Alert.alert('Error', 'Failed to send message'); setInputText(text); }
  };

  const pickImage = async () => {
    if (!user?.id) return;
    try {
      const result = await launchImageLibraryAsync({ mediaTypes: MediaTypeOptions.Images, allowsEditing: true, quality: 0.8 });
      if (!result.canceled) {
        const tempId = `temp_${Date.now()}`; setShowAttachments(false);
        setMessages(prev => [{ id: tempId, text: '', senderId: user.id, receiverId: actualUserId, timestamp: new Date(), type: 'image', fileUrl: result.assets[0].uri, fileName: 'image.jpg', isSeen: false, isCurrentUser: true, isEdited: false }, ...prev]);
        const response = await fetch(result.assets[0].uri); const blob = await response.blob();
        const reader = new FileReader(); reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          try {
            const res = await messageService.sendMessage({ text: '', senderId: user.id, receiverId: actualUserId, type: 'image', fileUrl: result.assets[0].uri, fileData: reader.result as string, fileName: 'image.jpg', isSeen: false, recipientOnline: userOnlineStatus });
            setMessages(prev => prev.map(m => m.id === tempId ? res : m));
          } catch (e) { setMessages(prev => prev.filter(m => m.id !== tempId)); Alert.alert('Error', 'Failed to send image'); }
        };
      }
    } catch (e) {}
  };

  const pickDocument = async () => {
    if (!user?.id) return;
    try {
      const result = await getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
      if (!result.canceled) {
        const tempId = `temp_${Date.now()}`; setShowAttachments(false);
        setMessages(prev => [{ id: tempId, text: result.assets[0].name, senderId: user.id, receiverId: actualUserId, timestamp: new Date(), type: 'file', fileName: result.assets[0].name, fileUrl: result.assets[0].uri, isSeen: false, isCurrentUser: true, isEdited: false }, ...prev]);
        const response = await fetch(result.assets[0].uri); const blob = await response.blob();
        const reader = new FileReader(); reader.readAsDataURL(blob);
        reader.onloadend = async () => {
          try {
            const res = await messageService.sendMessage({ text: result.assets[0].name, senderId: user.id, receiverId: actualUserId, type: 'file', fileName: result.assets[0].name, fileUrl: result.assets[0].uri, fileData: reader.result as string, isSeen: false, recipientOnline: userOnlineStatus });
            setMessages(prev => prev.map(m => m.id === tempId ? res : m));
          } catch (e) { setMessages(prev => prev.filter(m => m.id !== tempId)); Alert.alert('Error', 'Failed to send document'); }
        };
      }
    } catch (e) {}
  };

  const editMessage = async () => {
    if (!editingMessage || !editText.trim()) return;
    setEditLoading(true); setShowEditModal(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/messages/edit_message.php`, { message_id: editingMessage, new_text: editText.trim(), user_id: user?.id });
      if (res.data.success) {
        setMessages(prev => prev.map(m => m.id === editingMessage ? { ...m, text: editText.trim(), isEdited: true } : m));
        await silentLoadMessages();
      } else Alert.alert('Error', res.data.message || 'Failed to edit');
    } catch (e) { Alert.alert('Error', 'Failed to edit'); } finally { setEditLoading(false); setShowEditModal(false); setEditingMessage(null); setEditText(''); }
  };

  const unsendMessage = async (messageId: string) => {
    setUnsendingMessage(messageId); setShowUnsendModal(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/messages/unsend_message.php`, { message_id: messageId, user_id: user?.id });
      if (res.data.success) {
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, text: 'Message removed', type: 'text', fileUrl: undefined, fileName: undefined } : m));
        await silentLoadMessages();
      } else Alert.alert('Error', res.data.message || 'Failed to unsend');
    } catch (e) { Alert.alert('Error', 'Failed to unsend'); } finally { setUnsendingMessage(null); setShowUnsendModal(false); }
  };

  const getInitials = (n: string) => n ? n.split(' ').map(w => w.charAt(0)).join('').toUpperCase().slice(0, 2) : 'U';
  const canEditMessage = (ts: string) => (new Date().getTime() - new Date(ts).getTime()) / (1000 * 60) <= 3;
  const formatDate = (date: Date) => {
    const today = new Date(); const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const dStr = date.toDateString(); const tStr = today.toDateString(); const yStr = yesterday.toDateString();
    if (dStr === tStr) return 'Today'; if (dStr === yStr) return 'Yesterday';
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  return (
    <View style={{ flex: 1, backgroundColor }}>
      <ChatHeader
        name={name as string}
        avatar={avatar as string}
        userOnlineStatus={userOnlineStatus}
        textColor={textColor}
        cardColor={cardColor}
        mutedColor={mutedColor}
        onBack={() => router.back()}
        onInfo={() => { setNavigatingToInfo(true); router.push(`/chat-info/${safeId}?name=${name}&avatar=${avatar || ''}&user_type=${user_type}&isOnline=${userOnlineStatus}`); setNavigatingToInfo(false); }}
        getInitials={getInitials}
      />

      <ChatMessageList
        flatListRef={flatListRef}
        messages={messages}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        onLoadMore={() => hasMore && !loadingMore && loadMessages(page + 1, true)}
        renderDateSeparator={(date) => (
          <View className="items-center my-4">
            <View className="px-3 py-1 rounded-full" style={{ backgroundColor: mutedColor + '20' }}>
              <Text className="text-xs font-medium" style={{ color: mutedColor }}>{formatDate(new Date(date))}</Text>
            </View>
          </View>
        )}
        user={user}
        avatar={avatar as string}
        name={name as string}
        cardColor={cardColor}
        textColor={textColor}
        mutedColor={mutedColor}
        highlightedMessageId={highlightedMessageId}
        selectedMessage={selectedMessage}
        editLoading={editLoading}
        unsendingMessage={unsendingMessage}
        userOnlineStatus={userOnlineStatus}
        showScrollDown={showScrollDown}
        onScrollToBottom={() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true })}
        onScroll={(e) => setShowScrollDown(e.nativeEvent.contentOffset.y > 50)}
        onSelectMessage={setSelectedMessage}
        onEditMessage={(item) => { setEditingMessage(item.id); setEditText(item.text); }}
        onUnsendMessage={unsendMessage}
        onImagePress={(url) => { 
          const urls = messages.filter(m => m.type === 'image' && m.fileUrl).map(m => m.fileUrl!);
          setImageCarousel(urls); setCurrentImageIndex(urls.indexOf(url)); setImageModalVisible(true); 
        }}
        getInitials={getInitials}
        canEditMessage={canEditMessage}
      />

      {showAttachments && (
        <ChatAttachments
          onPickImage={pickImage}
          onPickDocument={pickDocument}
          cardColor={cardColor}
          textColor={textColor}
          mutedColor={mutedColor}
        />
      )}

      <ChatInputArea
        inputText={inputText}
        setInputText={setInputText}
        editText={editText}
        setEditText={setEditText}
        editingMessage={editingMessage}
        showAttachments={showAttachments}
        setShowAttachments={setShowAttachments}
        onSendMessage={sendMessage}
        onEditMessage={editMessage}
        onCancelEdit={() => { setEditingMessage(null); setEditText(''); }}
        backgroundColor={backgroundColor}
        cardColor={cardColor}
        mutedColor={mutedColor}
        textColor={textColor}
        hasThreeButtonNav={hasThreeButtonNav}
        insetsBottom={insets.bottom}
        isGestureNav={isGestureNav}
        keyboardVisible={keyboardVisible}
      />

      <ChatModals
        showEditModal={showEditModal}
        showUnsendModal={showUnsendModal}
        navigatingToInfo={navigatingToInfo}
        imageModalVisible={imageModalVisible}
        selectedImageUrl={selectedImageUrl}
        imageCarousel={imageCarousel}
        currentImageIndex={currentImageIndex}
        textColor={textColor}
        cardColor={cardColor}
        onCloseImageModal={() => setImageModalVisible(false)}
        onPrevImage={() => setCurrentImageIndex(prev => prev - 1)}
        onNextImage={() => setCurrentImageIndex(prev => prev + 1)}
      />
    </View>
  );
}