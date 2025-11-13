import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Modal,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, 
  Search, 
  Image as ImageIcon, 
  File, 
  Link, 
  X 
} from 'lucide-react-native';
import { messageService, Message } from '@/services/messageService';
import { API_BASE_URL } from '@/constants/Config';

// Skeleton loader component
const SkeletonLoader = ({ width, height, borderRadius = 4 }: { width: number | string; height: number; borderRadius?: number }) => {
  const mutedColor = useThemeColor({}, 'muted');
  
  return (
    <View
      style={{
        width: width as any,
        height,
        borderRadius,
        backgroundColor: mutedColor + '30',
      }}
    />
  );
};

// File icon component
const FileIcon = ({ type, fileName }: { type: string; fileName?: string }) => {
  const getFileType = () => {
    if (type === 'image') return 'image';
    if (fileName) {
      const ext = fileName.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') return 'pdf';
      if (ext === 'doc' || ext === 'docx') return 'word';
      if (ext === 'png') return 'png';
      if (ext === 'jpg' || ext === 'jpeg') return 'jpg';
    }
    return 'document';
  };
  
  const fileType = getFileType();
  
  switch (fileType) {
    case 'pdf':
      return <Image source={require('../../assets/images/pdf.png')} className="w-6 h-6" />;
    case 'word':
      return <Image source={require('../../assets/images/docs.png')} className="w-6 h-6" />;
    case 'png':
      return <Image source={require('../../assets/images/png.png')} className="w-6 h-6" />;
    case 'jpg':
      return <Image source={require('../../assets/images/jpg.png')} className="w-6 h-6" />;
    default:
      return <File size={20} color="#666" />;
  }
};

interface MediaItem {
  id: string;
  type: 'image' | 'file' | 'link';
  url: string;
  name?: string;
  timestamp: Date;
  fileName?: string;
}

interface LinkItem {
  id: string;
  url: string;
  text: string;
  timestamp: Date;
}

