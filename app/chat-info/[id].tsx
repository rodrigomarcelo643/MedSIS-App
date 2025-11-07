import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import { 
  ArrowLeft, 
  Search, 
  Image as ImageIcon, 
  File, 
  Link, 
  X 
} from 'lucide-react-native';

interface MediaItem {
  id: string;
  type: 'image' | 'file' | 'link';
  url: string;
  name?: string;
  timestamp: Date;
}

export default function ChatInfoScreen() {
  const router = useRouter();
  const { id, name, avatar, user_type } = useLocalSearchParams();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardColor = useThemeColor({}, 'card');
  const mutedColor = useThemeColor({}, 'muted');
  
  // Extract actual user ID from unique_key format (user_type_id)
  const actualUserId = (id as string).includes('_') ? (id as string).split('_')[1] : id as string;

  const [activeTab, setActiveTab] = useState<'media' | 'files' | 'links'>('media');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);

  const dummyMedia: MediaItem[] = [
    { id: '1', type: 'image', url: 'https://via.placeholder.com/150', timestamp: new Date() },
    { id: '2', type: 'image', url: 'https://via.placeholder.com/150', timestamp: new Date() },
    { id: '3', type: 'file', url: 'document.pdf', name: 'Assignment.pdf', timestamp: new Date() },
    { id: '4', type: 'link', url: 'https://example.com', name: 'Study Materials', timestamp: new Date() },
  ];

  useEffect(() => {
    loadMediaItems();
  }, [activeTab]);

  const loadMediaItems = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    const filteredItems = dummyMedia.filter(item => item.type === activeTab);
    setMediaItems(filteredItems);
    setLoading(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const renderMediaItem = ({ item }: { item: MediaItem }) => {
    if (item.type === 'image') {
      return (
        <TouchableOpacity className="w-1/3 p-1">
          <Image source={{ uri: item.url }} className="w-full h-24 rounded-lg" />
        </TouchableOpacity>
      );
    }
    
    if (item.type === 'file') {
      return (
        <TouchableOpacity className="flex-row items-center p-3 border-b" style={{ borderBottomColor: mutedColor + '30' }}>
          <View className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center mr-3">
            <File size={20} color="#fff" />
          </View>
          <View className="flex-1">
            <Text className="font-medium" style={{ color: textColor }}>{item.name}</Text>
            <Text className="text-xs" style={{ color: mutedColor }}>
              {item.timestamp.toLocaleDateString()}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity className="flex-row items-center p-3 border-b" style={{ borderBottomColor: mutedColor + '30' }}>
        <View className="w-10 h-10 rounded-full bg-green-500 items-center justify-center mr-3">
          <Link size={20} color="#fff" />
        </View>
        <View className="flex-1">
          <Text className="font-medium" style={{ color: textColor }}>{item.name}</Text>
          <Text className="text-xs" style={{ color: mutedColor }}>{item.url}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor }}>
      <View className="flex-row items-center px-4 py-4 pt-10 border-b" style={{ backgroundColor: cardColor, borderBottomColor: mutedColor + '30' }}>
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ArrowLeft size={24} color={textColor} />
        </TouchableOpacity>
        <Text className="text-xl font-bold" style={{ color: textColor }}>Chat Info</Text>
        <View className="flex-1" />
        <TouchableOpacity onPress={() => setShowSearch(!showSearch)}>
          <Search size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      {showSearch && (
        <View className="px-4 py-3 border-b" style={{ backgroundColor: cardColor, borderBottomColor: mutedColor + '30' }}>
          <View className="flex-row items-center rounded-full px-4 py-0 border" style={{ backgroundColor, borderColor: mutedColor + '40' }}>
            <Search size={20} color={mutedColor} />
            <TextInput
              className="flex-1 ml-2 text-base"
              style={{ color: textColor }}
              placeholder="Search messages..."
              placeholderTextColor={mutedColor}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={20} color={mutedColor} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <ScrollView style={{ flex: 1 }}>
        <View className="items-center py-6" style={{ backgroundColor: cardColor }}>
          <View className="relative">
            <View className="w-24 h-24 rounded-full items-center justify-center" style={{ backgroundColor: '#af1616' }}>
              <Text className="text-white font-bold text-2xl">
                {getInitials(name as string)}
              </Text>
            </View>
            {avatar && (
              <Image
                source={{ uri: avatar as string }}
                className="absolute inset-0 w-24 h-24 rounded-full"
              />
            )}
            <View className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white" />
          </View>
          <Text className="text-2xl font-bold mt-4" style={{ color: textColor }}>
            {name}
          </Text>
          <Text className="text-sm" style={{ color: mutedColor }}>Online</Text>
        </View>

        <View className="flex-row border-b" style={{ backgroundColor: cardColor, borderBottomColor: mutedColor + '30' }}>
          {(['media', 'files', 'links'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 py-4 items-center ${activeTab === tab ? 'border-b-2' : ''}`}
              style={{ borderBottomColor: activeTab === tab ? '#af1616' : 'transparent' }}
            >
              <Text className={`font-medium ${activeTab === tab ? 'font-bold' : ''}`} style={{ color: activeTab === tab ? '#af1616' : mutedColor }}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ backgroundColor: cardColor, minHeight: 400 }}>
          {loading ? (
            <View className="py-8 items-center">
              <ActivityIndicator size="large" color="#af1616" />
            </View>
          ) : (
            <FlatList
              key={activeTab}
              data={mediaItems}
              renderItem={renderMediaItem}
              keyExtractor={(item) => item.id}
              numColumns={activeTab === 'media' ? 3 : 1}
              scrollEnabled={false}
              ListEmptyComponent={
                <View className="py-8 items-center">
                  <Text style={{ color: mutedColor }}>No {activeTab} found</Text>
                </View>
              }
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}