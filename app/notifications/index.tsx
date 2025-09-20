import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { AlertTriangle, Bell, Check, ChevronLeft, Clock, ArrowUp, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Animated,
  ActivityIndicator
} from 'react-native';

interface Notifications {
  id: number,
  type: string,
  title: string,
  message: string,
  time: string,
  read?: boolean,
  avatar?: string
}

// Base URL for API - use HTTPS consistently
const API_BASE_URL = 'https://msis.eduisync.io/api';

// Skeleton Loader Component
const SkeletonLoader = ({ width, height, borderRadius = 4, style = {} }) => {
  return (
    <View 
      className="bg-gray-200 dark:bg-gray-700 mb-2 overflow-hidden"
      style={[{ width, height, borderRadius }, style]}
    />
  );
};

// Skeleton with pulse animation
const SkeletonPulse = () => {
  return (
    <View className="absolute top-0 left-0 right-0 bottom-0 bg-gray-300 dark:bg-gray-600 opacity-20" 
      style={{
        animationDuration: '1.5s',
        animationIterationCount: 'infinite',
        animationTimingFunction: 'ease-in-out',
        animationKeyframes: {
          '0%': { opacity: 0.2 },
          '50%': { opacity: 0.4 },
          '100%': { opacity: 0.2 },
        }
      }}
    />
  );
};

