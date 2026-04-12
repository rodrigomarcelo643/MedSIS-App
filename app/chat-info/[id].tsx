import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Search, X } from 'lucide-react-native';
import { Message } from "@/@types/screens/messages";
import { messageService } from '@/services/messageService';
import { messageStorage } from '@/lib/messageStorage';
import { API_BASE_URL } from '@/constants/Config';
import { MediaItem, LinkItem } from '@/@types/chat';
import axios from 'axios';

// Import modular components
import { InfoSkeleton } from '@/components/chat-info/InfoSkeleton';
import { InfoProfileHeader } from '@/components/chat-info/InfoProfileHeader';
import { InfoTabs } from '@/components/chat-info/InfoTabs';
import { InfoMediaItem } from '@/components/chat-info/InfoMediaItem';
import { InfoModals } from '@/components/chat-info/InfoModals';

export default function ChatInfoScreen() {
  const router = useRouter();
  const { id, name, avatar, user_type, searchQuery: initialSearchQuery, showSearch: initialShowSearch, isOnline: initialOnlineStatus } = useLocalSearchParams();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardColor = useThemeColor({}, 'card');
  const mutedColor = useThemeColor({}, 'muted');
  
  const hasThreeButtonNav = insets.bottom > 0;
  const actualUserId = (id as string).includes('_') ? (id as string).split('_')[1] : id as string;

  const [activeTab, setActiveTab ] = useState<'media' | 'files' | 'links'>('media');
  const [searchQuery, setSearchQuery ] = useState(initialSearchQuery === 'highlight' ? '' : (initialSearchQuery as string || ''));
  const [showSearch, setShowSearch] = useState(initialShowSearch === 'true' || !!initialSearchQuery);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [fileItems, setFileItems] = useState<MediaItem[]>([]);
  const [linkItems, setLinkItems] = useState<LinkItem[]>([]);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [allMediaMessages, setAllMediaMessages] = useState<Message[]>([]);
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [imageCarousel, setImageCarousel] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mediaPage, setMediaPage] = useState(1);
  const [hasMoreMedia, setHasMoreMedia] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [userOnlineStatus, setUserOnlineStatus] = useState<boolean | null>(initialOnlineStatus === 'true' ? true : initialOnlineStatus === 'false' ? false : null);
  const [statusLoading, setStatusLoading] = useState(true);
  
  useEffect(() => {
    loadFromCache();
    loadInitialData();
    checkUserOnlineStatus();
  }, []);

  const loadFromCache = async () => {
    if (user?.id && actualUserId) {
      try {
        const cached = await messageStorage.getChatInfo(user.id, actualUserId);
        if (cached) {
          if (cached.allMessages) setAllMessages(cached.allMessages);
          if (cached.linkItems) setLinkItems(cached.linkItems);
          if (cached.mediaItems) setMediaItems(cached.mediaItems);
          if (cached.fileItems) setFileItems(cached.fileItems);
          if (cached.allMediaMessages) setAllMediaMessages(cached.allMediaMessages);
          setInitialLoading(false);
        }
      } catch (e) {
        console.error('Error loading chat info from cache:', e);
      }
    }
  };

  const checkUserOnlineStatus = async () => {
    setStatusLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      const { users } = await messageService.getActiveUsers(user?.id || '', 1, 100);
      const targetUser = users.find(u => (u.unique_key || u.id) === id);
      setUserOnlineStatus(targetUser ? targetUser.isOnline : false);
    } catch (e) { setUserOnlineStatus(false); } finally { setStatusLoading(false); }
  };

  useEffect(() => {
    if (searchQuery.trim()) searchMessages();
    else { setShowSearchResults(false); setSearchResults([]); }
  }, [searchQuery, allMessages]);

  const loadInitialData = async () => {
    setInitialLoading(true);
    try {
      if (!user?.id || !actualUserId) return;
      const res = await axios.get(`${API_BASE_URL}/api/messages/get_messages.php?sender_id=${user?.id}&receiver_id=${actualUserId}&page=1&limit=1000`);
      if (res.data.success && res.data.messages) {
        setAllMessages(res.data.messages);
        const links: LinkItem[] = [];
        res.data.messages.forEach((msg: Message) => {
          if (msg.type === 'text' && msg.text) {
            const matches = msg.text.match(/(https?:\/\/[^\s]+)/g) || [];
            matches.forEach(url => links.push({ id: `${msg.id}-${url}`, url, text: msg.text, timestamp: new Date(msg.timestamp) }));
          }
        });
        setLinkItems(links);
        const media = res.data.messages.filter((m: Message) => m.type === 'image');
        const files = res.data.messages.filter((m: Message) => m.type === 'file');
        setAllMediaMessages(media);
        setMediaItems(media.slice(0, 15).map((m: any) => ({ id: m.id, type: m.type, url: m.fileUrl || '', name: m.fileName || m.text, fileName: m.fileName, timestamp: new Date(m.timestamp) })));
        setFileItems(files.map((m: any) => ({ id: m.id, type: m.type, url: m.fileUrl || '', name: m.fileName || m.text, fileName: m.fileName, timestamp: new Date(m.timestamp) })));
        setHasMoreMedia(media.length > 15);

        // Save to cache
        if (user?.id && actualUserId) {
          messageStorage.saveChatInfo(user.id, actualUserId, {
            allMessages: res.data.messages,
            linkItems: links,
            mediaItems: media.slice(0, 15).map((m: any) => ({ id: m.id, type: m.type, url: m.fileUrl || '', name: m.fileName || m.text, fileName: m.fileName, timestamp: new Date(m.timestamp) })),
            fileItems: files.map((m: any) => ({ id: m.id, type: m.type, url: m.fileUrl || '', name: m.fileName || m.text, fileName: m.fileName, timestamp: new Date(m.timestamp) })),
            allMediaMessages: media
          });
        }
      }
    } catch (e) {} finally { setInitialLoading(false); }
  };

  const loadMoreMedia = () => {
    if (hasMoreMedia && activeTab === 'media' && !loadingMore) {
      setLoadingMore(true);
      setTimeout(() => {
        const next = mediaPage + 1; setMediaPage(next);
        const more = allMediaMessages.slice((next-1)*15, next*15).map((m: any) => ({ id: m.id, type: m.type, url: m.fileUrl || '', name: m.fileName || m.text, fileName: m.fileName, timestamp: new Date(m.timestamp) }));
        setMediaItems(prev => [...prev, ...more]); setHasMoreMedia(next*15 < allMediaMessages.length); setLoadingMore(false);
      }, 100);
    }
  };

  const searchMessages = async () => {
    setSearchLoading(true); setShowSearchResults(true);
    const filtered = allMessages.filter(m => m.text.toLowerCase().includes(searchQuery.toLowerCase()) || (m.fileName && m.fileName.toLowerCase().includes(searchQuery.toLowerCase())));
    setSearchResults(filtered); setSearchLoading(false);
  };

  const getInitials = (n: string) => n ? n.split(' ').map(w => w.charAt(0)).join('').toUpperCase().slice(0, 2) : 'U';

  if (initialLoading) return <InfoSkeleton backgroundColor={backgroundColor} cardColor={cardColor} mutedColor={mutedColor} />;

  return (
    <View style={{ flex: 1, backgroundColor }}>
      <View className="flex-row items-center px-4 py-4 pt-10 border-b" style={{ backgroundColor: cardColor, borderBottomColor: mutedColor + '30' }}>
        <TouchableOpacity onPress={() => router.back()} className="mr-3"><ArrowLeft size={24} color={textColor} /></TouchableOpacity>
        <Text className="text-xl font-bold" style={{ color: textColor }}>Chat Info</Text>
      </View>

      {showSearch && (
        <View className="px-4 py-3 border-b" style={{ backgroundColor: cardColor, borderBottomColor: mutedColor + '30' }}>
          <View className="flex-row items-center rounded-full px-4 py-0 border" style={{ backgroundColor, borderColor: mutedColor + '40' }}>
            <Search size={20} color={mutedColor} />
            <TextInput className="flex-1 ml-2 text-base" style={{ color: textColor }} placeholder="Search messages..." placeholderTextColor={mutedColor} value={searchQuery} onChangeText={setSearchQuery} />
            {searchQuery.length > 0 && <TouchableOpacity onPress={() => { setSearchQuery(''); setShowSearchResults(false); }}><X size={20} color={mutedColor} /></TouchableOpacity>}
          </View>
        </View>
      )}

      <InfoProfileHeader
        name={name as string}
        avatar={avatar as string}
        user_type={user_type}
        userOnlineStatus={userOnlineStatus}
        statusLoading={statusLoading}
        textColor={textColor}
        cardColor={cardColor}
        mutedColor={mutedColor}
        getInitials={getInitials}
      />

      <InfoTabs activeTab={activeTab} setActiveTab={setActiveTab} cardColor={cardColor} mutedColor={mutedColor} />

      <View style={{ flex: 1 }}>
        {showSearchResults ? (
          <FlatList
            data={searchResults}
            keyExtractor={m => m.id}
            renderItem={({ item }) => {
              const my = String(item.senderId) === String(user?.id);
              return (
                <TouchableOpacity className="flex-row p-4 border-b" style={{ borderBottomColor: mutedColor + '30' }} onPress={() => router.push(`/chat/${id}?name=${name}${avatar ? `&avatar=${avatar}` : ''}&user_type=${user_type}&highlightMessage=${item.id}&searchQuery=${searchQuery}&showSearch=true`)}>
                  <View className="mr-3">
                    <View className="w-10 h-10 rounded-full bg-[#af1616] items-center justify-center">
                      <Text className="text-white font-bold text-sm">{getInitials(my ? (user?.first_name + ' ' + user?.last_name) : (name as string))}</Text>
                    </View>
                  </View>
                  <View className="flex-1">
                    <Text className="font-medium" style={{ color: textColor }}>{my ? 'You' : name}</Text>
                    <Text className="mt-1" style={{ color: textColor }} numberOfLines={2}>
                      {item.type === 'image' ? '📷 Image' : item.type === 'file' ? `📄 ${item.fileName}` : (
                        <Text>{item.text.split(new RegExp(`(${searchQuery})`, 'gi')).map((p, i) => <Text key={i} style={{ color: p.toLowerCase() === searchQuery.toLowerCase() ? '#F59E0B' : textColor, fontWeight: p.toLowerCase() === searchQuery.toLowerCase() ? 'bold' : 'normal' }}>{p}</Text>)}</Text>
                      )}
                    </Text>
                    <Text className="text-xs mt-1" style={{ color: mutedColor }}>{new Date(item.timestamp).getHours().toString().padStart(2, '0')}:{new Date(item.timestamp).getMinutes().toString().padStart(2, '0')}</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        ) : (
          <FlatList
            key={activeTab}
            data={(activeTab === 'links' ? linkItems : activeTab === 'files' ? fileItems : mediaItems) as any}
            keyExtractor={item => item.id}
            numColumns={activeTab === 'media' ? 3 : 1}
            renderItem={({ item }) => (
              <InfoMediaItem
                item={item}
                textColor={textColor}
                mutedColor={mutedColor}
                onImagePress={(url) => { const urls = mediaItems.filter(m => m.type === 'image').map(m => m.url); setImageCarousel(urls); setCurrentImageIndex(urls.indexOf(url)); setImageModalVisible(true); }}
              />
            )}
            onEndReached={activeTab === 'media' ? loadMoreMedia : undefined}
            onEndReachedThreshold={0.1}
            contentContainerStyle={{ paddingBottom: hasThreeButtonNav ? insets.bottom : 0 }}
            ListFooterComponent={activeTab === 'media' && loadingMore ? <ActivityIndicator size="small" color="#af1616" /> : null}
          />
        )}
      </View>

      <InfoModals
        imageModalVisible={imageModalVisible}
        imageCarousel={imageCarousel}
        currentImageIndex={currentImageIndex}
        onCloseImageModal={() => setImageModalVisible(false)}
        onPrevImage={() => setCurrentImageIndex(p => p - 1)}
        onNextImage={() => setCurrentImageIndex(p => p + 1)}
      />
    </View>
  );
}