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
  ChevronDown,
  ChevronLeft,
  Filter
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LearningMaterial } from '@/@types/screens/learning-materials';
import { MaterialSkeletonLoader } from '@/components/learning-materials/MaterialSkeletonLoader';
import { SubjectDropdown } from '@/components/learning-materials/SubjectDropdown';
import { MaterialSearchBar } from '@/components/learning-materials/MaterialSearchBar';
import { MaterialEmptyState } from '@/components/learning-materials/MaterialEmptyState';
import { MaterialCard } from '@/components/learning-materials/MaterialCard';
import { useDispatch, useSelector } from "@/redux/store";
import { 
  setLearningMaterials, 
  setLearningMaterialsLoading, 
  setLearningMaterialsError 
} from "@/redux/actions";

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

  const dispatch = useDispatch();
  const { materials, loading, error } = useSelector(state => state.learningMaterials);

  const [filteredMaterials, setFilteredMaterials] = useState<LearningMaterial[]>([]);
  const [refreshing, setRefreshing] = useState(false);
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
      dispatch(setLearningMaterialsError('User not authenticated'));
      return;
    }

    try {
      dispatch(setLearningMaterialsLoading(true));
      dispatch(setLearningMaterialsError(null));
      
      const response = await axios.get(`${API_BASE_URL}/api/get_student_learningmaterials.php`, {
        params: {
          user_id: user.id,
          year_level: user.year_level_id
        }
      });

      console.log('API Response:', response.data);

      if (response.data && response.data.success) {
        dispatch(setLearningMaterials(response.data.documents || []));
      } else {
        dispatch(setLearningMaterialsError(response.data?.message || 'Failed to fetch learning materials'));
      }
    } catch (err: any) {
      console.error('Error fetching learning materials:', err);
      
      if (err.response?.status === 400) {
        dispatch(setLearningMaterialsError('Invalid request. Please check if the API endpoint is correct.'));
      } else if (err.response?.status === 401) {
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please log in again.',
          [{ text: 'OK', onPress: () => logout() }]
        );
      } else if (err.code === 'NETWORK_ERROR') {
        dispatch(setLearningMaterialsError('Network error. Please check your connection and try again.'));
      } else {
        dispatch(setLearningMaterialsError(err.message || 'An unexpected error occurred. Please try again.'));
      }
    } finally {
      dispatch(setLearningMaterialsLoading(false));
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



  // Get the label for the selected subject
  const getSelectedSubjectLabel = () => {
    return availableSubjects.find(s => s.value === selectedSubject)?.label || 'All Subjects';
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
        <MaterialSkeletonLoader />
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

      <SubjectDropdown
        showSubjectDropdown={showSubjectDropdown}
        setShowSubjectDropdown={setShowSubjectDropdown}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        availableSubjects={availableSubjects}
      />

      <MaterialSearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        backgroundColor={backgroundColor}
        cardColor={cardColor}
        mutedColor={mutedColor}
      />

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
          <MaterialEmptyState
            searchQuery={searchQuery}
            selectedSubject={selectedSubject}
            setSearchQuery={setSearchQuery}
            setSelectedSubject={setSelectedSubject}
            cardColor={cardColor}
            textColor={textColor}
            mutedColor={mutedColor}
          />
        ) : (
          <View className="p-4">
            {filteredMaterials.map(material => (
              <MaterialCard
                key={material.id}
                material={material}
                downloading={downloading}
                handleDownload={handleDownload}
                cardColor={cardColor}
                textColor={textColor}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default LearningMaterialsScreen;
