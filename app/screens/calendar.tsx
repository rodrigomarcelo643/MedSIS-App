import React from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import { API_BASE_URL } from '@/constants/Config';
import axios from "axios";
import { useRouter } from "expo-router";
import { Calendar as CalendarIcon, ChevronDown, ChevronLeft, ChevronRight, Search, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Dimensions, Modal, Platform, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarEvent, ApiEvent, ViewMode, NavigationDirection, WeekRange } from '@/@types/screens/calendar';


// Define the maroon color theme
const MAROON_THEME = {
  primary: '#be2e2e',      // Dark maroon
  light: '#afff',          // Light maroon (as requested)
  accent: '#a52a2a',       // Another shade of maroon
  background: '#fff5f5',   // Very light maroon for backgrounds
};

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

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const shortMonths = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

  const getWeekRange = (date: Date): WeekRange => {
    const day = date.getDay();
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - day);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return {
      start: startOfWeek,
      end: endOfWeek,
      dates: Array.from({ length: 7 }).map((_, i) => {
        const dayDate = new Date(startOfWeek);
        dayDate.setDate(startOfWeek.getDate() + i);
        return dayDate;
      })
    };
  };

  const formatDateRange = (start: Date, end: Date): string => {
    if (start.getMonth() === end.getMonth()) {
      return `${months[start.getMonth()]} ${start.getDate()} - ${end.getDate()}`;
    } else {
      return `${months[start.getMonth()]} ${start.getDate()} - ${months[end.getMonth()]} ${end.getDate()}`;
    }
  };

  // Skeleton loader components
  const SkeletonLoader = () => {
    return (
      <View className="flex-1 p-4 mt-6" style={{backgroundColor}}>
        {/* Header skeleton */}
        <View className="h-12 rounded-md mb-4 animate-pulse" style={{backgroundColor: loadColor}}></View>
        
        {/* Navigation skeleton */}
        <View className="flex-row justify-between items-center mb-4">
          <View className="h-10 w-10 rounded-full animate-pulse" style={{backgroundColor: loadColor}}></View>
          <View className="flex-row">
            <View className="h-10 w-24 rounded-md mr-2 animate-pulse" style={{backgroundColor: loadColor}}></View>
            <View className="h-10 w-20 rounded-md animate-pulse" style={{backgroundColor: loadColor}}></View>
          </View>
          <View className="h-10 w-10 rounded-full animate-pulse" style={{backgroundColor: loadColor}}></View>
        </View>
        
        {/* Calendar grid skeleton */}
        {viewMode === "month" && (
          <View className="flex-1">
            {/* Weekday headers skeleton */}
            <View className="flex-row mb-2">
              {days.map((_, i) => (
                <View key={i} className="flex-1 items-center">
                  <View className="h-6 w-10 rounded-md animate-pulse" style={{backgroundColor: loadColor}}></View>
                </View>
              ))}
            </View>
            
            {/* Calendar days skeleton */}
            {Array.from({ length: 6 }).map((_, rowIndex) => (
              <View key={rowIndex} className="flex-row mb-1 mt-2">
                {Array.from({ length: 4 }).map((_, colIndex) => (
                  <View key={colIndex} className="flex-1 aspect-square p-1">
                    <View className="flex-1 rounded-md animate-pulse" style={{backgroundColor: loadColor}}></View>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
        
        {viewMode === "week" && (
          <View className="flex-1">
            {/* Week header skeleton */}
            <View className="flex-row mb-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <View key={i} className="flex-1 items-center">
                  <View className="h-8 w-8 rounded-full mb-1 animate-pulse" style={{backgroundColor: loadColor}}></View>
                  <View className="h-4 w-12 rounded-md animate-pulse" style={{backgroundColor: loadColor}}></View>
                </View>
              ))}
            </View>
            
            {/* Time slots skeleton */}
            {Array.from({ length: 24 }).map((_, hourIndex) => (
              <View key={hourIndex} className="flex-row h-16 mb-2">
                <View className="w-14 items-end pr-2">
                  <View className="h-4 w-10 rounded-md animate-pulse" style={{backgroundColor: loadColor}}></View>
                </View>
                <View className="flex-1 flex-row">
                  {Array.from({ length: 7 }).map((_, dayIndex) => (
                    <View key={dayIndex} className="flex-1 mx-0.5" style={{borderColor: gridBorderColor, borderWidth: 1}}>
                      <View className="h-12 rounded-sm animate-pulse" style={{backgroundColor: cardColor}}></View>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
        
        {viewMode === "day" && (
          <View className="flex-1">
            {/* Day header skeleton */}
            <View className="items-center py-4 mb-4">
              <View className="h-6 w-48 rounded-md mb-2 animate-pulse" style={{backgroundColor: loadColor}}></View>
              <View className="h-4 w-32 rounded-md animate-pulse" style={{backgroundColor: loadColor}}></View>
            </View>
            
            {/* Events skeleton */}
            {Array.from({ length: 3 }).map((_, i) => (
              <View key={i} className="p-4 rounded-xl mb-4 animate-pulse" style={{backgroundColor: cardColor}}>
                <View className="flex-row justify-between items-start mb-3">
                  <View className="h-5 w-32 rounded-md" style={{backgroundColor: loadColor}}></View>
                  <View className="h-6 w-16 rounded-md" style={{backgroundColor: loadColor}}></View>
                </View>
                <View className="flex-row items-center mb-2">
                  <View className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: loadColor}}></View>
                  <View className="h-4 w-40 rounded-md" style={{backgroundColor: loadColor}}></View>
                </View>
                <View className="h-4 w-full rounded-md mt-2" style={{backgroundColor: loadColor}}></View>
                <View className="h-4 w-3/4 rounded-md mt-1" style={{backgroundColor: loadColor}}></View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Create day cells
    let daysArray = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      daysArray.push(
        <View 
          key={`empty-${i}`} 
          className="h-24 flex-1" 
          style={{
            borderBottomColor: gridBorderColor,
            borderRightColor: gridBorderColor,
            borderBottomWidth: 1,
            borderRightWidth: 1
          }} 
        />
      );
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = new Date(year, month, day);
      const isToday = currentDay.toDateString() === new Date().toDateString();
      const dayEvents = filteredEvents.filter(event => 
        event.start.getDate() === day && 
        event.start.getMonth() === month && 
        event.start.getFullYear() === year
      ).sort((a, b) => a.start.getTime() - b.start.getTime());
      
      daysArray.push(
        <View 
          key={`day-${day}`} 
          className="flex-1"
          style={{
            borderBottomColor: gridBorderColor,
            borderRightColor: gridBorderColor,
            borderBottomWidth: 1,
            borderRightWidth: 1,
            backgroundColor: isToday ? '#3B82F620' : 'transparent'
          }}
        >
          <View className="h-24 p-1">
            <TouchableOpacity 
              onPress={() => {
                setCurrentDate(new Date(year, month, day));
                setViewMode("day");
              }}
              className="flex-row items-start justify-between"
            >
              <Text 
                className="text-sm w-6 h-6 text-center rounded-full flex items-center justify-center font-bold"
                style={{
                  backgroundColor: isToday ? '#be2e2e' : 'transparent',
                  color: isToday ? 'white' : textColor
                }}
              >
                {day}
              </Text>
            </TouchableOpacity>
            <View className="mt-1">
              {dayEvents.map(event => (
                <TouchableOpacity
                  key={event.id}
                  className="flex-row items-center mb-0.5"
                  onPress={(e) => {
                    e.stopPropagation();
                    setSelectedEvent(event);
                    setShowEventModal(true);
                  }}
                >
                  <View className="w-1.5 h-1.5 rounded-full mr-1" style={{backgroundColor: event.color}} />
                  <Text className="text-[10px]" style={{color: mutedColor}} numberOfLines={1}>
                    {event.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      );
    }
    
    // Calculate rows needed
    const totalCells = daysArray.length;
    const rowsNeeded = Math.ceil(totalCells / 7);
    
    // Fill remaining cells to complete the last row (if needed)
    const remainingCells = rowsNeeded * 7 - totalCells;
    for (let i = 0; i < remainingCells; i++) {
      daysArray.push(
        <View 
          key={`remaining-${i}`} 
          className="h-24 flex-1" 
          style={{
            borderBottomColor: gridBorderColor,
            borderRightColor: gridBorderColor,
            borderBottomWidth: 1,
            borderRightWidth: 1
          }} 
        />
      );
    }
    
    // Create rows with exactly 7 cells each
    const rows = [];
    for (let i = 0; i < rowsNeeded; i++) {
      const rowCells = daysArray.slice(i * 7, (i + 1) * 7);
      rows.push(
        <View key={`row-${i}`} className="flex-row">
          {rowCells}
        </View>
      );
    }
    
    return (
      <View className="flex-1">
        {/* Weekday headers */}
        <View className="flex-row mb-1" style={{backgroundColor, borderBottomColor: gridBorderColor, borderBottomWidth: 1}}>
          {days.map(day => (
            <View key={day} className="flex-1 items-center py-2">
              <Text className="font-semibold text-xs" style={{color: mutedColor}}>
                {day}
              </Text>
            </View>
          ))}
        </View>
        
        {/* Calendar grid */}
        <ScrollView 
          className="flex-1"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[MAROON_THEME.primary]}
              tintColor={MAROON_THEME.primary}
            />
          }
        >
          {rows}
        </ScrollView>
      </View>
    );
  };

  const renderWeekView = () => {
    const { dates } = getWeekRange(currentDate);
    
    return (
      <View className="flex-1">
        <View className="flex-row border-b border-gray-200">
          {dates.map((date, i) => {
            const isToday = date.toDateString() === new Date().toDateString();
            const dayEvents = filteredEvents.filter(event => 
              event.start.toDateString() === date.toDateString()
            );
            
            return (
              <View key={`weekday-${i}`} className="flex-1 items-center py-2" style={{borderRightColor: gridBorderColor, borderRightWidth: i < 6 ? 1 : 0}}>
                <Text className="text-xs" style={{color: mutedColor}}>{days[i].substring(0, 1)}</Text>
                <View 
                  className="w-8 h-8 rounded-full items-center justify-center mt-1"
                  style={{backgroundColor: isToday ? '#3B82F6' : cardColor}}
                >
                  <Text style={{color: isToday ? 'white' : textColor}}>
                    {date.getDate()}
                  </Text>
                </View>
                {dayEvents.length > 0 && (
                  <View className="mt-1">
                    <Text className="text-xs" style={{color: '#3B82F6'}}>{dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
        
        <ScrollView 
          className="flex-1"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[MAROON_THEME.primary]}
              tintColor={MAROON_THEME.primary}
            />
          }
        >
          {Array.from({ length: 24 }).map((_, hourIndex) => {
            const hour = hourIndex;
            const time = `${hour % 12 === 0 ? 12 : hour % 12} ${hour >= 12 ? 'PM' : 'AM'}`;
            
            // Highlight 7 AM to 7 PM time slots
            const isWorkingHours = hour >= 7 && hour <= 19;
            
            return (
              <View 
                key={`hour-${hour}`} 
                className="flex-row h-16"
                style={{
                  borderBottomColor: gridBorderColor,
                  borderBottomWidth: 1,
                  backgroundColor: isWorkingHours ? '#3B82F610' : 'transparent'
                }}
              >
                <View className="w-14 items-end pr-2 pt-1">
                  <Text 
                    className="text-xs"
                    style={{
                      color: hour === 9 || hour === 12 || hour === 17 ? '#1E40AF' : mutedColor,
                      fontWeight: hour === 9 || hour === 12 || hour === 17 ? 'bold' : 'normal'
                    }}
                  >
                    {time}
                  </Text>
                </View>
                <View className="flex-1 flex-row" style={{borderLeftColor: gridBorderColor, borderLeftWidth: 1}}>
                  {dates.map((date, i) => {
                    const dayEvents = filteredEvents.filter(event => {
                      const eventStart = new Date(event.start);
                      const eventEnd = new Date(event.end);
                      const eventStartHour = eventStart.getHours();
                      const eventEndHour = eventEnd.getHours();
                      const eventEndMinutes = eventEnd.getMinutes();
                      
                      return (
                        eventStart.toDateString() === date.toDateString() &&
                        hour >= eventStartHour && 
                        hour <= eventEndHour
                      );
                    }).sort((a, b) => a.start.getTime() - b.start.getTime());
                    
                    return (
                      <View key={`cell-${hour}-${i}`} className="flex-1" style={{borderRightColor: gridBorderColor, borderRightWidth: i < 6 ? 1 : 0}}>
                        {dayEvents.map(event => (
                          <TouchableOpacity
                            key={event.id}
                            className="rounded p-1 m-0.5"
                            style={{backgroundColor: event.color}}
                            onPress={() => {
                              setSelectedEvent(event);
                              setShowEventModal(true);
                            }}
                          >
                            <Text className="text-white text-xs font-medium" numberOfLines={1}>
                              {event.title}
                            </Text>
                            <Text className="text-white text-[10px] opacity-90">
                              {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderDayView = () => {
    const dayEvents = filteredEvents.filter(event => 
      event.start.toDateString() === currentDate.toDateString()
    ).sort((a, b) => a.start.getTime() - b.start.getTime());
    
    return (
      <View className="flex-1">
        <View className="items-center py-4" style={{borderBottomColor: gridBorderColor, borderBottomWidth: 1}}>
          <Text className="text-xl font-bold" style={{color: textColor}}>
            {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </Text>
          <Text className="mt-1" style={{color: mutedColor}}>
            {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''} scheduled
          </Text>
        </View>
        
        {dayEvents.length > 0 ? (
          <ScrollView 
            className="flex-1"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[MAROON_THEME.primary]}
                tintColor={MAROON_THEME.primary}
              />
            }
          >
            {Array.from({ length: 24 }).map((_, hourIndex) => {
              const hour = hourIndex;
              const time = `${hour % 12 === 0 ? 12 : hour % 12} ${hour >= 12 ? 'PM' : 'AM'}`;
              
              // Highlight 7 AM to 7 PM time slots
              const isWorkingHours = hour >= 7 && hour <= 19;
              
              // Get events for this hour
              const hourEvents = dayEvents.filter(event => {
                const eventStartHour = event.start.getHours();
                const eventEndHour = event.end.getHours();
                const eventStartMinutes = event.start.getMinutes();
                const eventEndMinutes = event.end.getMinutes();
                
                // Check if event spans this hour
                const eventStartTime = eventStartHour + (eventStartMinutes / 60);
                const eventEndTime = eventEndHour + (eventEndMinutes / 60);
                
                return hour >= eventStartHour && hour <= eventEndHour;
              });
              
              return (
                <View 
                  key={`hour-${hour}`} 
                  className="flex-row min-h-16"
                  style={{
                    borderBottomColor: gridBorderColor,
                    borderBottomWidth: 1,
                    backgroundColor: isWorkingHours ? '#3B82F610' : 'transparent'
                  }}
                >
                  <View className="w-14 items-end pr-2 pt-3">
                    <Text 
                      className="text-xs"
                      style={{
                        color: hour === 7 || hour === 12 || hour === 19 ? '#1E40AF' : mutedColor,
                        fontWeight: hour === 7 || hour === 12 || hour === 19 ? 'bold' : 'normal'
                      }}
                    >
                      {time}
                    </Text>
                  </View>
                  <View className="flex-1 p-1 relative" style={{borderLeftColor: gridBorderColor, borderLeftWidth: 1}}>
                    {hourEvents.map(event => {
                      // Calculate if this is the first hour of a multi-hour event
                      const isFirstHour = event.start.getHours() === hour;
                      const isLastHour = event.end.getHours() === hour;
                      
                      // Calculate the duration in hours (including partial hours)
                      const durationMs = event.end.getTime() - event.start.getTime();
                      const durationHours = durationMs / (1000 * 60 * 60);
                      
                      // Calculate the height based on duration (each hour = 64px)
                      const height = durationHours * 64;
                      
                      // Calculate the vertical position based on start time
                      const startMinutes = event.start.getMinutes();
                      const endMinutes = event.end.getMinutes();
                      const positionOffset = isFirstHour ? (startMinutes / 60) * 64 : 0;
                      
                      // Calculate the height more accurately
                      let finalHeight = 64; // Default to one hour
                      
                      if (isFirstHour && isLastHour) {
                        // Event starts and ends in the same hour
                        finalHeight = ((endMinutes - startMinutes) / 60) * 64;
                      } else if (isFirstHour) {
                        // First hour of multi-hour event
                        finalHeight = ((60 - startMinutes) / 60) * 64;
                      } else if (isLastHour) {
                        // Last hour of multi-hour event
                        finalHeight = (endMinutes / 60) * 64;
                      }
                      
                      return (
                        <TouchableOpacity
                          key={`${event.id}-${hour}`}
                          className="absolute left-1 right-1 rounded p-2"
                          style={{
                            backgroundColor: event.color,
                            height: finalHeight,
                            top: isFirstHour ? positionOffset : 0,
                            zIndex: 10
                          }}
                          onPress={() => {
                            setSelectedEvent(event);
                            setShowEventModal(true);
                          }}
                        >
                          {isFirstHour && (
                            <>
                              <Text className="text-white text-sm font-medium" numberOfLines={1}>
                                {event.title}
                              </Text>
                              <Text className="text-white text-xs opacity-90">
                                {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} - 
                                {event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        ) : (
          <View className="flex-1 items-center justify-center p-8">
            <CalendarIcon size={48} color={mutedColor} />
            <Text className="text-lg mt-4 text-center" style={{color: mutedColor}}>No events scheduled for this day</Text>
          </View>
        )}
      </View>
    );
  };

  const renderEventModal = () => {
    if (!selectedEvent) return null;
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showEventModal}
        onRequestClose={() => setShowEventModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="rounded-t-3xl p-6 max-h-3/4" style={{backgroundColor}}>
                
            <View className="space-y-5">
                
                <View className="mb-5" style={{borderBottomColor: mutedColor, borderBottomWidth: 2}}>
                  <Text className="py-3 font-bold text-lg" style={{color: '#be2e2e'}}>{selectedEvent.title}</Text>
                </View>
              <View className="flex-row mb-3  items-center ">
                <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{backgroundColor: `${selectedEvent.color}20`}}>
                  <CalendarIcon size={20} color={selectedEvent.color} />
                </View>
                
                <View>
                  <Text className="text-sm" style={{color: mutedColor}}>Date</Text>
                  <Text style={{color: textColor}}>{selectedEvent.start.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</Text>
                </View>
              </View>
              
              <View className="flex-row mb-3 items-center">
                <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{backgroundColor: `${selectedEvent.color}20`}}>
                  <Text className="text-xs font-bold" style={{color: selectedEvent.color}}>⏰</Text>
                </View>
                <View>
                  <Text className="text-sm" style={{color: mutedColor}}>Time</Text>
                  <Text style={{color: textColor}}>
                    {selectedEvent.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                    {selectedEvent.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
              
              <View>
                <Text className="text-sm mb-2" style={{color: mutedColor}}>Description</Text>
                <Text className="leading-5" style={{color: textColor}}>{selectedEvent.description}</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              className="mt-8 rounded-xl p-4 items-center"
              style={{backgroundColor: selectedEvent.color}}
              onPress={() => setShowEventModal(false)}
            >
              <Text className="text-white font-bold text-base">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  // Render loading state with skeleton loader
  if (loading) {
    return <SkeletonLoader />;
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
          {viewMode === "week" && `Week of ${formatDateRange(weekRange.start, weekRange.end)}`}
          {viewMode === "day" && currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </Text>
      </View>
      
      {/* Calendar Content */}
      <View className="flex-1">
        {viewMode === "month" && renderMonthView()}
        {viewMode === "week" && renderWeekView()}
        {viewMode === "day" && renderDayView()}
      </View>
      
      {/* Event Details Modal */}
      {renderEventModal()}
    </View>
  );
}