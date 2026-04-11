import React from 'react';
import { View, Text, TouchableOpacity, TextInput, Pressable, Platform, ActivityIndicator } from 'react-native';
import { Search, X, Download, ChevronDown } from 'lucide-react-native';
import { FilterType } from '@/@types/tabs';

interface FolderHeaderProps {
  backgroundColor: string;
  textColor: string;
  cardColor: string;
  mutedColor: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  totalCount: number;
  completedCount: number;
  completionPercentage: number;
  printingFiles: boolean;
  onDownloadAll: () => void;
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  showFilterDropdown: boolean;
  setShowFilterDropdown: (show: boolean) => void;
}

export const FolderHeader: React.FC<FolderHeaderProps> = ({
  backgroundColor,
  textColor,
  cardColor,
  mutedColor,
  searchQuery,
  setSearchQuery,
  totalCount,
  completedCount,
  completionPercentage,
  printingFiles,
  onDownloadAll,
  filter,
  setFilter,
  showFilterDropdown,
  setShowFilterDropdown,
}) => {
  return (
    <View>
      {/* Header Title */}
      <View className="mb-6">
        <Text style={{ color: mutedColor, marginTop: 4 }}>
          Upload all required documents. Please ensure all files are clear and
          legible.
        </Text>
      </View>

      {/* Search Bar */}
      <View style={{ backgroundColor: cardColor, paddingVertical: Platform.OS === 'ios' ? 12 : 8 }} className="flex-row items-center bg-white rounded-lg px-4 shadow-sm mb-4 border-2 border-gray-300"> 
        <Search size={20} color="#6b7280" />
        <TextInput
          style={{ marginLeft: 8, color: textColor, flex: 1, fontSize: 16, paddingVertical: Platform.OS === 'ios' ? 0 : 4 }}
          placeholder="Search requirements..."
          placeholderTextColor={mutedColor}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode={Platform.OS === 'ios' ? "while-editing" : "never"}
          returnKeyType="search"
        />
        {(searchQuery && Platform.OS === 'android') ? (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <X size={20} color="#6b7280" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Stats Cards */}
      <View className="flex-row justify-between mb-4 gap-1">
        <View style={{ backgroundColor: cardColor, borderRadius: 8, padding: 16, width: '33%', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}>
          <Text className="text-gray-500 text-sm">Requirements</Text>
          <Text  className="text-2xl" style={{ fontWeight: 'bold', color: textColor }}>
            {totalCount}
          </Text>
        </View>
        <View className="bg-white rounded-lg p-4 w-1/3 items-center shadow-md" style={{ backgroundColor: cardColor, borderRadius: 8, padding: 16, width: '33%', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}>
          <Text className="text-gray-500 text-sm">Completed</Text>
          <Text className="text-2xl font-bold text-gray-800" style={{ fontSize: 24, fontWeight: 'bold', color: textColor }}>
            {completedCount}
          </Text>
        </View>
        <View className="bg-white rounded-lg p-4 w-1/3 items-center shadow-md" style={{ backgroundColor: cardColor, borderRadius: 8, padding: 16, width: '33%', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}>
          <Text className="text-gray-500 text-sm" >Completion</Text>
          <Text className="text-2xl font-bold text-green-600" >
            {completionPercentage}%
          </Text>
        </View>
      </View>

      {/* Download and Filter Row */}
      <View className="flex-row items-center gap-3 justify-between mb-4">
        {/* Download All Button */}
        <TouchableOpacity
          className={`px-5 py-2 rounded-lg flex-row items-center justify-center ${
            printingFiles ? "bg-gray-400" : "bg-[#be2e2e]"
          }`}
          onPress={onDownloadAll}
          disabled={printingFiles}
        >
          {printingFiles ? (
            <ActivityIndicator size={16} color="white" />
          ) : (
            <Download size={16} color="white" />
          )}
          <Text className="text-white ml-2 text-xs font-medium">
            {printingFiles ? "Compiling..." : "Download All"}
          </Text>
        </TouchableOpacity>

        {/* Filter Dropdown */}
        <View className="flex-1 relative">
          <Pressable
            style={{ backgroundColor:cardColor }}
            className="bg-white border border-gray-200 py-2 px-4 rounded-lg flex-row items-center justify-between h-10"
            onPress={() => setShowFilterDropdown(!showFilterDropdown)}
          >
            <Text className="text-gray-700 text-xs" style={{ color: textColor}}>
              {filter === "all"
                ? "All"
                : filter === "completed"
                  ? "Completed"
                  : "Not Completed"}
            </Text>
            <ChevronDown size={16} color="#6b7280" />
          </Pressable>

          {showFilterDropdown && (
            <View className="absolute top-10 right-0 left-0 bg-white border border-gray-200 rounded-lg shadow-md z-10">
              <Pressable
                className="py-2 px-4 border-b border-gray-100"
                onPress={() => {
                  setFilter("all");
                  setShowFilterDropdown(false);
                }}
              >
                <Text className="text-gray-700 text-xs">All</Text>
              </Pressable>
              <Pressable
                className="py-2 px-4 border-b border-gray-100"
                onPress={() => {
                  setFilter("completed");
                  setShowFilterDropdown(false);
                }}
              >
                <Text className="text-gray-700 text-xs">Completed</Text>
              </Pressable>
              <Pressable
                className="py-2 px-4"
                onPress={() => {
                  setFilter("not-completed");
                  setShowFilterDropdown(false);
                }}
              >
                <Text className="text-gray-700 text-xs">Not Completed</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};
