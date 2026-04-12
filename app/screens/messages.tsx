import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/constants/Config';
import { ArrowLeft, Users } from 'lucide-react-native';
import { messageService } from '@/services/messageService';
import { User } from '@/@types/screens/messages';

import { ActiveSkeleton, ConversationSkeleton } from '@/components/messages/MessageLoaders';
import { MessageSearchBar } from '@/components/messages/MessageSearchBar';
import { ActiveUserItem } from '@/components/messages/ActiveUserItem';
import { ConversationItem } from '@/components/messages/ConversationItem';
import { SearchResultItem } from '@/components/messages/SearchResultItem';
import { ChatLoadingModal } from '@/components/messages/ChatLoadingModal';

export default function MessagesScreen() {
  const router = useRouter();
  const { user, loading: authLoading, clearUser } = useAuth();
  const insets = useSafeAreaInsets();
  // Theme Change 
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardColor = useThemeColor({}, 'card');
  const mutedColor = useThemeColor({}, 'muted');
  
  // Enhanced navigation detection
  const hasThreeButtonNav = React.useMemo(() => {
    if (Platform.OS === 'ios') {
      return insets.bottom > 20; // iOS home indicator
    }
    return insets.bottom > 0; // Android three-button nav
  }, [insets.bottom]);

  const isGestureNav = React.useMemo(() => {
    return Platform.OS === 'android' && insets.bottom === 0;
  }, [insets.bottom]);
  
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
    
    // Set up live fetching every 5 seconds for updates
    const interval = setInterval(() => {
      if (!showSearchResults && !loading && !activeLoading) {
        loadConversations(1, false, true);
        loadActiveUsers(1, false, true);
      }
    }, 5000);
    
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
     
      /** 
      console.log('💬 CONVERSATION USERS:');
      console.log('  🟢 ONLINE (' + onlineConvUsers.length + '):', onlineConvUsers.map(u => `${u.name} (${u.user_type})`));
      console.log('  🔴 OFFLINE (' + offlineConvUsers.length + '):', offlineConvUsers.map(u => `${u.name} (${u.user_type})`));
      **/
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

      /** 
      // Logs Identifying Users List of (Online / Offline )
      console.log('🟢 ONLINE USERS (' + onlineUsers.length + '):', onlineUsers.map(u => `${u.name} (${u.user_type})`));
      console.log('🔴 OFFLINE USERS (' + offlineUsers.length + '):', offlineUsers.map(u => `${u.name} (${u.user_type})`));
      console.log('📊 Total users loaded:', allUsers.length);
      **/
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
    const statusInterval = setInterval(refreshOnlineStatus, 8000); // Refresh online status every 8 seconds
    
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

  const handleChatPress = (item: User) => {
    const chatId = String(item.unique_key || item.id).substring(0, 50);
    const params = new URLSearchParams({
      name: String(item.name || ''),
      ...(item.avatar_url && { avatar: String(item.avatar_url) }),
      user_type: String(item.user_type || ''),
      isOnline: String(item.isOnline)
    });
    setChatLoading(true);
    updateSessionOnInteraction();
    clearSearch();
    setTimeout(() => {
      router.push(`/chat/${chatId}?${params.toString()}`);
    }, 100);
  };

  const renderConversationUser = ({ item }: { item: User }) => (
    <ConversationItem 
      item={item} 
      onPress={() => handleChatPress(item)} 
      textColor={textColor} 
      mutedColor={mutedColor} 
    />
  );

  const renderSearchResult = ({ item }: { item: User }) => (
    <SearchResultItem 
      item={item} 
      onPress={() => handleChatPress(item)} 
      textColor={textColor} 
      mutedColor={mutedColor} 
    />
  );

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
      <MessageSearchBar
        searchQuery={searchQuery}
        handleSearch={handleSearch}
        clearSearch={clearSearch}
        cardColor={cardColor}
        mutedColor={mutedColor}
        textColor={textColor}
      />

      {/* Search Results or Main Content */}
      {showSearchResults ? (
        <View className="flex-1" style={{ backgroundColor }}>
          <View className="px-4 py-1">
            <Text className="text-lg font-semibold" style={{ color: textColor }}>
              Search Results
            </Text>
          </View>
          {searchLoading ? (
            <ConversationSkeleton cardColor={cardColor} mutedColor={mutedColor} />
          ) : searchResults.length > 0 ? (
            <FlatList
              data={searchResults}
              renderItem={renderSearchResult}
              keyExtractor={(item, index) => `search-${item.unique_key || item.id}-${index}`}
              style={{ backgroundColor }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ 
                paddingBottom: hasThreeButtonNav ? insets.bottom + 16 : isGestureNav ? 24 : 16 
              }}
            />
          ) : (
            <View className="flex-1 justify-center items-center px-4 py-20">
              <Users size={64} color={mutedColor} />
              <Text className="text-lg font-medium mt-4" style={{ color: mutedColor }}>No users found</Text>
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
              <ActiveSkeleton mutedColor={mutedColor} />
            ) : activeUsers.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
              >
                {activeUsers.map((item, index) => (
                  <ActiveUserItem 
                    key={`active-users-${item.unique_key || item.id}-${index}`}
                    item={item}
                    onPress={() => handleChatPress(item)}
                    textColor={textColor}
                  />
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
            <ConversationSkeleton cardColor={cardColor} mutedColor={mutedColor} />
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
              contentContainerStyle={{ 
                paddingBottom: hasThreeButtonNav ? insets.bottom + 16 : isGestureNav ? 24 : 16 
              }}
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
      <ChatLoadingModal 
        visible={chatLoading} 
        cardColor={cardColor} 
        textColor={textColor} 
      />
    </View>
  );
}