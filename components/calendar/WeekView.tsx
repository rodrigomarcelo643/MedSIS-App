import React from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { CalendarEvent, WeekRange } from '@/@types/screens/calendar';
import { days, MAROON_THEME } from './constants';
import { getWeekRange } from './utils';

interface WeekViewProps {
  currentDate: Date;
  filteredEvents: CalendarEvent[];
  setSelectedEvent: (event: CalendarEvent) => void;
  setShowEventModal: (show: boolean) => void;
  gridBorderColor: string;
  cardColor: string;
  textColor: string;
  mutedColor: string;
  refreshing: boolean;
  onRefresh: () => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  filteredEvents,
  setSelectedEvent,
  setShowEventModal,
  gridBorderColor,
  cardColor,
  textColor,
  mutedColor,
  refreshing,
  onRefresh
}) => {
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
