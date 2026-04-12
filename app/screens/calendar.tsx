import React from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import { API_BASE_URL } from '@/constants/Config';
import axios from "axios";
import { useRouter } from "expo-router";
import { ChevronDown, ChevronLeft, ChevronRight, Search, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Dimensions, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarEvent, ApiEvent, ViewMode, NavigationDirection } from '@/@types/screens/calendar';
import { MAROON_THEME, months, shortMonths, days } from '@/components/calendar/constants';
import { getWeekRange, formatDateRange } from '@/components/calendar/utils';
import { CalendarSkeleton } from '@/components/calendar/CalendarSkeleton';
import { MonthView } from '@/components/calendar/MonthView';
import { WeekView } from '@/components/calendar/WeekView';
import { DayView } from '@/components/calendar/DayView';
import { EventModal } from '@/components/calendar/EventModal';

export default function Calendar() {
  // Theme Change 
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardColor = useThemeColor({}, 'card');
  const mutedColor = useThemeColor({}, 'muted');
  const loadColor = useThemeColor({}, 'loaderCard');
  const gridBorderColor = theme === 'light' ? '#D1D5DB' : mutedColor;
  
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

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [showViewDropdown, setShowViewDropdown] = useState<boolean>(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const { user } = useAuth();
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width;

  // Fetch events from API
  const fetchEvents = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        `${API_BASE_URL}/api/get_calendar_events.php?user_id=${user.id}`
      );
      
      // Parse the response data correctly
      let eventsData = [];
      if (typeof response.data === 'string') {
        // If the response is a string, try to parse it as JSON
        try {
          // Remove the "Connected successfully!" prefix if present
          const jsonStr = response.data.replace('Connected successfully!', '');
          eventsData = JSON.parse(jsonStr);
        } catch (parseError) {
          console.error("Error parsing response:", parseError);
          eventsData = [];
        }
      } else if (Array.isArray(response.data)) {
        eventsData = response.data;
      }
      
      // Transform API response to match our expected event format
      const transformedEvents: CalendarEvent[] = eventsData.map((event: ApiEvent) => {
        // Create proper date objects with Philippine timezone consideration
        const eventDate = new Date(event.date);
        const startTime = event.start_time.split(':');
        const endTime = event.end_time.split(':');
        
        const startDate = new Date(eventDate);
        startDate.setHours(parseInt(startTime[0]), parseInt(startTime[1]), 0, 0);
        
        const endDate = new Date(eventDate);
        endDate.setHours(parseInt(endTime[0]), parseInt(endTime[1]), 0, 0);
        
        return {
          id: event.id,
          title: event.title,
          start: startDate,
          end: endDate,
          color: event.color || getEventColor(event.year_level),
          description: event.description || "No description available",
          course: event.year_level || "GENERAL",
          location: "Location not specified",
          year_level: event.year_level || "All Years"
        };
      });
      
      setEvents(transformedEvents);
    } catch (err) {
      console.error("Error fetching calendar events:", err);
      setError("Failed to load calendar events");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user?.id, user?.year_level_id]);

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  // Helper function to assign colors based on year level (fallback)
  const getEventColor = (yearLevel?: string): string => {
    const colorMap = {
      'Year 1': MAROON_THEME.primary,      // maroon
      'Year 2': MAROON_THEME.light,        // light maroon
      'Year 3': MAROON_THEME.accent,       // another maroon shade
      'Year 4': '#6366F1',                 // indigo
      'All Years': '#8B5CF6',              // purple
      'ORIENTATION': MAROON_THEME.primary, // maroon
      'STAFF': '#10B981',                  // green-500
      'EXAM': '#8B5CF6',                   // purple-500
      'LECTURE': MAROON_THEME.accent,      // maroon accent
      'STUDY': '#EF4444',                  // red-500
      'DEADLINE': '#6366F1',               // indigo-500
      'CAREER': '#14B8A6',                 // teal-500
    };
    
    return colorMap[yearLevel as keyof typeof colorMap] || '#6B7280'; // default gray
  };

  // Filter events based on search query
  const filteredEvents = searchQuery 
    ? events.filter(event => 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.course && event.course.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (event.location && event.location.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : events;

  const navigate = (direction: NavigationDirection): void => {
    const newDate = new Date(currentDate);
    
    if (viewMode === "month") {
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else if (direction === "next") {
        newDate.setMonth(newDate.getMonth() + 1);
      }
    } else if (viewMode === "week") {
      if (direction === "prev") {
        newDate.setDate(newDate.getDate() - 7);
      } else if (direction === "next") {
        newDate.setDate(newDate.getDate() + 7);
      }
    } else if (viewMode === "day") {
      if (direction === "prev") {
        newDate.setDate(newDate.getDate() - 1);
      } else if (direction === "next") {
        newDate.setDate(newDate.getDate() + 1);
      }
    }
    
    setCurrentDate(newDate);
  };

  const goToToday = (): void => {
    setCurrentDate(new Date());
  };

  // Render loading state with skeleton loader
  if (loading) {
    return <CalendarSkeleton backgroundColor={backgroundColor} loadColor={loadColor} cardColor={cardColor} gridBorderColor={gridBorderColor} viewMode={viewMode} />;
  }

  // Render error state
  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-8" style={{backgroundColor}}>
        <Text className="text-lg mb-4 text-center" style={{color: '#EF4444'}}>{error}</Text>
        <TouchableOpacity 
          className="px-4 py-2 rounded-md"
          style={{backgroundColor: '#3B82F6'}}
          onPress={() => fetchEvents()}
        >
          <Text className="text-white">Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const weekRange = getWeekRange(currentDate);

  return (
    <View className="flex-1" style={{backgroundColor}}>
      {/* Header */}
      <View className="p-3 pt-25 mt-10 shadow-sm" style={{backgroundColor, borderBottomColor: gridBorderColor, borderBottomWidth: 1}}>
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="mr-3 p-1"
          >
            <ChevronLeft size={24} color={textColor} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold" style={{color: textColor}}>Events Calendar</Text>
        </View>
      </View>
      
      {/* Search Bar */}
      {showSearch && (
        <View className="flex-row items-center px-4 py-2" style={{backgroundColor, borderBottomColor: gridBorderColor, borderBottomWidth: 1}}>
          <Search size={20} color={mutedColor} className="mr-2" />
          <TextInput
            className="flex-1 py-2"
            style={{color: textColor}}
            placeholder="Search events..."
            placeholderTextColor={mutedColor}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus={true}
          />
          <TouchableOpacity 
            onPress={() => {
              setShowSearch(false);
              setSearchQuery(""); // Clear search input when closed
            }} 
            className="ml-2"
          >
            <X size={20} color={mutedColor} />
          </TouchableOpacity>
        </View>
      )}
      
      {/* Navigation */}
      <View className="flex-row items-center justify-between p-4" style={{backgroundColor, borderBottomColor: gridBorderColor, borderBottomWidth: 1}}>
        <TouchableOpacity 
          onPress={() => navigate("prev")}
          className="p-2 rounded-full"
          style={{backgroundColor: cardColor}}
        >
          <ChevronLeft size={20} color={textColor} />
        </TouchableOpacity>
        
        <View className="flex-row items-center">
          <View className="relative">
            <TouchableOpacity 
              className="flex-row items-center px-3 py-1.5 rounded-md mr-2"
              style={{backgroundColor: cardColor}}
              onPress={() => setShowViewDropdown(!showViewDropdown)}
            >
              <Text className="text-sm font-medium mr-1" style={{color: textColor}}>
                {viewMode === "month" ? "Month" : viewMode === "week" ? "Week" : "Day"}
              </Text>
              <ChevronDown size={16} color={textColor} />
            </TouchableOpacity>
            
            {showViewDropdown && (
              <View className="absolute top-full left-0 mt-1 rounded-md shadow-lg z-10 min-w-full" style={{backgroundColor}}>
                <TouchableOpacity 
                  className="px-4 py-2"
                  style={{borderBottomColor: mutedColor, borderBottomWidth: 1}}
                  onPress={() => {
                    setViewMode("month");
                    setShowViewDropdown(false);
                  }}
                >
                  <Text style={{color: textColor}}>Month</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="px-4 py-2"
                  style={{borderBottomColor: mutedColor, borderBottomWidth: 1}}
                  onPress={() => {
                    setViewMode("week");
                    setShowViewDropdown(false);
                  }}
                >
                  <Text style={{color: textColor}}>Week</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="px-4 py-2"
                  onPress={() => {
                    setViewMode("day");
                    setShowViewDropdown(false);
                  }}
                >
                  <Text style={{color: textColor}}>Day</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          <TouchableOpacity 
            onPress={goToToday}
            className="px-3 py-1.5 rounded-md bg-[#be2e2e] "
          >
            <Text className="text-white text-sm font-medium">Today</Text>
          </TouchableOpacity>
        </View>
        
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => setShowSearch(true)}
            className="p-2 rounded-full mr-2"
            style={{backgroundColor: cardColor}}
          >
            <Search size={20} color={textColor} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => navigate("next")}
            className="p-2 rounded-full"
            style={{backgroundColor: cardColor}}
          >
            <ChevronRight size={20} color={textColor} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View className="flex-row justify-center py-3" style={{backgroundColor, borderBottomColor: gridBorderColor, borderBottomWidth: 1}}>
        <Text className="text-lg font-semibold" style={{color: textColor}}>
          {viewMode === "month" && `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
          {viewMode === "week" && `Week of ${formatDateRange(weekRange.start, weekRange.end, months)}`}
          {viewMode === "day" && currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </Text>
      </View>
      
      {/* Calendar Content */}
      <View className="flex-1">
        {viewMode === "month" && (
          <MonthView
            currentDate={currentDate}
            filteredEvents={filteredEvents}
            setCurrentDate={setCurrentDate}
            setViewMode={setViewMode}
            setSelectedEvent={setSelectedEvent}
            setShowEventModal={setShowEventModal}
            gridBorderColor={gridBorderColor}
            backgroundColor={backgroundColor}
            textColor={textColor}
            mutedColor={mutedColor}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        )}
        {viewMode === "week" && (
          <WeekView
            currentDate={currentDate}
            filteredEvents={filteredEvents}
            setSelectedEvent={setSelectedEvent}
            setShowEventModal={setShowEventModal}
            gridBorderColor={gridBorderColor}
            cardColor={cardColor}
            textColor={textColor}
            mutedColor={mutedColor}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        )}
        {viewMode === "day" && (
          <DayView
            currentDate={currentDate}
            filteredEvents={filteredEvents}
            setSelectedEvent={setSelectedEvent}
            setShowEventModal={setShowEventModal}
            gridBorderColor={gridBorderColor}
            textColor={textColor}
            mutedColor={mutedColor}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        )}
      </View>
      
      {/* Event Details Modal */}
      <EventModal
        selectedEvent={selectedEvent}
        showEventModal={showEventModal}
        setShowEventModal={setShowEventModal}
        backgroundColor={backgroundColor}
        mutedColor={mutedColor}
        textColor={textColor}
      />
    </View>
  );
}