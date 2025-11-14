import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  ScrollView,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/constants/Config';
import { Search, ArrowLeft, X, Check } from 'lucide-react-native';
import { messageService, User } from '@/services/messageService';

// Loading State Skeleton Loader 
const SkeletonLoader = ({ width, height, borderRadius = 4 }: { width: number | string; height: number; borderRadius?: number }) => {
  const cardColor = useThemeColor({}, 'card');
  const mutedColor = useThemeColor({}, 'muted');
  
  return (
    <View
      style={{
        width: width as any,
        height,
        borderRadius,
        backgroundColor: mutedColor + '30',
      } as any}
    />
  );
};

export default function MessagesScreen() {
  const router = useRouter();
  const { user, loading: authLoading, clearUser } = useAuth();
  // Theme Change 
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardColor = useThemeColor({}, 'card');
  const mutedColor = useThemeColor({}, 'muted');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeLoading, setActiveLoading] = useState(true);
  const [activeLoadingMore, setActiveLoadingMore] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [conversationPage, setConversationPage] = useState(1);
  const [activePage, setActivePage] = useState(1);
  const [hasMoreConversations, setHasMoreConversations] = useState(true);
  const [hasMoreActive, setHasMoreActive] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    loadConversations();
    loadActiveUsers();
    
    // Set up live fetching every 2 seconds for faster updates
    const interval = setInterval(() => {
      if (!showSearchResults && !loading && !activeLoading) {
        loadConversations(1, false, true);
        loadActiveUsers(1, false, true);
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [showSearchResults]);
  
  // Hide loading modal when screen comes back into focus
  useEffect(() => {
    if (chatLoading) {
      const timer = setTimeout(() => {
        setChatLoading(false);
      }, 2000); // Increased timeout to ensure chat loads
      
      return () => clearTimeout(timer);
    }
  }, [chatLoading]);
  
/**
 * Load Conversations 
 */
  const loadConversations = async (page = 1, append = false, silent = false) => {
    try {
      if (!user?.id) return;
      if (!silent) {
        if (!append) setLoading(true);
        else setLoadingMore(true);
      }
      
      // Get New Users and Has More on Message Service 
      const { users: newUsers, hasMore } = await messageService.getConversations(user.id, page, 10);
      
      // Debug conversation users online status
      const onlineConvUsers = newUsers.filter(u => u.isOnline);
      const offlineConvUsers = newUsers.filter(u => !u.isOnline);
      
      console.log('💬 CONVERSATION USERS:');
      console.log('  🟢 ONLINE (' + onlineConvUsers.length + '):', onlineConvUsers.map(u => `${u.name} (${u.user_type})`));
      console.log('  🔴 OFFLINE (' + offlineConvUsers.length + '):', offlineConvUsers.map(u => `${u.name} (${u.user_type})`));
      
      // Sort users: latest message time first (most recent conversations at top)
      const sortedUsers = newUsers.sort((a, b) => {
        // Use raw timestamp for accurate sorting
        const timeA = a.lastMessageTimestamp ? new Date(a.lastMessageTimestamp).getTime() : 0;
        const timeB = b.lastMessageTimestamp ? new Date(b.lastMessageTimestamp).getTime() : 0;
        return timeB - timeA;
      });
      
      if (append) {
        // Remove duplicates and re-sort everything
        // This Variables make sure that the users are not duplicated
        const combined = [...users, ...sortedUsers];
        const uniqueUsers = combined.filter((user, index, self) => 
          index === self.findIndex(u => u.unique_key === user.unique_key)
        );
        const finalSorted = uniqueUsers.sort((a, b) => {
          const timeA = a.lastMessageTimestamp ? new Date(a.lastMessageTimestamp).getTime() : 0;
          const timeB = b.lastMessageTimestamp ? new Date(b.lastMessageTimestamp).getTime() : 0;
          return timeB - timeA;
        });
        setUsers(finalSorted);
      } else {
        setUsers(sortedUsers);
      }
      
      setHasMoreConversations(hasMore);
      setConversationPage(page);
    } catch (error) {
      console.error('❌ Error loading conversations:', error);
    } finally {
      if (!silent) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  };
  
  /**
  * Load Active / Online Users
  */
  const loadActiveUsers = async (page = 1, append = false, silent = false) => {
    try {

      if (!user?.id) return;
      if (!silent) {
        if (!append) setActiveLoading(true);
        else setActiveLoadingMore(true);
      }
      
      const { users: allUsers, hasMore } = await messageService.getActiveUsers(user.id, page, 10);
      
      // Debug online status
      const onlineUsers = allUsers.filter(u => u.isOnline);
      const offlineUsers = allUsers.filter(u => !u.isOnline);

      // Logs Identifying Users List of (Online / Offline )
      console.log('🟢 ONLINE USERS (' + onlineUsers.length + '):', onlineUsers.map(u => `${u.name} (${u.user_type})`));
      console.log('🔴 OFFLINE USERS (' + offlineUsers.length + '):', offlineUsers.map(u => `${u.name} (${u.user_type})`));
      console.log('📊 Total users loaded:', allUsers.length);
      
      // Remove duplicates based on unique_key
      const uniqueUsers = allUsers.filter((user, index, self) => 
        index === self.findIndex(u => u.unique_key === user.unique_key)
      );
      
      // Set Active Users 
      if (append) {
        setActiveUsers(prev => {
          const combined = [...prev, ...uniqueUsers];
          return combined.filter((user, index, self) => 
            index === self.findIndex(u => u.unique_key === user.unique_key)
          );
        });
      } else {
        setActiveUsers(uniqueUsers);
      }
      
      setHasMoreActive(hasMore);
      setActivePage(page);
    } catch (error) {
      console.error('❌ Error loading active users:', error);
    } finally {
      if (!silent) {
        setActiveLoading(false);
        setActiveLoadingMore(false);
      }
    }
  };

/**
 * Load More Conversations Display 
 */
  const loadMoreConversations = useCallback(() => {
    if (!loadingMore && hasMoreConversations) {
      loadConversations(conversationPage + 1, true);
    }
  }, [loadingMore, hasMoreConversations, conversationPage]);

  /**
   * Load More active Users 
   */
  const loadMoreActiveUsers = useCallback(() => {
    if (!activeLoadingMore && hasMoreActive) {
      loadActiveUsers(activePage + 1, true);
    }
  }, [activeLoadingMore, hasMoreActive, activePage]);

  /**
   * Refreshing Data 
   */
  const refreshData = async () => {
    setConversationPage(1);
    setActivePage(1);
    await Promise.all([
      loadConversations(1, false),
      loadActiveUsers(1, false)
    ]);
  };

  // Update active sessions -> ( login.php (backend/api) ) when app becomes active
  useEffect(() => {
    const updateActiveSession = async () => {
      if (user?.id) {
        try {
          await fetch(`${API_BASE_URL}/api/login.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ update_session: true, user_id: user.id })
          });
        } catch (error) {
          console.error('Error updating session:', error);
        }
      }
    };
    
    const refreshOnlineStatus = async () => {
      if (user?.id) {
        // Update message statuses when checking online status
        await messageService.updateMessageStatuses(user.id);
        // Refresh both active users and conversations to get updated online status from backend
        await Promise.all([
          loadActiveUsers(1, false, true),
          loadConversations(1, false, true)
        ]);
      }
    };
    
    updateActiveSession();
    refreshOnlineStatus();
    
    const sessionInterval = setInterval(updateActiveSession, 30000); // Update session every 30 seconds
    const statusInterval = setInterval(refreshOnlineStatus, 3000); // Refresh online status every 3 seconds
    
    return () => {
      clearInterval(sessionInterval);
      clearInterval(statusInterval);
    };
  }, [user?.id]);

  // Update session on user interactions
  const updateSessionOnInteraction = async () => {
    if (user?.id) {
      try {
        await fetch(`${API_BASE_URL}/api/login.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ update_session: true, user_id: user.id })
        });
      } catch (error) {
        console.error('Error updating session on interaction:', error);
      }
    }
  };
  // Handle Searching of Users 
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    updateSessionOnInteraction(); // Update session on search
    
    if (!query.trim()) {
      setShowSearchResults(false);
      setSearchResults([]);
      return;
    }

    if (!user?.id) return;
    setSearchLoading(true);
    setShowSearchResults(true);
    
    try {
      const results = await messageService.searchUsers(user.id, query);
      // Remove duplicates based on unique_key
      const uniqueResults = results.filter((user, index, self) => 
        index === self.findIndex(u => u.unique_key === user.unique_key)
      );
      setSearchResults(uniqueResults);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setShowSearchResults(false);
    setSearchResults([]);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderActiveUser = ({ item }: { item: User }) => {
    const chatId = String(item.unique_key || item.id).substring(0, 50); // Limit ID length
    const params = new URLSearchParams({
      name: String(item.name || ''),
      ...(item.avatar_url && { avatar: String(item.avatar_url) }),
      user_type: String(item.user_type || ''),
      isOnline: String(item.isOnline)
    });
    
    return (
      <TouchableOpacity
        onPress={() => router.push(`/chat/${chatId}?${params.toString()}`)}
        className="items-center mr-4"
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
                {getInitials(item.name)}
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
          {item.name.split(' ')[0]}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderConversationUser = ({ item }: { item: User }) => {
    const chatId = String(item.unique_key || item.id).substring(0, 50); // Limit ID length
    const params = new URLSearchParams({
      name: String(item.name || ''),
      ...(item.avatar_url && { avatar: String(item.avatar_url) }),
      user_type: String(item.user_type || ''),
      isOnline: String(item.isOnline)
    });
    
    return (
      <TouchableOpacity
        onPress={() => {
          setChatLoading(true);
          updateSessionOnInteraction(); // Update session on chat open
          setTimeout(() => {
            router.push(`/chat/${chatId}?${params.toString()}`);
          }, 100); // Small delay to ensure modal shows first
        }}
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
                {getInitials(item.name)}
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
                  <Text className="text-xs" style={{ color: mutedColor }}>
                    {item.messageStatus.toLowerCase().trim() === 'seen' 
                      ? item.messageStatus 
                      : (item.messageStatus.toLowerCase().trim() === 'delivered' && !item.isOnline 
                          ? 'Sent' 
                          : item.messageStatus)
                    }
                  </Text>
                  {item.messageStatus.toLowerCase().trim() === 'seen' && (
                    <View className="flex-row ml-1">
                      <Check size={10} color="#10B981" />
                      <Check size={10} color="#10B981" style={{ marginLeft: -6 }} />
                    </View>
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

  const renderActiveFooter = () => {
    if (!activeLoadingMore) return null;
    return (
      <View className="px-4">
        <ActivityIndicator size="small" color="#3B82F6" />
      </View>
    );
  };

  const renderActiveSkeleton = () => (
    <View className="flex-row px-4 pb-4">
      {[1, 2, 3, 4, 5 ].map((item) => (
        <View key={item} className="items-center mr-4">
          <SkeletonLoader width={56} height={56} borderRadius={28} />
          <View style={{ marginTop: 8 }}>
            <SkeletonLoader width={50} height={12} borderRadius={6} />
          </View>
        </View>
      ))}
    </View>
  );

  const renderConversationSkeleton = () => (
    <View style={{ backgroundColor: cardColor }}>
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <View key={item} className="flex-row items-center p-4" style={{ borderBottomWidth: 1, borderBottomColor: mutedColor + '30' }}>
          <SkeletonLoader width={48} height={48} borderRadius={24} />
          <View className="flex-1 ml-3">
            <View className="flex-row items-center justify-between">
              <SkeletonLoader width={120} height={16} borderRadius={8} />
              <SkeletonLoader width={40} height={12} borderRadius={6} />
            </View>
            <View style={{ marginTop: 4 }}>
              <SkeletonLoader width={180} height={12} borderRadius={6} />
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderSearchResult = ({ item }: { item: User }) => {
    const chatId = String(item.unique_key || item.id).substring(0, 50); // Limit ID length
    const params = new URLSearchParams({
      name: String(item.name || ''),
      ...(item.avatar_url && { avatar: String(item.avatar_url) }),
      user_type: String(item.user_type || '')
    });
    
    return (
      <TouchableOpacity
        onPress={() => {
          setChatLoading(true);
          updateSessionOnInteraction();
          clearSearch();
          setTimeout(() => {
            router.push(`/chat/${chatId}?${params.toString()}`);
          }, 100);
        }}
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
                {getInitials(item.name)}
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

  const renderConversationFooter = () => {
    if (!loadingMore) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#3B82F6" />
        <Text className="mt-2 text-xs" style={{ color: mutedColor }}>
          Loading more...
        </Text>
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
        <Text className="text-xl font-bold" style={{ color: textColor }}>
          Messages
        </Text>
      </View>

      {/* Search Bar */}
      <View className="px-4 py-3" style={{ backgroundColor: cardColor }}>
        <View
          className="flex-row items-center rounded-full px-4 py-0 border"
          style={{ 
            backgroundColor: cardColor,
            borderColor: mutedColor + '40'
          }}
        >
          <Search size={20} color={mutedColor} />
          <TextInput
            className="flex-1 ml-2 text-base"
            style={{ color: textColor }}
            placeholder="Search ..."
            placeholderTextColor={mutedColor}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} className="ml-2">
              <X size={20} color={mutedColor} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Results or Main Content */}
      {showSearchResults ? (
        <View className="flex-1" style={{ backgroundColor }}>
          <View className="px-4 py-1">
            <Text className="text-lg font-semibold" style={{ color: textColor }}>
              Search Results
            </Text>
          </View>
          {searchLoading ? (
            renderConversationSkeleton()
          ) : searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item, index) => `search-${item.unique_key || item.id}-${index}`}
              style={{ backgroundColor }}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View className="flex-1 justify-center items-center px-4 py-20">
              <Text className="text-lg font-medium" style={{ color: mutedColor }}>No users found</Text>
              <Text className="text-sm text-center mt-2" style={{ color: mutedColor }}>Try searching with a different name</Text>
            </View>
          )}
        </View>
      ) : (
        <>
          {/* All Users Section */}
          <View style={{ backgroundColor: cardColor }}>
            <View className="px-4 py-1">
              <Text className="text-lg font-semibold" style={{ color: textColor }}>
                All Users
              </Text>
            </View>
            {activeLoading ? (
              renderActiveSkeleton()
            ) : activeUsers.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
              >
                {activeUsers.map((item, index) => (
                  <View key={`active-users-${item.unique_key || item.id}-${index}`} className="items-center mr-4">
                    <TouchableOpacity
                      onPress={() => {
                        const chatId = String(item.unique_key || item.id).substring(0, 50);
                        const params = new URLSearchParams({
                          name: String(item.name || ''),
                          ...(item.avatar_url && { avatar: String(item.avatar_url) }),
                          user_type: String(item.user_type || '')
                        });
                        setChatLoading(true);
                        updateSessionOnInteraction();
                        setTimeout(() => {
                          router.push(`/chat/${chatId}?${params.toString()}`);
                        }, 100);
                      }}
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
                              {getInitials(item.name)}
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
                        {item.name.split(' ')[0]}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View className="px-4 py-8 items-center">
                <Text className="text-base" style={{ color: mutedColor }}>No users available</Text>
              </View>
            )}
          </View>

          {/* Recent Messages Section */}
          <View className="px-4 py-1" style={{ backgroundColor: cardColor }}>
            <Text className="text-lg font-semibold" style={{ color: textColor }}>Recent Messages</Text>
          </View>

          {/* Conversations List */}
          {loading ? (
            renderConversationSkeleton()
          ) : users.length > 0 ? (
            <FlatList
              data={users}
              renderItem={renderConversationUser}
              keyExtractor={(item, index) => `conversation-${item.unique_key || item.id}-${index}`}
              style={{ backgroundColor: cardColor }}
              showsVerticalScrollIndicator={false}
              refreshing={false}
              onRefresh={refreshData}
              onEndReached={loadMoreConversations}
              onEndReachedThreshold={0.5}
              ListFooterComponent={renderConversationFooter}
            />
          ) : (
            <View className="flex-1 justify-center items-center px-4 py-20" style={{ backgroundColor: cardColor }}>
              <Text className="text-lg font-medium" style={{ color: mutedColor }}>No recent messages</Text>
              <Text className="text-sm text-center mt-2" style={{ color: mutedColor }}>Start a conversation by selecting a user above</Text>
            </View>
          )}
        </>
      )}
      
      {/* Chat Loading Modal */}
      <Modal
        visible={chatLoading}
        transparent={true}
        animationType="fade"
      >
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View className="rounded-lg p-6 items-center" style={{ backgroundColor: cardColor, minWidth: 200 }}>
            <ActivityIndicator size="large" color="#af1616" />
            <Text className="mt-4 text-base font-medium" style={{ color: textColor }}>Loading chat...</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}