export default function ChatInfoScreen() {
  const router = useRouter();
  const { id, name, avatar, user_type, searchQuery: initialSearchQuery, showSearch: initialShowSearch } = useLocalSearchParams();
  const { user } = useAuth();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardColor = useThemeColor({}, 'card');
  const mutedColor = useThemeColor({}, 'muted');
  

  
  // Extract actual user ID from unique_key format (user_type_id)
  const actualUserId = (id as string).includes('_') ? (id as string).split('_')[1] : id as string;

  const [activeTab, setActiveTab] = useState<'media' | 'files' | 'links'>('media');
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery === 'highlight' ? '' : (initialSearchQuery as string || ''));
  const [showSearch, setShowSearch] = useState(initialShowSearch === 'true' || !!initialSearchQuery);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [linkItems, setLinkItems] = useState<LinkItem[]>([]);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [searchResults, setSearchResults] = useState<Message[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [imageCarousel, setImageCarousel] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mediaPage, setMediaPage] = useState(1);
  const [hasMoreMedia, setHasMoreMedia] = useState(true);



  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!initialLoading) {
      setMediaPage(1);
      setHasMoreMedia(true);
      loadMediaItems(1, false);
    }
  }, [activeTab, initialLoading]);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchMessages();
    } else {
      setShowSearchResults(false);
      setSearchResults([]);
    }
  }, [searchQuery, allMessages]);

  // Restore search state on initial load
  useEffect(() => {
    if (initialSearchQuery && initialSearchQuery !== 'highlight' && !initialLoading) {
      setShowSearch(true);
      setSearchQuery(initialSearchQuery as string);
    }
  }, [initialLoading]);

  const detectLinks = (text: string): string[] => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
  };

  const loadInitialData = async () => {
    setInitialLoading(true);
    
    try {
      if (!user?.id || !actualUserId) {
        console.error('Missing user ID or actual user ID');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/messages/get_messages.php?sender_id=${user?.id}&receiver_id=${actualUserId}&page=1&limit=1000`);
      const data = await response.json();
      
      if (data.success && data.messages) {
        setAllMessages(data.messages);
        
        // Extract links from text messages
        const links: LinkItem[] = [];
        data.messages.forEach((msg: Message) => {
          if (msg.type === 'text' && msg.text) {
            const detectedLinks = detectLinks(msg.text);
            detectedLinks.forEach(link => {
              links.push({
                id: `${msg.id}-${link}`,
                url: link,
                text: msg.text,
                timestamp: new Date(msg.timestamp)
              });
            });
          }
        });
        setLinkItems(links);
        
        // Load initial media items
        const mediaMessages = data.messages.filter((msg: Message) => msg.type === 'image');
        const initialMedia = mediaMessages.slice(0, 15).map((msg: Message) => ({
          id: msg.id,
          type: msg.type as 'image' | 'file',
          url: msg.fileUrl || '',
          name: msg.fileName || msg.text,
          fileName: msg.fileName,
          timestamp: new Date(msg.timestamp)
        }));
        
        setMediaItems(initialMedia);
        setHasMoreMedia(mediaMessages.length > 15);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const loadMediaItems = async (page = 1, append = false) => {
    if (!append) setLoading(true);
    
    try {
      // Filter messages for media/files with pagination
      let filteredItems = allMessages.filter((msg: Message) => {
        if (activeTab === 'media') return msg.type === 'image';
        if (activeTab === 'files') return msg.type === 'file';
        return false;
      });
      
      // Apply pagination for media tab
      if (activeTab === 'media') {
        const startIndex = (page - 1) * 15;
        const endIndex = startIndex + 15;
        const paginatedItems = filteredItems.slice(0, endIndex);
        setHasMoreMedia(endIndex < filteredItems.length);
        filteredItems = paginatedItems;
      }
      
      const mappedItems = filteredItems.map((msg: Message) => ({
        id: msg.id,
        type: msg.type as 'image' | 'file',
        url: msg.fileUrl || '',
        name: msg.fileName || msg.text,
        fileName: msg.fileName,
        timestamp: new Date(msg.timestamp)
      }));
      
      if (append && activeTab === 'media') {
        setMediaItems(prev => [...prev, ...mappedItems.slice(prev.length)]);
      } else {
        setMediaItems(mappedItems);
      }
    } catch (error) {
      console.error('Error loading media:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMedia = () => {
    if (hasMoreMedia && activeTab === 'media') {
      const nextPage = mediaPage + 1;
      setMediaPage(nextPage);
      loadMediaItems(nextPage, true);
    }
  };

  const searchMessages = async () => {
    if (!searchQuery.trim()) return;
    
    setSearchLoading(true);
    setShowSearchResults(true);
    
    try {
      // Search through already loaded messages
      const filtered = allMessages.filter(msg => 
        msg.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (msg.fileName && msg.fileName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      
      setSearchResults(filtered);
    } catch (error) {
      console.error('Error searching messages:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name || typeof name !== 'string') return 'U';
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2) || 'U';
  };

  const renderMediaItem = ({ item, index }: { item: MediaItem | LinkItem; index: number }) => {
    if ('type' in item && item.type === 'image') {
      return (
        <TouchableOpacity 
          className="w-1/3 p-1"
          onPress={() => {
            const imageUrls = mediaItems.filter(media => media.type === 'image').map(media => media.url);
            const index = imageUrls.indexOf(item.url);
            setImageCarousel(imageUrls);
            setCurrentImageIndex(index >= 0 ? index : 0);
            setSelectedImageUrl(item.url);
            setImageModalVisible(true);
          }}
        >
          <Image source={{ uri: item.url }} className="w-full h-24 rounded-lg" />
        </TouchableOpacity>
      );
    }
    
    if ('type' in item && item.type === 'file') {
      return (
        <TouchableOpacity className="flex-row items-center p-3 border-b" style={{ borderBottomColor: mutedColor + '30' }}>
          <View className="w-10 h-10 rounded-lg bg-gray-100 items-center justify-center mr-3">
            <FileIcon type={item.type} fileName={item.fileName} />
          </View>
          <View className="flex-1">
            <Text className="font-medium" style={{ color: textColor }}>{item.name}</Text>
            <Text className="text-xs" style={{ color: mutedColor }}>
              {item.timestamp.toLocaleDateString()}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    // Link item
    if ('url' in item && !('type' in item)) {
      return (
        <TouchableOpacity 
          className="flex-row items-center p-3 border-b" 
          style={{ borderBottomColor: mutedColor + '30' }}
          onPress={() => Linking.openURL(item.url)}
        >
          <View className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center mr-3">
            <Link size={20} color="#fff" />
          </View>
          <View className="flex-1">
            <Text className="font-medium text-blue-600" numberOfLines={1}>{item.url}</Text>
            <Text className="text-sm mt-1" style={{ color: textColor }} numberOfLines={2}>{item.text}</Text>
            <Text className="text-xs mt-1" style={{ color: mutedColor }}>
              {item.timestamp.toLocaleDateString()}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    return null;
  };

  // Full screen skeleton loader
  const FullScreenSkeleton = () => (
    <View style={{ flex: 1, backgroundColor }}>
      {/* Header skeleton */}
      <View className="flex-row items-center px-4 py-4 pt-10 border-b" style={{ backgroundColor: cardColor, borderBottomColor: mutedColor + '30' }}>
        <SkeletonLoader width={24} height={24} borderRadius={12} />
        <View className="ml-3 flex-1">
          <SkeletonLoader width={100} height={20} borderRadius={4} />
        </View>
        <SkeletonLoader width={24} height={24} borderRadius={12} />
      </View>
      
      {/* Profile section skeleton */}
      <View className="items-center py-6" style={{ backgroundColor: cardColor }}>
        <SkeletonLoader width={96} height={96} borderRadius={48} />
        <View className="mt-4">
          <SkeletonLoader width={120} height={24} borderRadius={4} />
        </View>
        <View className="mt-2">
          <SkeletonLoader width={80} height={16} borderRadius={4} />
        </View>
      </View>
      
      {/* Tabs skeleton */}
      <View className="flex-row border-b" style={{ backgroundColor: cardColor, borderBottomColor: mutedColor + '30' }}>
        {[1,2,3].map(i => (
          <View key={i} className="flex-1 py-4 items-center">
            <SkeletonLoader width={60} height={16} borderRadius={4} />
          </View>
        ))}
      </View>
      
      {/* Content skeleton */}
      <View className="flex-row flex-wrap p-1">
        {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
          <View key={i} className="w-1/3 p-1">
            <SkeletonLoader width="100%" height={96} borderRadius={8} />
          </View>
        ))}
      </View>
    </View>
  );

  if (initialLoading) {
    return <FullScreenSkeleton />;
  }

  return (
    <View style={{ flex: 1, backgroundColor }}>
      {/* Fixed Header */}
      <View className="flex-row items-center px-4 py-4 pt-10 border-b" style={{ backgroundColor: cardColor, borderBottomColor: mutedColor + '30' }}>
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ArrowLeft size={24} color={textColor} />
        </TouchableOpacity>
        <Text className="text-xl font-bold" style={{ color: textColor }}>Chat Info</Text>
        <View className="flex-1" />
        <TouchableOpacity onPress={() => setShowSearch(!showSearch)}>
          <Search size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      {/* Fixed Search Bar */}
      {showSearch && (
        <View className="px-4 py-3 border-b" style={{ backgroundColor: cardColor, borderBottomColor: mutedColor + '30' }}>
          <View className="flex-row items-center rounded-full px-4 py-0 border" style={{ backgroundColor, borderColor: mutedColor + '40' }}>
            <Search size={20} color={mutedColor} />
            <TextInput
              className="flex-1 ml-2 text-base"
              style={{ color: textColor }}
              placeholder="Search messages..."
              placeholderTextColor={mutedColor}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => {
                setSearchQuery('');
                setShowSearchResults(false);
                setSearchResults([]);
              }}>
                <X size={20} color={mutedColor} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Fixed Profile Section */}
      <View className="items-center py-6" style={{ backgroundColor: cardColor }}>
        <View className="relative">
          <View className="w-24 h-24 rounded-full items-center justify-center" style={{ backgroundColor: '#af1616' }}>
            <Text className="text-white font-bold text-2xl">
              {getInitials(name as string || 'User')}
            </Text>
          </View>
          {avatar && (
            <Image
              source={{ uri: avatar as string }}
              className="absolute inset-0 w-24 h-24 rounded-full"
            />
          )}
          <View className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white" />
        </View>
        <Text className="text-2xl font-bold mt-4" style={{ color: textColor }}>
          {name || 'User'}
        </Text>
        <Text className="text-sm" style={{ color: mutedColor }}>{user_type}</Text>
      </View>

      {/* Fixed Tabs */}
      <View className="flex-row border-b" style={{ backgroundColor: cardColor, borderBottomColor: mutedColor + '30' }}>
        {(['media', 'files', 'links'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`flex-1 py-4 items-center ${activeTab === tab ? 'border-b-2' : ''}`}
            style={{ borderBottomColor: activeTab === tab ? '#af1616' : 'transparent' }}
          >
            <Text className={`font-medium ${activeTab === tab ? 'font-bold' : ''}`} style={{ color: activeTab === tab ? '#af1616' : mutedColor }}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Scrollable Content */}
      <View style={{ flex: 1 }}>

        {showSearchResults ? (
          <FlatList
            data={searchResults}
            renderItem={({ item }) => {
              const isMyMessage = String(item.senderId) === String(user?.id);
              
              return (
                <TouchableOpacity 
                  className="flex-row p-4 border-b" 
                  style={{ borderBottomColor: mutedColor + '30' }}
                  onPress={() => {
                    router.push(`/chat/${id}?name=${encodeURIComponent(name as string)}${avatar ? `&avatar=${encodeURIComponent(avatar as string)}` : ''}&user_type=${user_type}&highlightMessage=${item.id}&searchQuery=${encodeURIComponent(searchQuery)}&showSearch=true`);
                  }}
                >
                  <View className="mr-3">
                    {isMyMessage ? (
                      user?.avatar_url ? (
                        <Image
                          source={{ uri: user.avatar_url }}
                          className="w-10 h-10 rounded-full"
                          style={{ backgroundColor: '#af1616' }}
                        />
                      ) : (
                        <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: '#af1616' }}>
                          <Text className="text-white font-bold text-sm">
                            {getInitials(user?.first_name + ' ' + user?.last_name || 'You')}
                          </Text>
                        </View>
                      )
                    ) : (
                      avatar ? (
                        <Image
                          source={{ uri: avatar as string }}
                          className="w-10 h-10 rounded-full"
                          style={{ backgroundColor: '#af1616' }}
                        />
                      ) : (
                        <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: '#af1616' }}>
                          <Text className="text-white font-bold text-sm">
                            {getInitials(name as string || 'User')}
                          </Text>
                        </View>
                      )
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="font-medium" style={{ color: textColor }}>
                      {isMyMessage ? 'You' : name}
                    </Text>
                    <Text className="mt-1" style={{ color: textColor }} numberOfLines={2}>
                      {item.type === 'image' ? '📷 Image' : item.type === 'file' ? `📄 ${item.fileName}` : (
                        <Text>
                          {item.text.split(new RegExp(`(${searchQuery})`, 'gi')).map((part, index) => (
                            <Text key={index} style={{ color: part.toLowerCase() === searchQuery.toLowerCase() ? '#F59E0B' : textColor, fontWeight: part.toLowerCase() === searchQuery.toLowerCase() ? 'bold' : 'normal' }}>
                              {part}
                            </Text>
                          ))}
                        </Text>
                      )}
                    </Text>
                    <Text className="text-xs mt-1" style={{ color: mutedColor }}>
                      {new Date(item.timestamp).toLocaleString()}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            }}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <View className="py-8 items-center">
                <Text style={{ color: mutedColor }}>No messages found for "{searchQuery}"</Text>
                <Text className="text-xs mt-2" style={{ color: mutedColor }}>Try different keywords</Text>
              </View>
            }
          />
        ) : (
          <FlatList
            key={activeTab}
            data={activeTab === 'links' ? linkItems : mediaItems}
            renderItem={renderMediaItem}
            keyExtractor={(item) => item.id}
            numColumns={activeTab === 'media' ? 3 : 1}
            onEndReached={activeTab === 'media' ? loadMoreMedia : undefined}
            onEndReachedThreshold={0.5}
            ListFooterComponent={activeTab === 'media' && hasMoreMedia ? (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" color="#af1616" />
                <Text className="text-xs mt-2" style={{ color: mutedColor }}>Loading more...</Text>
              </View>
            ) : null}
            ListEmptyComponent={
              <View className="py-8 items-center">
                <Text style={{ color: mutedColor }}>No {activeTab} found</Text>
                <Text className="text-xs mt-2" style={{ color: mutedColor }}>
                  {activeTab === 'links' ? 'Links will appear here when shared' : 'Media will appear here when shared'}
                </Text>
              </View>
            }
          />
        )}
      </View>
      
      {/* Image Carousel Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View className="flex-1 bg-black">
          {/* Close Button */}
          <TouchableOpacity
            className="absolute top-12 right-4 z-10 w-14 h-14 rounded-full bg-white bg-opacity-90 items-center justify-center shadow-lg"
            onPress={() => setImageModalVisible(false)}
            style={{ elevation: 5 }}
          >
            <Text className="text-black text-2xl font-bold">×</Text>
          </TouchableOpacity>
          
          {/* Image Counter */}
          {imageCarousel.length > 1 && (
            <View className="absolute top-12 left-4 z-10 px-3 py-1 rounded-full bg-black bg-opacity-50">
              <Text className="text-white text-sm">{currentImageIndex + 1} / {imageCarousel.length}</Text>
            </View>
          )}
          
          {/* Current Image */}
          {imageCarousel[currentImageIndex] && (
            <Image
              source={{ uri: imageCarousel[currentImageIndex] }}
              className="flex-1"
              resizeMode="contain"
            />
          )}
          
          {/* Navigation Buttons */}
          {imageCarousel.length > 1 && (
            <>
              {/* Previous Button */}
              {currentImageIndex > 0 && (
                <TouchableOpacity
                  className="absolute left-4 top-1/2 w-12 h-12 rounded-full bg-black bg-opacity-50 items-center justify-center"
                  onPress={() => setCurrentImageIndex(prev => prev - 1)}
                  style={{ marginTop: -24 }}
                >
                  <Text className="text-white text-2xl font-bold">‹</Text>
                </TouchableOpacity>
              )}
              
              {/* Next Button */}
              {currentImageIndex < imageCarousel.length - 1 && (
                <TouchableOpacity
                  className="absolute right-4 top-1/2 w-12 h-12 rounded-full bg-black bg-opacity-50 items-center justify-center"
                  onPress={() => setCurrentImageIndex(prev => prev + 1)}
                  style={{ marginTop: -24 }}
                >
                  <Text className="text-white text-2xl font-bold">›</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}