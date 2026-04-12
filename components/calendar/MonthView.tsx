import React from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { CalendarEvent, ViewMode } from '@/@types/screens/calendar';
import { days, MAROON_THEME } from './constants';

interface MonthViewProps {
  currentDate: Date;
  filteredEvents: CalendarEvent[];
  setCurrentDate: (date: Date) => void;
  setViewMode: (mode: ViewMode) => void;
  setSelectedEvent: (event: CalendarEvent) => void;
  setShowEventModal: (show: boolean) => void;
  gridBorderColor: string;
  backgroundColor: string;
  textColor: string;
  mutedColor: string;
  refreshing: boolean;
  onRefresh: () => void;
}

export const MonthView: React.FC<MonthViewProps> = ({
  currentDate,
  filteredEvents,
  setCurrentDate,
  setViewMode,
  setSelectedEvent,
  setShowEventModal,
  gridBorderColor,
  backgroundColor,
  textColor,
  mutedColor,
  refreshing,
  onRefresh
}) => {
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
