import { useAuth } from "@/contexts/AuthContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import { API_BASE_URL } from '@/constants/Config';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  Clock,
  Download,
  FileText,
  Filter,
  Search,
  X
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Platform, RefreshControl, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LearningMaterial } from '@/@types/screens/learning-materials';

// File type icons mapping
const fileTypeIcons = {
  'application/pdf': FileText,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': FileText,
  'image/png': FileText,
  'image/jpeg': FileText,
  'default': FileText
};

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Skeleton Loader Component
const SkeletonLoader = () => {
  return (
    <View className="p-4">
      {[1, 2, 3].map((item) => (
        <View key={item} className="bg-white rounded-xl p-4 mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <View className="h-6 w-24 bg-gray-200 rounded-full"></View>
            <View className="h-6 w-16 bg-gray-200 rounded-full"></View>
          </View>
          <View className="h-6 w-3/4 bg-gray-200 rounded mb-2"></View>
          <View className="h-4 w-full bg-gray-200 rounded mb-1"></View>
          <View className="h-4 w-5/6 bg-gray-200 rounded mb-3"></View>
          <View className="flex-row justify-between items-center">
            <View className="h-4 w-20 bg-gray-200 rounded"></View>
            <View className="h-4 w-24 bg-gray-200 rounded"></View>
          </View>
        </View>
      ))}
    </View>
  );
};

const LearningMaterialsScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  //Theme Changer 
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardColor = useThemeColor({}, 'card');
  const mutedColor = useThemeColor({}, 'muted');
  
  // Enhanced navigation detection
  const hasThreeButtonNav = React.useMemo(() => {
    if (Platform.OS === 'ios') {
      return insets.bottom > 20; // iOS home indicator
    }
    return insets.bottom > 0; // Android three-button nav
  }, [insets.bottom]);

  const isGestureNav = React.useMemo(() => {
    return Platform.OS === 'android' && insets.bottom === 0;
  }, [insets.bottom]);

  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<LearningMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [downloading, setDownloading] = useState<number | null>(null);

  // Get unique subjects for filtering
  const availableSubjects = [
    { value: 'all', label: 'All Subjects' },
    ...Array.from(new Set(materials.map(m => m.subject)))
      .filter(subject => subject !== null && subject !== '')
      .map(subject => ({ value: subject, label: subject }))
  ];

  // Fetch learning materials from API
  const fetchLearningMaterials = async () => {
    if (!user) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/api/get_student_learningmaterials.php`, {
        params: {
          user_id: user.id,
          year_level: user.year_level_id
        }
      });

      console.log('API Response:', response.data);

      if (response.data && response.data.success) {
        setMaterials(response.data.documents || []);
      } else {
        setError(response.data?.message || 'Failed to fetch learning materials');
      }
    } catch (err: any) {
      console.error('Error fetching learning materials:', err);
      
      if (err.response?.status === 400) {
        setError('Invalid request. Please check if the API endpoint is correct.');
      } else if (err.response?.status === 401) {
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please log in again.',
          [{ text: 'OK', onPress: () => logout() }]
        );
      } else if (err.code === 'NETWORK_ERROR') {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(err.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter materials based on search query and selected subject
  useEffect(() => {
    let filtered = [...materials];
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(material => 
        material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (material.description && material.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Filter by subject
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(material => material.subject === selectedSubject);
    }
    
    setFilteredMaterials(filtered);
  }, [materials, searchQuery, selectedSubject]);

  // Load materials on component mount
  useEffect(() => {
    fetchLearningMaterials();
  }, [user]);

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchLearningMaterials();
  };

  // Handle file download
  const handleDownload = async (material: LearningMaterial) => {
    if (!user) return;
    
    setDownloading(material.id);
    
    try {
      const fileUrl = `${API_BASE_URL}/api/get_learningmaterial_file.php?user_id=${user.id}&document_id=${material.id}&file_path=${encodeURIComponent(material.file_path)}`;
      
      console.log('Downloading file from:', fileUrl);
      
      if (Platform.OS === 'web') {
        // For web, open in new tab
        window.open(fileUrl, '_blank');
      } else {
        // For mobile, download the file
        const fileUri = FileSystem.documentDirectory + material.file_name;
        
        console.log('Saving to:', fileUri);
        
        const downloadResumable = FileSystem.createDownloadResumable(
          fileUrl,
          fileUri,
          {},
          (downloadProgress) => {
            const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
            console.log(`Download progress: ${progress * 100}%`);
          }
        );

        const result = await downloadResumable.downloadAsync();
        const uri = result?.uri;
        
        console.log('File downloaded to:', uri);
        
        if (uri) {
          Alert.alert(
            'Download Complete',
            `File "${material.file_name}" has been downloaded successfully.`,
            [{ text: 'OK' }]
          );
          
          // Try to open the file with the appropriate app
          try {
            if (Platform.OS === 'android') {
              const contentUri = await FileSystem.getContentUriAsync(uri);
              await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                data: contentUri,
                flags: 1,
                type: material.file_type
              });
            } else if (Platform.OS === 'ios') {
              // For iOS, use Sharing API
              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri);
              }
            }
          } catch (openError) {
            console.log('Could not open file directly:', openError);
            // The file is still downloaded, just couldn't be opened automatically
          }
        }
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download the file. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get the label for the selected subject
  const getSelectedSubjectLabel = () => {
    return availableSubjects.find(s => s.value === selectedSubject)?.label || 'All Subjects';
  };

  // Subject dropdown component
  const SubjectDropdown = () => {
    return (
      <Modal
        visible={showSubjectDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSubjectDropdown(false)}
      >
        <TouchableOpacity 
          className="flex-1 bg-black/50"
          activeOpacity={1}
          onPress={() => setShowSubjectDropdown(false)}
        >
          <View className="absolute top-20 right-4 w-48 bg-white rounded-lg shadow-lg overflow-hidden">
            {availableSubjects.map((subject) => (
              <TouchableOpacity
                key={subject.value}
                className={`flex-row items-center px-4 py-3 ${
                  selectedSubject === subject.value ? 'bg-[#af1616]-100' : 'bg-white'
                }`}
                onPress={() => {
                  setSelectedSubject(subject.value);
                  setShowSubjectDropdown(false);
                }}
              >
                {selectedSubject === subject.value ? (
                  <Check size={16} color="#800000" />
                ) : (
                  <View className="w-4 h-4" />
                )}
                <Text className={`ml-2 ${selectedSubject === subject.value ? 'text-[#af1616]-800 font-semibold' : 'text-gray-700'}`}>
                  {subject.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 pt-10">
        <View className="flex-row items-center px-4 py-4 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ChevronLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-[#af1616]-800">Learning Materials</Text>
        </View>
        <SkeletonLoader />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-gray-50 pt-10">
        <View className="flex-row items-center px-4 py-4 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ChevronLeft size={24} color="#800000" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-[#af1616]-800">Learning Materials</Text>
        </View>
        <View className="flex-1 justify-center items-center p-5">
          <BookOpen size={48} color="#800000" />
          <Text className="mt-4 text-[#af1616]-700 text-center">{error}</Text>
          <TouchableOpacity 
            className="mt-4 px-6 py-3 bg-[#af1616]-600 rounded-lg"
            onPress={fetchLearningMaterials}
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 pt-10" style={{ backgroundColor }}>
      <View className="flex-row items-center px-4 py-4 bg-white border-b border-gray-200" style={{ backgroundColor: cardColor}}>
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ChevronLeft size={24} color={textColor}/>
        </TouchableOpacity>
        <Text className="text-xl font-bold" style={{ color:textColor }}>Learning Materials</Text>
        <View className="flex-1"></View>
        <TouchableOpacity 
          className="flex-row items-center bg-[#af1616]-100 rounded-full px-4 py-2"
          onPress={() => setShowSubjectDropdown(true)}
        >
          <Filter size={16} color={textColor} />
          <Text className="mr-1  text-sm font-medium" style={{ color:textColor }}>
            {getSelectedSubjectLabel()}
          </Text>
          <ChevronDown size={16} color={textColor} />
        </TouchableOpacity>
      </View>

      <SubjectDropdown />

      {/* Search Bar */}
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

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        className="flex-1"
        contentContainerStyle={{ 
          paddingBottom: hasThreeButtonNav ? insets.bottom + 16 : isGestureNav ? 24 : 16 
        }}
      >
        {filteredMaterials.length === 0 ? (
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
        ) : (
          <View className="p-4">
            {filteredMaterials.map(material => {
              const IconComponent = fileTypeIcons[material.file_type as keyof typeof fileTypeIcons] || fileTypeIcons.default;
              
              return (
                <View 
                  key={material.id} 
                  className="bg-white rounded-sm shadow-sm p-4 mb-4 border-l-4 border-[#af1616]"
                  style={{ backgroundColor: cardColor }}
                >
                  <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-row items-center">
                      <View className="flex-row items-center bg-[#af1616]-100 rounded-full px-3 py-1">
                        <Image source={require("../../assets/images/pdf.png")} className="w-5 h-5" />
                        <Text className="ml-2 text-[#af1616]-800 text-sm font-medium" style={{ color:textColor }}>
                          {material.subject}
                        </Text>
                      </View>
                    </View>
                    
                    <View className="bg-gray-100 rounded-full px-3 py-1">
                      <Text className="text-xs font-medium text-gray-600" >
                        {formatFileSize(material.file_size)}
                      </Text>
                    </View>
                  </View>
                  
                  <Text className="text-lg font-semibold text-gray-900 mb-2" style={{ color: textColor}}>{material.title}</Text>
                  
                  {material.description && (
                    <Text className="text-gray-600 mb-3" style={{ color:textColor }} >{material.description}</Text>
                  )}
                  
                  <View className="flex-row justify-between items-center mt-4">
                    <View className="flex-row items-center">
                      <Clock size={14} color="#6b7280" />
                      <Text className="ml-1 text-gray-500 text-sm">{formatDate(material.created_at)}</Text>
                    </View>
                    
                    <TouchableOpacity 
                      className={`flex-row items-center px-3 rounded-lg ${
                        downloading === material.id ? 'bg-[#af1616]' : 'bg-[#af1616]'
                      }`}
                      onPress={() => handleDownload(material)}
                      disabled={downloading === material.id}
                    >
                      {downloading === material.id ? (
                        <>
                        <View className="p-1">
                          <ActivityIndicator size="small" color="#ffffff"  />
                        </View>
                        </>
                      ) : (
                        <>
                          <Download size={14} color="#ffffff" />
                          <Text className="text-white  px-2 py-2  text-sm font-medium">Download</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default LearningMaterialsScreen;
