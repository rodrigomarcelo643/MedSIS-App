import { useAuth } from "@/contexts/AuthContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import { API_BASE_URL } from '@/constants/Config';
import axios from 'axios';
import { useRouter } from 'expo-router';
import {
  AlertTriangle,
  ArrowUp,
  ChevronDown,
  ChevronLeft,
  Filter
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Modal, Platform, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Announcement } from '@/@types/screens/announcements';
import { AnnouncementItem } from '@/components/announcements/AnnouncementItem';
import { SkeletonLoader, LazyLoader } from '@/components/announcements/AnnouncementLoaders';
import { PriorityDropdown } from '@/components/announcements/PriorityDropdown';
import { EmptyState } from '@/components/announcements/EmptyState';

const AnnouncementsScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  //Theme Changer 
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardColor = useThemeColor({}, 'card');
  const mutedColor = useThemeColor({}, 'muted');
  const loadColor = useThemeColor({}, 'loaderCard');
  
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

  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<Announcement[]>([]);
  const [displayedAnnouncements, setDisplayedAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [expandedAnnouncements, setExpandedAnnouncements] = useState<number[]>([]);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [scrollViewRef, setScrollViewRef] = useState<ScrollView | null>(null);
  const itemsPerPage = 10;

  const availablePriorities = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' }
  ];

  // Fetch announcements from API using GET request
  const fetchAnnouncements = async () => {
    if (!user) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      // Use GET request with query parameters
      const response = await axios.get(`${API_BASE_URL}/api/get_student_announcements.php`, {
        params: {
          user_id: user.id,
          year_level: user.year_level_id || 'all'
        }
      });

      console.log('API Response:', response.data);

      if (response.data && response.data.success) {
        setAnnouncements(response.data.announcements || []);
      } else {
        setError(response.data?.message || 'Failed to fetch announcements');
      }
    } catch (err: any) {
      console.error('Error fetching announcements:', err);
      
      // More specific error handling
      if (err.response?.status === 400) {
        setError('Invalid request. Please check if the API endpoint is correct.');
      } else if (err.response?.status === 401) {
        // Unauthorized, force logout
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please log in again.',
          [{ text: 'OK', onPress: () => logout() }]
        );
      } else if (err.code === 'NETWORK_ERROR') {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(err.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setPage(1); // Reset to first page
    }
  };

  // Filter announcements based on selected priority
  useEffect(() => {
    let filtered = [...announcements];
    
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(ann => ann.priority === selectedPriority);
    }
    
    setFilteredAnnouncements(filtered);
    setPage(1); // Reset to first page when filters change
  }, [announcements, selectedPriority]);

  // Handle lazy loading
  useEffect(() => {
    const startIndex = 0;
    const endIndex = page * itemsPerPage;
    const newDisplayedAnnouncements = filteredAnnouncements.slice(0, endIndex);
    setDisplayedAnnouncements(newDisplayedAnnouncements);
  }, [filteredAnnouncements, page]);

  // Load announcements on component mount
  useEffect(() => {
    fetchAnnouncements();
  }, [user]);

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchAnnouncements();
  };

  // Load more items for lazy loading
  const loadMore = () => {
    if (displayedAnnouncements.length < filteredAnnouncements.length && !loadingMore) {
      setLoadingMore(true);
      setTimeout(() => {
        setPage(page + 1);
        setLoadingMore(false);
      }, 500);
    }
  };

  // Scroll to top function
  const scrollToTop = () => {
    if (scrollViewRef) {
      scrollViewRef.scrollTo({ y: 0, animated: true });
    }
  };

  // Handle scroll events
  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    
    // Show back to top button when scrolled down 300 pixels
    setShowBackToTop(contentOffset.y > 300);
    
    // Check if we've scrolled to the bottom for lazy loading
    const paddingToBottom = 20;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
      loadMore();
    }
  };

  // Toggle announcement expansion
  const toggleExpand = (id: number) => {
    if (expandedAnnouncements.includes(id)) {
      setExpandedAnnouncements(expandedAnnouncements.filter(item => item !== id));
    } else {
      setExpandedAnnouncements([...expandedAnnouncements, id]);
    }
  };

  // Get the label for the selected priority
  const getSelectedPriorityLabel = () => {
    return availablePriorities.find(p => p.value === selectedPriority)?.label || 'All Priorities';
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 pt-10" style={{ backgroundColor }}>
        <View className="flex-row items-center px-4 py-4 bg-white border-b border-gray-200" style={{ backgroundColor: cardColor }}>
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ChevronLeft size={24} color={textColor} />
          </TouchableOpacity>
          <Text className="text-xl font-bold" style={{ color: textColor }}>Announcements</Text>
        </View>
        <SkeletonLoader cardColor={cardColor} loadColor={loadColor} />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-gray-50 pt-10" style={{ backgroundColor }}>
        <View className="flex-row items-center px-4 py-4 bg-white border-b border-gray-200" style={{ backgroundColor: cardColor }}>
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ChevronLeft size={24} color={textColor} />
          </TouchableOpacity>
          <Text className="text-xl font-bold" style={{ color: textColor }}>Announcements</Text>
        </View>
        <View className="flex-1 justify-center items-center p-5">
          <AlertTriangle size={48} color="#af1616" />
          <Text className="mt-4 text-center" style={{ color: textColor }}>{error}</Text>
          <TouchableOpacity 
            className="mt-4 px-6 py-3 bg-[#af1616] rounded-lg"
            onPress={fetchAnnouncements}
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 pt-10" style={{ backgroundColor }}>
      <View style={{ backgroundColor: cardColor }} className="flex-row items-center px-4 py-4 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ChevronLeft size={24} color={textColor} />
        </TouchableOpacity>
        <Text className="text-xl font-bold" style={{color: textColor }} >Announcements</Text>
        <View className="flex-1"></View>
        <TouchableOpacity 
          className="flex-row items-center bg-maroon-100 rounded-full px-4 py-2"
          onPress={() => setShowPriorityDropdown(true)}
        >
          <Filter size={16} color={textColor} />
          <Text className="mr-1  text-sm font-medium" style={{ color: textColor }}>
            {getSelectedPriorityLabel()}
          </Text>
          <ChevronDown size={16} color={textColor} />
        </TouchableOpacity>
      </View>

      <PriorityDropdown
        visible={showPriorityDropdown}
        onClose={() => setShowPriorityDropdown(false)}
        options={availablePriorities}
        selectedPriority={selectedPriority}
        onSelect={setSelectedPriority}
      />

      <ScrollView
        ref={(ref) => {
          setScrollViewRef(ref);
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        className="flex-1"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ 
          paddingBottom: hasThreeButtonNav ? insets.bottom + 16 : isGestureNav ? 24 : 16 
        }}
      >
        {displayedAnnouncements.length === 0 ? (
          <EmptyState
            selectedPriority={selectedPriority}
            onClearFilter={() => setSelectedPriority('all')}
            cardColor={cardColor}
            textColor={textColor}
            mutedColor={mutedColor}
          />
        ) : (
          <View className="p-4">
            {displayedAnnouncements.map(announcement => (
              <AnnouncementItem
                key={announcement.id}
                announcement={announcement}
                isExpanded={expandedAnnouncements.includes(announcement.id)}
                onToggleExpand={toggleExpand}
                cardColor={cardColor}
                textColor={textColor}
              />
            ))}
            
            {loadingMore && <LazyLoader cardColor={cardColor} loadColor={loadColor} />}
            
            {displayedAnnouncements.length < filteredAnnouncements.length && !loadingMore && (
              <TouchableOpacity 
                className="bg-[#af1616] rounded-lg p-4 items-center mt-4"
                onPress={loadMore}
              >
                <Text className="text-white font-semibold">Load More</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Back to Top Button */}
      {showBackToTop && (
        <View className="absolute bottom-4 right-4">
          <TouchableOpacity
            onPress={scrollToTop}
            className="w-12 h-12 rounded-full bg-[#af1616] items-center justify-center shadow-lg"
            style={{ elevation: 5 }}
          >
            <ArrowUp size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default AnnouncementsScreen;