import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Bell, Filter } from 'lucide-react-native';

interface Props {
  selectedPriority: string;
  onClearFilter: () => void;
  cardColor: string;
  textColor: string;
  mutedColor: string;
}

export const EmptyState: React.FC<Props> = ({ selectedPriority, onClearFilter, cardColor, textColor, mutedColor }) => {
  return (
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
            onPress={onClearFilter}
          >
            <Filter size={16} color="#ffffff" />
            <Text className="text-white font-semibold ml-2">Clear Filter</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
