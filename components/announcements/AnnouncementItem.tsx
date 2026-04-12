import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { User, Clock } from 'lucide-react-native';
import { Announcement } from '@/@types/screens/announcements';

const priorityColors: Record<string, string> = {
  low: 'bg-green-100',
  medium: 'bg-amber-100',
  high: 'bg-red-100'
};

const priorityTextColors: Record<string, string> = {
  low: 'text-green-800',
  medium: 'text-amber-800',
  high: 'text-red-800'
};

const priorityBorderColors: Record<string, string> = {
  low: 'border-green-500',
  medium: 'border-amber-500',
  high: 'border-red-700'
};

interface Props {
  announcement: Announcement;
  isExpanded: boolean;
  onToggleExpand: (id: number) => void;
  cardColor: string;
  textColor: string;
}

export const AnnouncementItem: React.FC<Props> = ({ announcement, isExpanded, onToggleExpand, cardColor, textColor }) => {
  const priorityColor = priorityColors[announcement.priority] || priorityColors.low;
  const priorityTextColor = priorityTextColors[announcement.priority] || priorityTextColors.low;
  const priorityBorderColor = priorityBorderColors[announcement.priority] || priorityBorderColors.low;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <View 
      className={`bg-white rounded-sm shadow-sm p-4 mb-4 border-l-4 ${priorityBorderColor}`}
      style={{ backgroundColor: cardColor }}
    >
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center"></View>
        <View className={`rounded-full px-3 py-1 ${priorityColor}`}>
          <Text className={`text-xs font-medium ${priorityTextColor}`}>
            {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity onPress={() => onToggleExpand(announcement.id)}>
        <Text className="text-lg font-semibold text-gray-900 mb-2" style={{ color: textColor }}>{announcement.title}</Text>
        
        {(isExpanded || announcement.description.length < 150) ? (
          <Text className="text-gray-600 mb-3" style={{ color: textColor }}>{announcement.description}</Text>
        ) : (
          <Text className="text-gray-600 mb-3" style={{ color: textColor }}>
            {announcement.description.substring(0, 150)}...
            <Text className="text-maroon-600"> Read more</Text>
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
};