const NotificationsScreen = () => {
  const colorScheme = useColorScheme();
  const navigation = useNavigation();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<Notifications[]>([]);
  const [displayedNotifications, setDisplayedNotifications] = useState<Notifications[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [clearAllModalVisible, setClearAllModalVisible] = useState(false);
  const [markAllReadModalVisible, setMarkAllReadModalVisible] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(10);
  const [hasMoreNotifications, setHasMoreNotifications] = useState(true);
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  // Handle scroll events to show/hide back to top button
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      listener: (event) => {
        const offsetY = event.nativeEvent.contentOffset.y;
        // Show back to top button when scrolled down 300 pixels
        setShowBackToTop(offsetY > 300);
      },
      useNativeDriver: false
    }
  );

  // Scroll to top function
  const scrollToTop = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  // Fetch notifications from API
  const fetchNotifications = async (loadMore = false) => {
    try {
      if (!user) {
        setLoading(false);
        return;
      }
      
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      
      console.log('Fetching notifications for user ID:', user.id);
      
      const response = await axios.get(`${API_BASE_URL}/get_student_notifications.php`, {
        params: {
          user_id: user.id,
          limit: loadMore ? displayLimit + 10 : displayLimit
        },
        timeout: 10000 // 10 second timeout
      });
      
      console.log('API Response:', response.data);
      
      if (response.data.success) {
        // Transform API data to match our frontend structure
        const transformedNotifications = response.data.notifications.map((notif: any) => ({
          id: notif.id,
          type: mapNotificationType(notif.type),
          title: notif.title,
          message: notif.message,
          time: formatTime(notif.created_at),
          read: notif.status === 'read',
          avatar: getAvatarForType(notif.type)
        }));
        
        setNotifications(transformedNotifications);
        
        // Check if we have more notifications to load
        if (loadMore) {
          setDisplayLimit(prevLimit => prevLimit + 10);
        } else {
          setDisplayLimit(10);
        }
        
        // Update displayed notifications based on current limit
        setDisplayedNotifications(transformedNotifications.slice(0, displayLimit));
        
        // Check if there are more notifications to load
        setHasMoreNotifications(transformedNotifications.length > displayLimit);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to fetch notifications');
      }
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      
      // Detailed error logging
      if (error.response) {
        // Server responded with error status
        console.error('Server error:', error.response.status, error.response.data);
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response received:', error.request);
      } else {
        // Something else happened
        console.error('Error:', error.message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  // Load more notifications when reaching the end
  const loadMoreNotifications = () => {
    if (hasMoreNotifications && !loadingMore) {
      fetchNotifications(true);
    }
  };

  // Start polling for new notifications
  const startPolling = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // Poll every 30 seconds
    
    setPollingInterval(interval);
    return interval;
  }, [user]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  }, [pollingInterval]);

  // Map backend notification types to frontend types
  const mapNotificationType = (type: string): string => {
    switch (type) {
      case 'requirement_approved':
        return 'success';
      case 'deadline_reminder':
        return 'reminder';
      case 'requirement_rejected':
      case 'document_needed':
        return 'alert';
      default:
        return 'info';
    }
  };

  // Get avatar based on notification type
  const getAvatarForType = (type: string): string => {
    const avatars = [
      'https://randomuser.me/api/portraits/men/32.jpg',
      'https://randomuser.me/api/portraits/women/44.jpg',
      'https://randomuser.me/api/portraits/men/22.jpg',
      'https://randomuser.me/api/portraits/women/65.jpg'
    ];
    
    return avatars[Math.floor(Math.random() * avatars.length)];
  };

  // Format time to relative time
  const formatTime = (timestamp: string): string => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMs = now.getTime() - notificationTime.getTime();
    const diffInSeconds = Math.floor(diffInMs / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    // For older notifications, show the actual date
    return notificationTime.toLocaleDateString();
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = startPolling();
      
      // Cleanup interval on unmount
      return () => {
        clearInterval(interval);
      };
    }
  }, [user]);

  // Update displayed notifications when displayLimit changes
  useEffect(() => {
    setDisplayedNotifications(notifications.slice(0, displayLimit));
    setHasMoreNotifications(notifications.length > displayLimit);
  }, [displayLimit, notifications]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchNotifications();
      }
      return () => {};
    }, [user])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAsRead = async (id: number) => {
    try {
      // Update locally first for immediate feedback
      const updatedNotifications = notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      );
      
      setNotifications(updatedNotifications);
      setDisplayedNotifications(updatedNotifications.slice(0, displayLimit));
      
      // Send update to server
      await axios.post(`${API_BASE_URL}/update_notification_status.php`, {
        notification_id: id,
        status: 'read'
      });
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      // Revert local change if server update fails
      const originalNotifications = notifications.map(n => 
        n.id === id ? { ...n, read: false } : n
      );
      
      setNotifications(originalNotifications);
      setDisplayedNotifications(originalNotifications.slice(0, displayLimit));
    }
  };

  const handleClearAll = async () => {
    try {
      if (user) {
        await axios.post(`${API_BASE_URL}/clear_notifications.php`, {
          user_id: user.id
        });
        setNotifications([]);
        setDisplayedNotifications([]);
        setClearAllModalVisible(false);
        Alert.alert('Success', 'All notifications cleared');
      }
    } catch (error: any) {
      console.error('Error clearing notifications:', error);
      setClearAllModalVisible(false);
      Alert.alert('Error', error.response?.data?.message || 'Failed to clear notifications');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Update locally first
      const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
      
      setNotifications(updatedNotifications);
      setDisplayedNotifications(updatedNotifications.slice(0, displayLimit));
      
      // Send update to server
      if (user) {
        await axios.post(`${API_BASE_URL}/mark_all_notifications_read.php`, {
          user_id: user.id
        });
        setMarkAllReadModalVisible(false);
      }
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      // Revert local changes if server update fails
      setMarkAllReadModalVisible(false);
      Alert.alert('Error', error.response?.data?.message || 'Failed to mark all as read');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <Check size={20} color="#10B981" />;
      case 'reminder':
        return <Clock size={20} color="#3B82F6" />;
      case 'alert':
        return <AlertTriangle size={20} color="#EF4444" />;
      default:
        return <Bell size={20} color="#6B7280" />;
    }
  };

  const getIconBackground = (type: string) => {
    switch (type) {
      case 'success':
        return "bg-green-100 dark:bg-green-900/20";
      case 'reminder':
        return "bg-blue-100 dark:bg-blue-900/20";
      case 'alert':
        return "bg-red-100 dark:bg-red-900/20";
      default:
        return "bg-gray-100 dark:bg-gray-800";
    }
  };

  // Confirmation Modal Component
  const ConfirmationModal = ({ visible, onClose, onConfirm, title, message }: any) => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-80">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-gray-900 dark:text-white">
              {title}
            </Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <X size={20} color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
          </View>
          
          <Text className="text-gray-600 dark:text-gray-300 mb-6">
            {message}
          </Text>
          
          <View className="flex-row justify-end space-x-3">
            <TouchableOpacity
              onPress={onClose}
              className="px-5 py-2 rounded-lg bg-gray-100 dark:bg-gray-700"
            >
              <Text className="text-gray-700 dark:text-gray-300">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              className="px-5 py-2 rounded-lg bg-[#8C2323]"
            >
              <Text className="text-white">Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Notification Item Skeleton
  const NotificationSkeleton = () => (
    <View className="flex-row items-start p-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
      <SkeletonLoader width={44} height={44} borderRadius={22} className="mr-4">
        <SkeletonPulse />
      </SkeletonLoader>
      
      <View className="flex-1">
        <View className="flex-row items-start justify-between mb-2">
          <SkeletonLoader width={120} height={20}>
            <SkeletonPulse />
          </SkeletonLoader>
          <SkeletonLoader width={16} height={16} borderRadius={8}>
            <SkeletonPulse />
          </SkeletonLoader>
        </View>
        
        <SkeletonLoader width="80%" height={16} className="mb-2">
          <SkeletonPulse />
        </SkeletonLoader>
        <SkeletonLoader width={60} height={14}>
          <SkeletonPulse />
        </SkeletonLoader>
      </View>
    </View>
  );

  // Header Skeleton
  const HeaderSkeleton = () => (
    <View className="pt-[50px] px-5 pb-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <SkeletonLoader width={40} height={40} borderRadius={20} className="mr-2">
            <SkeletonPulse />
          </SkeletonLoader>
          <SkeletonLoader width={120} height={28}>
            <SkeletonPulse />
          </SkeletonLoader>
        </View>
        <SkeletonLoader width={100} height={20}>
          <SkeletonPulse />
        </SkeletonLoader>
      </View>
      
      <View className="flex-row justify-between items-center">
        <SkeletonLoader width={80} height={16}>
          <SkeletonPulse />
        </SkeletonLoader>
        <SkeletonLoader width={60} height={16}>
          <SkeletonPulse />
        </SkeletonLoader>
      </View>
    </View>
  );

  // Load More Component
  const LoadMoreComponent = () => {
    if (!hasMoreNotifications) {
      return (
        <View className="py-4 items-center">
          <Text className="text-gray-500 dark:text-gray-400 text-sm">
            No more notifications
          </Text>
        </View>
      );
    }

    return (
      <View className="py-4 items-center">
        {loadingMore ? (
          <ActivityIndicator size="small" color="#8C2323" />
        ) : (
          <TouchableOpacity onPress={loadMoreNotifications}>
            <Text className="text-[#8C2323] font-medium">Load more</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900">
        {/* Header Skeleton */}
        <HeaderSkeleton />
        
        {/* Notifications List Skeleton */}
        <ScrollView className="mt-1">
          {[1, 2, 3, 4, 5].map((item) => (
            <NotificationSkeleton key={item} />
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      {/* Header */}
      <View className="pt-[50px] px-5 pb-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              className="p-2 -ml-2 mr-2"
            >
              <ChevronLeft size={24} color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">
              Notifications
            </Text>
          </View>
          {displayedNotifications.length > 0 && (
            <TouchableOpacity onPress={() => setMarkAllReadModalVisible(true)}>
              <Text className="text-[#8C2323] font-medium">Mark all as read</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {displayedNotifications.length > 0 && (
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-600 dark:text-gray-300">
              {displayedNotifications.filter(n => !n.read).length} unread
            </Text>
            <TouchableOpacity onPress={() => setClearAllModalVisible(true)}>
              <Text className="text-gray-500 dark:text-gray-400">Clear all</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
   
      {/* Notifications List */}
      <ScrollView
        ref={scrollViewRef}
        className="mt-1"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#8C2323']}
            tintColor={colorScheme === 'dark' ? '#8C2323' : '#8C2323'}
          />
        }
        onMomentumScrollEnd={() => {
          // Load more when reaching the end of the list
          loadMoreNotifications();
        }}
      >
        {displayedNotifications.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20 px-5">
            <View className="items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <Bell size={32} color="#9CA3AF" />
            </View>
            <Text className="text-gray-500 dark:text-gray-400 mt-4 text-lg font-medium text-center">
              No notifications yet
            </Text>
            <Text className="text-gray-400 dark:text-gray-500 mt-2 text-center">
              You're all caught up! Check back later for updates.
            </Text>
          </View>
        ) : (
          <>
            {displayedNotifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                className={`flex-row items-start p-5 border-b border-gray-100 dark:border-gray-800 ${
                  !notification.read ? 'bg-blue-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-900'
                }`}
                onPress={() => markAsRead(notification.id)}
              >
                <View className={`p-3 rounded-full mr-4 ${getIconBackground(notification.type)}`}>
                  {getIcon(notification.type)}
                </View>
                
                <View className="flex-1">
                  <View className="flex-row items-start justify-between">
                    <Text className="font-semibold dark:text-white text-base flex-1">
                      {notification.title}
                    </Text>
                    {!notification.read && (
                      <View className="w-2 h-2 rounded-full bg-[#8C2323] ml-2 mt-1" />
                    )}
                  </View>
                  
                  <Text className="mt-1 text-gray-600 dark:text-gray-300 text-sm">
                    {notification.message}
                  </Text>
                  
                  <Text className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                    {notification.time}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            
            <LoadMoreComponent />
          </>
        )}
      </ScrollView>

      {/* Back to Top Button */}
  {/* Back to Top Button */}
    {showBackToTop && (
      <View className="absolute bottom-0 left-0 right-0 items-center py-4 bg-transparent">
        <TouchableOpacity
          onPress={scrollToTop}
          className="w-12 h-12 rounded-full bg-[#8C2323] items-center justify-center shadow-lg"
          style={{ elevation: 5 }}
        >
          <ArrowUp size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    )}

      {/* Confirmation Modals */}
      <ConfirmationModal
        visible={clearAllModalVisible}
        onClose={() => setClearAllModalVisible(false)}
        onConfirm={handleClearAll}
        title="Clear All Notifications"
        message="Are you sure you want to clear all notifications? This action cannot be undone."
      />

      <ConfirmationModal
        visible={markAllReadModalVisible}
        onClose={() => setMarkAllReadModalVisible(false)}
        onConfirm={handleMarkAllAsRead}
        title="Mark All as Read"
        message="Are you sure you want to mark all notifications as read?"
      />
    </View>
  );
};

export default NotificationsScreen;