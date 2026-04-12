import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Search, X } from 'lucide-react-native';

interface MaterialSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  backgroundColor: string;
  cardColor: string;
  mutedColor: string;
}

export const MaterialSearchBar: React.FC<MaterialSearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  backgroundColor,
  cardColor,
  mutedColor,
}) => {
  return (
    <View className="px-4 py-3 bg-white border-b border-gray-200" style={{ backgroundColor }}>
      <View className="flex-row items-center bg-gray-100 rounded-[18px] px-3 py-1" style={{ backgroundColor: cardColor }}>
        <Search size={18} color="#6b7280" />
        <TextInput
          className="flex-1 ml-2 text-gray-700"
          placeholder="Search materials..."
          value={searchQuery}
          placeholderTextColor={mutedColor}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X size={18} color="#6b7280" />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};
