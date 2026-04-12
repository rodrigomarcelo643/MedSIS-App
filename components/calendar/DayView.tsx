import React from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Calendar as CalendarIcon } from 'lucide-react-native';
import { CalendarEvent } from '@/@types/screens/calendar';
import { MAROON_THEME } from './constants';

interface DayViewProps {
  currentDate: Date;
  filteredEvents: CalendarEvent[];
  setSelectedEvent: (event: CalendarEvent) => void;
  setShowEventModal: (show: boolean) => void;
  gridBorderColor: string;
  textColor: string;
  mutedColor: string;
  refreshing: boolean;
  onRefresh: () => void;
}

export const DayView: React.FC<DayViewProps> = ({
  currentDate,
  filteredEvents,
  setSelectedEvent,
  setShowEventModal,
  gridBorderColor,
  textColor,
  mutedColor,
  refreshing,
  onRefresh
}) => {
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
