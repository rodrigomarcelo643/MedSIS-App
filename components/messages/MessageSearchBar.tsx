import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Search, X } from 'lucide-react-native';

interface MessageSearchBarProps {
  searchQuery: string;
  handleSearch: (query: string) => void;
  clearSearch: () => void;
  cardColor: string;
  mutedColor: string;
  textColor: string;
}

export const MessageSearchBar = ({
  searchQuery,
  handleSearch,
  clearSearch,
  cardColor,
  mutedColor,
  textColor,
}: MessageSearchBarProps) => {
  return (
    <View className="px-4 py-3" style={{ backgroundColor: cardColor }}>
      <View
        className="flex-row items-center rounded-full px-4 py-0 border"
        style={{ 
          backgroundColor: cardColor,
          borderColor: mutedColor + '40'
        }}
      >
        <Search size={20} color={mutedColor} />
        <TextInput
          className="flex-1 ml-2 text-base"
          style={{ color: textColor }}
          placeholder="Search ..."
          placeholderTextColor={mutedColor}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch} className="ml-2">
            <X size={20} color={mutedColor} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
