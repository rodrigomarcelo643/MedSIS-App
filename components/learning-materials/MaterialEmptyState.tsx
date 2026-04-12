import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BookOpen, X } from 'lucide-react-native';

interface MaterialEmptyStateProps {
  searchQuery: string;
  selectedSubject: string;
  setSearchQuery: (query: string) => void;
  setSelectedSubject: (subject: string) => void;
  cardColor: string;
  textColor: string;
  mutedColor: string;
}

export const MaterialEmptyState: React.FC<MaterialEmptyStateProps> = ({
  searchQuery,
  selectedSubject,
  setSearchQuery,
  setSelectedSubject,
  cardColor,
  textColor,
  mutedColor,
}) => {
  return (
    <View className="flex-1 justify-center items-center py-20 px-5">
      <View className="bg-white rounded-2xl shadow-md p-8 items-center max-w-sm" style={{ backgroundColor: cardColor }}>
        <View className="w-20 h-20 bg-[#af1616]/10 rounded-full items-center justify-center mb-4">
          <BookOpen size={40} color="#af1616" />
        </View>
        <Text className="text-xl font-bold text-gray-800 text-center mb-2" style={{ color: textColor }}>
          No Materials Found
        </Text>
        <Text className="text-gray-500 text-center text-sm leading-5" style={{ color: mutedColor }}>
          {searchQuery || selectedSubject !== 'all' 
            ? 'Try adjusting your search terms or filter settings to find what you need.'
            : 'Learning materials for your year level will be available soon. Check back later!'
          }
        </Text>
        {(searchQuery || selectedSubject !== 'all') && (
          <TouchableOpacity 
            className="mt-6 flex-row items-center bg-[#af1616] rounded-lg px-5 py-3"
            onPress={() => {
              setSearchQuery('');
              setSelectedSubject('all');
            }}
          >
            <X size={16} color="#ffffff" />
            <Text className="text-white font-semibold ml-2">Clear Filters</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
