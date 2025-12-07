import { useAuth } from "@/contexts/AuthContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import { API_BASE_URL } from '@/constants/Config';
import axios from 'axios';
import { useRouter } from 'expo-router';
import {
  AlertTriangle,
  ArrowUp,
  Bell,
  BookOpen,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  Clock,
  Filter,
  Heart,
  Megaphone,
  User
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Modal, Platform, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Types based on your database schema
interface Announcement {
  id: number;
  title: string;
  description: string;
  category: 'general' | 'research' | 'clinical' | 'pharmacology' | 'cardiology' | 'event' | 'urgent';
  priority: 'low' | 'medium' | 'high';
  year_level: 'all' | '1' | '2' | '3' | '4';
  author: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

// Category icons mapping
const categoryIcons = {
  general: Megaphone,
  research: Heart,
  clinical: Heart,
  pharmacology: BookOpen,
  cardiology: Heart,
  event: Calendar,
  urgent: AlertTriangle
};

// Priority colors mapping - updated with maroon theme
const priorityColors = {
  low: 'bg-green-100',
  medium: 'bg-amber-100',
  high: 'bg-red-100'
};

// Priority text colors - updated with maroon theme
const priorityTextColors = {
  low: 'text-green-800',
  medium: 'text-amber-800',
  high: 'text-red-800'
};

// Priority border colors - updated with maroon theme
const priorityBorderColors = {
  low: 'border-green-500',
  medium: 'border-amber-500',
  high: 'border-red-700'
};

// Skeleton Loader Component
const SkeletonLoader = () => {
  return (
    <View className="p-4">
      {[1, 2, 3, 4 ].map((item) => (
        <View key={item} className="bg-white rounded-xl p-4 mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <View className="h-6 w-24 bg-gray-200 rounded-full"></View>
            <View className="h-6 w-16 bg-gray-200 rounded-full"></View>
          </View>
          <View className="h-6 w-3/4 bg-gray-200 rounded mb-2"></View>
          <View className="h-4 w-full bg-gray-200 rounded mb-1"></View>
          <View className="h-4 w-5/6 bg-gray-200 rounded mb-3"></View>
          <View className="flex-row justify-between items-center">
            <View className="h-4 w-20 bg-gray-200 rounded"></View>
            <View className="h-4 w-24 bg-gray-200 rounded"></View>
          </View>
        </View>
      ))}
    </View>
  );
};

// Lazy Loader Component
const LazyLoader = () => {
  return (
    <View className="p-4">
      {[1, 2].map((item) => (
        <View key={item} className="bg-white rounded-xl p-4 mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <View className="h-6 w-24 bg-gray-200 rounded-full"></View>
            <View className="h-6 w-16 bg-gray-200 rounded-full"></View>
          </View>
          <View className="h-6 w-3/4 bg-gray-200 rounded mb-2"></View>
          <View className="h-4 w-full bg-gray-200 rounded mb-1"></View>
          <View className="h-4 w-5/6 bg-gray-200 rounded mb-3"></View>
          <View className="flex-row justify-between items-center">
            <View className="h-4 w-20 bg-gray-200 rounded"></View>
            <View className="h-4 w-24 bg-gray-200 rounded"></View>
          </View>
        </View>
      ))}
    </View>
  );
};

const AnnouncementsScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  //Theme Changer 
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

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get the label for the selected priority
  const getSelectedPriorityLabel = () => {
    return availablePriorities.find(p => p.value === selectedPriority)?.label || 'All Priorities';
  };

  // Priority dropdown component
  const PriorityDropdown = () => {
    return (
      <Modal
        visible={showPriorityDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPriorityDropdown(false)}
      >
        <TouchableOpacity 
          className="flex-1 bg-black/50"
          activeOpacity={1}
          onPress={() => setShowPriorityDropdown(false)}
        >
          <View className="absolute top-20 right-4 w-48 bg-white rounded-lg shadow-lg overflow-hidden">
            {availablePriorities.map((priority) => (
              <TouchableOpacity
                key={priority.value}
                className={`flex-row items-center px-4 py-3 ${
                  selectedPriority === priority.value ? 'bg-maroon-100' : 'bg-white'
                }`}
                onPress={() => {
                  setSelectedPriority(priority.value);
                  setShowPriorityDropdown(false);
                }}
              >
                {selectedPriority === priority.value ? (
                  <Check size={16} color="#800000" />
                ) : (
                  <View className="w-4 h-4" />
                )}
                <Text className={`ml-2 ${selectedPriority === priority.value ? ' font-semibold' : 'text-gray-700'}`}>
                  {priority.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 pt-10">
        <View className="flex-row items-center px-4 py-4 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ChevronLeft size={24} color="#800000" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-maroon-800">Announcements</Text>
        </View>
        <SkeletonLoader />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-gray-50 pt-10">
        <View className="flex-row items-center px-4 py-4 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ChevronLeft size={24} color="#800000" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-maroon-800">Announcements</Text>
        </View>
        <View className="flex-1 justify-center items-center p-5">
          <AlertTriangle size={48} color="#800000" />
          <Text className="mt-4 text-maroon-700 text-center">{error}</Text>
          <TouchableOpacity 
            className="mt-4 px-6 py-3 bg-maroon-600 rounded-lg"
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

      <PriorityDropdown />

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
          <View className="flex-1 justify-center items-center py-20 px-5">
            <View className="bg-white rounded-2xl shadow-md p-8 items-center max-w-sm" style={{ backgroundColor: cardColor }}>
              <View className="w-20 h-20 bg-[#af1616]/10 rounded-full items-center justify-center mb-4">
                <Bell size={40} color="#af1616" />
              </View>
              <Text className="text-xl font-bold text-gray-800 text-center mb-2" style={{ color: textColor }}>
                No Announcements Found
              </Text>
              <Text className="text-gray-500 text-center text-sm leading-5" style={{ color: mutedColor }}>
                {selectedPriority !== 'all' 
                  ? `No ${selectedPriority} priority announcements available. Try adjusting your filter settings.`
                  : 'Check back later for new announcements and updates from your school.'
                }
              </Text>
              {selectedPriority !== 'all' && (
                <TouchableOpacity 
                  className="mt-6 flex-row items-center bg-[#af1616] rounded-lg px-5 py-3"
                  onPress={() => setSelectedPriority('all')}
                >
                  <Filter size={16} color="#ffffff" />
                  <Text className="text-white font-semibold ml-2">Clear Filter</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          <View className="p-4">
            {displayedAnnouncements.map(announcement => {
              const IconComponent = categoryIcons[announcement.category];
              const isExpanded = expandedAnnouncements.includes(announcement.id);
              const priorityColor = priorityColors[announcement.priority];
              const priorityTextColor = priorityTextColors[announcement.priority];
              const priorityBorderColor = priorityBorderColors[announcement.priority];
              
              return (
                <View 
                  key={announcement.id} 
                  className={`bg-white rounded-sm shadow-sm p-4 mb-4 border-l-4 ${priorityBorderColor}`}
                  style={{ backgroundColor: cardColor }}
                >
                  <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-row items-center">
                    
                    </View>
                    
                    <View className={`rounded-full px-3 py-1 ${priorityColor}`}>
                      <Text className={`text-xs font-medium ${priorityTextColor}`}>
                        {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}
                      </Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity onPress={() => toggleExpand(announcement.id)}>
                    <Text className="text-lg font-semibold text-gray-900 mb-2" style={{ color: textColor }}>{announcement.title}</Text>
                    
                    {(isExpanded || announcement.description.length < 150) ? (
                      <Text className="text-gray-600 mb-3" style={{ color: textColor }}>{announcement.description}</Text>
                    ) : (
                      <Text className="text-gray-600 mb-3" style={{ color: textColor }}>
                        {announcement.description.substring(0, 150)}...
                        <Text className="text-maroon-600" > Read more</Text>
                      </Text>
                    )}
                    
                    <View className="flex-row justify-between items-center mt-2">
                      <View className="flex-row items-center">
                        <User size={14} color="#6b7280" />
                        <Text className="ml-1 text-gray-500 text-sm" style={{ color: textColor }}>{announcement.author}</Text>
                      </View>
                      
                      <View className="flex-row items-center">
                        <Clock size={14} color="#6b7280" />
                        <Text className="ml-1 text-gray-500 text-sm" style={{ color: textColor }}>{formatDate(announcement.created_at)}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
            
            {loadingMore && <LazyLoader />}
            
            {displayedAnnouncements.length < filteredAnnouncements.length && !loadingMore && (
              <TouchableOpacity 
                className="bg-maroon-600 rounded-lg p-4 items-center mt-4"
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
            className="w-12 h-12 rounded-full bg-[#800000] items-center justify-center shadow-lg"
            style={{ elevation: 5 }}
          >
            <ArrowUp size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
      {/* Back to Top Button */}
      {showBackToTop && (
        <View className="absolute bottom-4 right-4">
          <TouchableOpacity
            onPress={scrollToTop}
            className="w-12 h-12 rounded-full bg-[#800000] items-center justify-center shadow-lg"
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