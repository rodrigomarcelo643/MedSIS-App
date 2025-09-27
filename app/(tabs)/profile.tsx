import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import * as ImagePicker from 'expo-image-picker';
import { Link, useRouter } from "expo-router";
import {
  BookOpen,
  Calendar,
  Camera,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Edit2,
  GalleryVertical,
  Globe,
  GraduationCap,
  IdCard,
  LogOut,
  Mail,
  Phone,
  School,
  Shield,
  User,
  X,
  XCircle
} from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  KeyboardTypeOptions,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

interface UserData {
  id: string;
  user_id?: string;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  nationality?: string;
  foreigner_specify?: string;
  contact_number?: string;
  program?: string;
  year_level_id?: number;
  year_level_name?: string;
  academic_year?: string;
  avatar?: string;
  avatar_url?: string;
  avatar_data?: string;
}

interface EditData {
  first_name: string;
  last_name: string;
  nationality: string;
  foreigner_specify: string;
  contact_number: string;
}

interface ExpandedSections {
  personal: boolean;
  academic: boolean;
  contact: boolean;
}

interface UpdateModal {
  visible: boolean;
  success: boolean;
  message: string;
}

interface InfoItemProps {
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
  value?: string;
  editable?: boolean;
  field?: keyof EditData;
  inputRef?: React.RefObject<TextInput>;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
}

interface NationalityInputProps {
  value?: string;
  label: string;
}

interface SectionProps {
  title: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}

const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://msis.eduisync.io/api";
export default function ProfileScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const [isAvatarModalVisible, setAvatarModalVisible] = useState(false);
  const [isViewPhotoModalVisible, setViewPhotoModalVisible] = useState(false);
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    personal: true,
    academic: true,
    contact: true,
  });
  const [editData, setEditData] = useState<EditData>({
    first_name: "",
    last_name: "",
    nationality: "",
    foreigner_specify: "",
    contact_number: "",
  });
  const [userData, setUserData] = useState<UserData | null>(null);
  const [updateModal, setUpdateModal] = useState<UpdateModal>({
    visible: false,
    success: false,
    message: "",
  });
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [nationalityType, setNationalityType] = useState("Filipino");
  const [isUploading, setIsUploading] = useState(false);
  const [hasInitiallyFetched, setHasInitiallyFetched] = useState(false);

  const { user, login, logout, clearUser, refreshUser } = useAuth();
  const router = useRouter();
  const editDataRef = useRef<EditData>(editData);
  const firstNameInputRef = useRef<TextInput>(null);
  const lastNameInputRef = useRef<TextInput>(null);
  const contactInputRef = useRef<TextInput>(null);
  const customNationalityRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Stable callback functions
  const handleTextChange = useCallback((field: keyof EditData, text: string) => {
    setEditData(prev => ({ ...prev, [field]: text }));
  }, []);

  const handleNationalityTypeChange = useCallback((type: string) => {
    setNationalityType(type);
    if (type === "Filipino") {
      setEditData(prev => ({ 
        ...prev, 
        nationality: "Filipino",
        foreigner_specify: "" 
      }));
    } else {
      setEditData(prev => ({ 
        ...prev, 
        nationality: "Foreigner" 
      }));
      // Focus on foreigner specify field after a short delay
      setTimeout(() => {
        customNationalityRef.current?.focus();
      }, 100);
    }
  }, []);

  const handleForeignerSpecifyChange = useCallback((text: string) => {
    setEditData(prev => ({ ...prev, foreigner_specify: text }));
  }, []);

  // Update ref when editData changes
  useEffect(() => {
    editDataRef.current = editData;
  }, [editData]);

  // Check if user is graduating (year level 4)
  const isGraduating = userData?.year_level_id === 4;

  // Get avatar source - use base64 data if available, otherwise fallback to URL or default
  const getAvatarSource = () => {
    // Priority 1: Selected image (for preview)
    if (selectedImage) {
      return { uri: selectedImage.uri };
    }
    // Priority 2: Base64 avatar data from API
    if (userData?.avatar_data) {
      return { uri: userData.avatar_data };
    }
    // Priority 3: avatar_url from database (full URL or path)
    else if (userData?.avatar_url) {
      // Check if it's a full URL or a relative path
      if (userData.avatar_url.startsWith('http')) {
        return { uri: userData.avatar_url };
      } else {
        // For relative paths, construct the full URL
        return { uri: `${API_URL}/../${userData.avatar_url}` };
      }
    }
    // Priority 4: Legacy avatar field (for backward compatibility)
    else if (userData?.avatar) {
      if (userData.avatar.startsWith('http')) {
        return { uri: userData.avatar };
      } else {
        return { uri: `${API_URL}/../${userData.avatar}` };
      }
    }
    // Fallback: SWU head image
    return require('@/assets/images/swu-head.png');
  };

  // Request camera and gallery permissions
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        
        if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
          Alert.alert('Permission Required', 'We need camera and gallery permissions to update your profile picture');
        }
      }
    })();
  }, []);

  // Memoized fetch function with live fetch capability
  const fetchUserData = useCallback(async (showLoading = true, forceLiveFetch = false) => {
    const uid = user?.id || user?.user_id;
    if (!uid) return;

    if (showLoading) setIsLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/get_user_data.php`,
        { 
          user_id: uid,
          live_fetch: forceLiveFetch || !hasInitiallyFetched
        },
        {
          timeout: 10000,
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.success && response.data.user) {
        setUserData(response.data.user);
        await login(response.data.user);
        
        if (!hasInitiallyFetched) {
          setHasInitiallyFetched(true);
        }
        
        // Set nationality type based on existing data
        if (response.data.user.nationality) {
          if (response.data.user.nationality === "Filipino") {
            setNationalityType("Filipino");
          } else {
            setNationalityType("Foreigner");
          }
        }
      } else {
        Alert.alert(
          "Error",
          response.data.message || "Failed to fetch user data"
        );

        if (response.data.message?.includes("deactivated")) {
          await clearUser();
          router.replace("/auth/login");
        }
      }
    } catch (error: any) {
      const serverMessage =
        error.response?.data?.message ||
        error.message ||
        "An unknown error occurred";

      Alert.alert("Error", serverMessage);

      if (error.response?.status === 403 || error.response?.status === 404) {
        await clearUser();
        router.replace("/auth/login");
      }
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [user, login, clearUser, router, hasInitiallyFetched]);

  useEffect(() => {
    if (!user) {
      clearUser();
      router.replace("/auth/login");
    } else {
      setUserData(user);
      // Always fetch live data on first load
      if (!hasInitiallyFetched) {
        fetchUserData(true, true); // Live fetch on first load
      }
    }
  }, [user, hasInitiallyFetched, fetchUserData]);

  useEffect(() => {
    if (userData && !isEditing) {
      setEditData({
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        nationality: userData.nationality || "",
        foreigner_specify: userData.foreigner_specify || "",
        contact_number: userData.contact_number || "",
      });
      
      // Set nationality type based on existing data
      if (userData.nationality) {
        if (userData.nationality === "Filipino") {
          setNationalityType("Filipino");
        } else {
          setNationalityType("Foreigner");
        }
      }
    }
  }, [userData, isEditing]);

  const toggleSection = (section: keyof ExpandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const showLogoutModal = () => setLogoutModalVisible(true);
  const hideLogoutModal = () => setLogoutModalVisible(false);

  const showAvatarModal = () => setAvatarModalVisible(true);
  const hideAvatarModal = () => setAvatarModalVisible(false);

  const showViewPhotoModal = () => setViewPhotoModalVisible(true);
  const hideViewPhotoModal = () => setViewPhotoModalVisible(false);

  const showUpdateModal = (success: boolean, message: string) => {
    setUpdateModal({
      visible: true,
      success,
      message,
    });
  };

  const hideUpdateModal = () => {
    setUpdateModal({
      visible: false,
      success: false,
      message: "",
    });
  };

  const handleLogout = async () => {
    await logout();
    hideLogoutModal();
    router.replace("/auth/login");
  };

  const handleForceLogout = async () => {
    await clearUser();
    router.replace("/auth/login");
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Force live fetch on pull-to-refresh
    await fetchUserData(false, true);
    setRefreshing(false);
  };

  const startEditing = () => {
    if (isEditing) {
      cancelEditing();
    } else {
      setEditData({
        first_name: userData?.first_name || "",
        last_name: userData?.last_name || "",
        nationality: userData?.nationality || "",
        foreigner_specify: userData?.foreigner_specify || "",
        contact_number: userData?.contact_number || "",
      });
      
      // Set nationality type based on existing data
      if (userData?.nationality) {
        if (userData.nationality === "Filipino") {
          setNationalityType("Filipino");
        } else {
          setNationalityType("Foreigner");
        }
      }
      
      setIsEditing(true);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setSelectedImage(null);
    setEditData({
      first_name: userData?.first_name || "",
      last_name: userData?.last_name || "",
      nationality: userData?.nationality || "",
      foreigner_specify: userData?.foreigner_specify || "",
      contact_number: userData?.contact_number || "",
    });
    
    // Reset nationality type
    if (userData?.nationality) {
      if (userData.nationality === "Filipino") {
        setNationalityType("Filipino");
      } else {
        setNationalityType("Foreigner");
      }
    }
  };

  const pickImage = async (useCamera = false) => {
    try {
      let result;
      
      if (useCamera) {
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled) {
        setSelectedImage(result.assets[0]);
        hideAvatarModal();
      }
    } catch (error: any) {
      Alert.alert("Error", "Failed to pick image: " + error.message);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user || !userData) return;

    const currentEditData = editDataRef.current;

    if (!currentEditData.first_name.trim() || !currentEditData.last_name.trim()) {
      showUpdateModal(false, "First and Last name are required");
      return;
    }

    // Validate foreigner specify if foreigner is selected
    if (nationalityType === "Foreigner" && !currentEditData.foreigner_specify.trim()) {
      showUpdateModal(false, "Please specify your nationality");
      return;
    }

    const changes: Record<string, string> = {};
    if (currentEditData.first_name !== userData.first_name)
      changes.first_name = currentEditData.first_name.trim();
    if (currentEditData.last_name !== userData.last_name)
      changes.last_name = currentEditData.last_name.trim();
    if (currentEditData.nationality !== userData.nationality)
      changes.nationality = currentEditData.nationality.trim();
    if (currentEditData.foreigner_specify !== userData.foreigner_specify)
      changes.foreigner_specify = currentEditData.foreigner_specify.trim();
    if (currentEditData.contact_number !== userData.contact_number)
      changes.contact_number = currentEditData.contact_number.trim();

    // Check if we have changes or a new image
    const hasChanges = Object.keys(changes).length > 0 || selectedImage;

    if (!hasChanges) {
      showUpdateModal(false, "No changes detected");
      return;
    }

    setIsLoading(true);
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("user_id", user.id);
      
      // Add text fields
      Object.entries(changes).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Add image file if selected
      if (selectedImage) {
        const filename = selectedImage.uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formData.append('avatar', {
          uri: selectedImage.uri,
          name: filename,
          type,
        } as any);
      }

      const response = await axios.post(
        `${API_URL}/update_profile_student.php`,
        formData,
        {
          headers: { 
            "Content-Type": "multipart/form-data",
          },
          timeout: 15000,
        }
      );

      if (response.data.success) {
        // Force live fetch to get updated data including avatar
        await fetchUserData(false, true);
        setSelectedImage(null);
        
        showUpdateModal(true, "Profile updated successfully");
        setIsEditing(false);
      } else {
        showUpdateModal(false, response.data.message || "Failed to update profile");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message ||
        "An error occurred while updating your profile";
      showUpdateModal(false, errorMessage);
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  // Reusable Info Item component - Fixed to prevent focus loss
  const InfoItem = React.memo<InfoItemProps>(({
    icon: Icon,
    label,
    value,
    editable = false,
    field,
    inputRef,
    keyboardType = 'default',
    autoCapitalize = 'none',
    multiline = false
  }) => {
    const onTextChange = useCallback((text: string) => {
      if (field) {
        handleTextChange(field, text);
      }
    }, [field, handleTextChange]);

    const handleSubmitEditing = useCallback(() => {
      if (field === 'first_name' && lastNameInputRef.current) {
        lastNameInputRef.current.focus();
      } else if (field === 'last_name' && contactInputRef.current) {
        contactInputRef.current.focus();
      }
    }, [field]);

    return (
      <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
        <View className="flex-row items-center flex-1">
          <View className="w-8 h-8 bg-gray-100 rounded-lg items-center justify-center mr-3">
            <Icon size={16} color="#8C2323" />
          </View>
          <View className="flex-1">
            <Text className="text-gray-500 text-sm mb-1">{label}</Text>
            {isEditing && editable ? (
              <TextInput
                ref={inputRef}
                className="text-gray-800 font-medium text-base bg-white p-2 rounded-lg border border-gray-200"
                value={field ? editData[field] || '' : ''}
                onChangeText={onTextChange}
                placeholder={`Enter ${label.toLowerCase()}`}
                autoCapitalize={autoCapitalize}
                autoCorrect={false}
                keyboardType={keyboardType}
                onSubmitEditing={handleSubmitEditing}
                returnKeyType={field === 'contact_number' ? 'done' : 'next'}
                blurOnSubmit={field === 'contact_number'}
                multiline={multiline}
                numberOfLines={multiline ? 3 : 1}
                textAlignVertical={multiline ? 'top' : 'center'}
              />
            ) : (
              <Text
                className="text-gray-800 font-medium text-base"
                numberOfLines={2}
              >
                {value || "Not provided"}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  });

  const NationalityInput = React.memo<NationalityInputProps>(({ value, label }) => {
    const displayValue = value === "Foreigner" && userData?.foreigner_specify 
      ? userData.foreigner_specify 
      : value;

    const handleForeignerSubmit = useCallback(() => {
      if (contactInputRef.current) {
        contactInputRef.current.focus();
      }
    }, []);

    return (
      <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
        <View className="flex-row items-center flex-1">
          <View className="w-8 h-8 bg-gray-100 rounded-lg items-center justify-center mr-3">
            <Globe size={16} color="#8C2323" />
          </View>
          <View className="flex-1">
            <Text className="text-gray-500 text-sm mb-1">{label}</Text>
            {isEditing ? (
              <View>
                <View className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-2">
                  <TouchableOpacity
                    className="flex-row justify-between items-center p-3"
                    onPress={() => handleNationalityTypeChange("Filipino")}
                  >
                    <Text className="text-gray-800">Filipino</Text>
                    <View className="w-5 h-5 rounded-full border-2 border-gray-300 items-center justify-center">
                      {nationalityType === "Filipino" && (
                        <View className="w-3 h-3 rounded-full bg-[#8C2323]" />
                      )}
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-row justify-between items-center p-3 border-t border-gray-100"
                    onPress={() => handleNationalityTypeChange("Foreigner")}
                  >
                    <Text className="text-gray-800">Foreigner</Text>
                    <View className="w-5 h-5 rounded-full border-2 border-gray-300 items-center justify-center">
                      {nationalityType === "Foreigner" && (
                        <View className="w-3 h-3 rounded-full bg-[#8C2323]" />
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
                
                {nationalityType === "Foreigner" && (
                  <TextInput
                    ref={customNationalityRef}
                    className="text-gray-800 font-medium text-base bg-white p-2 rounded-lg border border-gray-200"
                    value={editData.foreigner_specify || ''}
                    onChangeText={handleForeignerSpecifyChange}
                    placeholder="Specify your nationality"
                    autoCapitalize="words"
                    autoCorrect={false}
                    onSubmitEditing={handleForeignerSubmit}
                    returnKeyType="next"
                    blurOnSubmit={false}
                  />
                )}
              </View>
            ) : (
              <Text
                className="text-gray-800 font-medium text-base"
                numberOfLines={2}
              >
                {displayValue || "Not provided"}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  });

  const Section: React.FC<SectionProps> = ({ title, icon: Icon, children, isExpanded, onToggle }) => (
    <View className="bg-white rounded-xl shadow-sm p-5 mb-4">
      <TouchableOpacity
        className="flex-row items-center justify-between mb-4"
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-blue-100 rounded-lg items-center justify-center mr-3">
            <Icon size={20} color="#8C2323" />
          </View>
          <Text className="text-lg font-semibold text-gray-800">{title}</Text>
        </View>
        {isExpanded ? (
          <ChevronUp size={20} color="#6b7280" />
        ) : (
          <ChevronDown size={20} color="#6b7280" />
        )}
      </TouchableOpacity>

      {isExpanded && children}
    </View>
  );

  if (!user || !userData) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <View className="bg-white p-6 rounded-xl shadow-md w-80 items-center">
          <User size={64} color="#6b7280" />
          <Text className="text-lg font-medium text-gray-800 mt-4 mb-2">
            No User Data Found
          </Text>
          <Text className="text-gray-600 text-center mb-6">
            Your session appears to be invalid or expired.
          </Text>
          <TouchableOpacity
            className="bg-[#8C2323] rounded-lg p-3 w-full items-center"
            onPress={handleForceLogout}
          >
            <Text className="text-white font-medium">Return to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          ref={scrollViewRef}
          className={`flex-1 ${isGraduating ? "bg-blue-50" : "bg-gray-50"}`}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#8C2323"]}
              tintColor="#8C2323"
            />
          }
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full max-w-4xl mx-auto p-4">
            {/* Header with blue background for graduating students */}
            <View className={`items-center mb-6 ${isGraduating ? "bg-blue-600 p-5 rounded-xl" : ""}`}>
              <View className="relative mb-4">
                <TouchableOpacity onPress={showViewPhotoModal} activeOpacity={0.8}>
                  <View className="w-28 h-28 rounded-full border-4 border-white shadow-lg bg-white items-center justify-center overflow-hidden">
                    <Image
                      source={getAvatarSource() || require('@/assets/images/swu-head.png')}
                      className="w-full h-full"
                      resizeMode="cover"
                      onError={() => {
                        console.log("Avatar load error, using SWU head fallback");
                      }}
                    />
                  </View>
                  {isEditing && (
                    <TouchableOpacity 
                      className="absolute bottom-0 right-0 bg-[#8C2323] p-2 rounded-full shadow-md"
                      onPress={showAvatarModal}
                      activeOpacity={0.8}
                    >
                      <Camera size={16} color="white" />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
                
                <View className="flex   mt-3">
                  <TouchableOpacity
                    className={`flex-row gap-2 justify-center items-center p-2  px-5 rounded-[15px] shadow-md ${isGraduating ? "bg-white" : "bg-[#8C2323]"}`}
                    onPress={startEditing}
                    activeOpacity={0.8}
                  >
                   
                    <Text className={isGraduating ? "text-blue-600 font-medium" : "text-white font-medium"}>
                      {isEditing ? "Cancel" : "Edit Profile"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <Text className={`text-2xl font-bold text-center mb-1 ${isGraduating ? "text-white" : "text-gray-900"}`}>
                {userData.first_name} {userData.last_name}
              </Text>
        
            </View>

            {/* Personal Information Section */}
            <Section
              title="Personal Information"
              icon={User}
              isExpanded={expandedSections.personal}
              onToggle={() => toggleSection("personal")}
            >
              <InfoItem icon={IdCard} label="Student ID" value={userData.student_id} />
              <InfoItem
                icon={User}
                label="First Name"
                value={userData.first_name}
                editable
                field="first_name"
                inputRef={firstNameInputRef}
                autoCapitalize="words"
              />
              <InfoItem
                icon={User}
                label="Last Name"
                value={userData.last_name}
                editable
                field="last_name"
                inputRef={lastNameInputRef}
                autoCapitalize="words"
              />
              <NationalityInput
                label="Nationality"
                value={userData.nationality}
              />
            </Section>

            {/* Academic Information Section */}
            <Section
              title="Academic Information"
              icon={GraduationCap}
              isExpanded={expandedSections.academic}
              onToggle={() => toggleSection("academic")}
            >
              <InfoItem icon={BookOpen} label="Program" value={userData.program} />
              <InfoItem
                icon={School}
                label="Year Level"
                value={userData.year_level_name || userData.year_level_id?.toString() || "Not specified"}
              />
              <InfoItem
                icon={Calendar}
                label="Curriculum"
                value={userData.academic_year}
              />
            </Section>

            {/* Contact Information Section */}
            <Section
              title="Contact Information"
              icon={Mail}
              isExpanded={expandedSections.contact}
              onToggle={() => toggleSection("contact")}
            >
              <InfoItem icon={Mail} label="Email" value={userData.email} />
              <InfoItem
                icon={Phone}
                label="Contact Number"
                value={userData.contact_number}
                editable
                field="contact_number"
                inputRef={contactInputRef}
                keyboardType="phone-pad"
              />
            </Section>

            {/* Save Changes Button */}
            {isEditing && (
              <View className="bg-white rounded-xl  shadow-sm p-5 mb-4">
                <View className="flex-row justify-between space-x-3">
                  <TouchableOpacity
                    className="flex-1 px-4 py-3 border mr-3  border-gray-300 rounded-lg items-center"
                    onPress={cancelEditing}
                    disabled={isLoading}
                    activeOpacity={0.7}
                  >
                    <Text className="text-gray-800 font-medium">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 px-4 py-3 bg-[#8C2323] rounded-lg items-center flex-row justify-center"
                    onPress={handleUpdateProfile}
                    disabled={isLoading}
                    activeOpacity={0.7}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="white" size="small" className="mr-2" />
                    ) : (
                      <Text className="text-white font-medium">
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Text>
                    )}
                 
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Account Actions Section */}
            <View className="bg-white rounded-xl shadow-sm p-5 mb-16">
              <Text className="text-lg font-semibold text-gray-800 mb-4">
                Account Actions
              </Text>

              <Link href="/screens/change-password" asChild>
                <TouchableOpacity className="flex-row  items-center justify-between py-3 border-b border-gray-100" activeOpacity={0.7}>
                  <View className="flex-row items-center">
                    <View className="w-8 h-8 bg-green-100 rounded-lg items-center justify-center mr-3">
                      <Shield size={16} color="#10B981" />
                    </View>
                    <Text className="text-gray-800 font-medium">Change Password</Text>
                  </View>
                </TouchableOpacity>
              </Link>

              <TouchableOpacity
                className="flex-row items-center justify-between py-3"
                onPress={showLogoutModal}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <View className="w-8 h-8 bg-red-100 rounded-lg items-center justify-center mr-3">
                    <LogOut size={16} color="#dc2626" />
                  </View>
                  <Text className="text-red-600 font-medium">Log Out</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Avatar Selection Modal */}
            <Modal
              visible={isAvatarModalVisible}
              transparent
              animationType="fade"
              onRequestClose={hideAvatarModal}
            >
              <View className="flex-1 justify-center items-center bg-black/50 p-4">
                <View className="bg-white rounded-xl p-6 w-full max-w-md">
                  <View className="items-center mb-4">
                    <View className="bg-blue-100 p-4 rounded-full mb-3">
                      <Camera size={28} color="#2563EB" />
                    </View>
                    <Text className="text-xl font-bold text-gray-900">
                      Update Profile Picture
                    </Text>
                  </View>

                  <Text className="text-gray-600 text-center mb-6">
                    Choose how you want to update your profile picture
                  </Text>

                  <View className="space-y-3">
                    <TouchableOpacity
                      className="flex-row items-center py-4 px-4 bg-blue-50 rounded-xl"
                      onPress={() => pickImage(false)}
                      activeOpacity={0.7}
                    >
                      <View className="w-10 h-10 bg-blue-100 rounded-lg items-center justify-center mr-3">
                        <GalleryVertical 
                          className="w-6 h-6 text-blue-300"
                        />
                      </View>
                      <Text className="text-blue-600 font-medium">Choose from Gallery</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="flex-row items-center py-4 px-4 bg-green-50 rounded-xl"
                      onPress={() => pickImage(true)}
                      activeOpacity={0.7}
                    >
                      <View className="w-10 h-10 bg-green-100 rounded-lg items-center justify-center mr-3">
                        <Camera size={20} color="#16a34a" />
                      </View>
                      <Text className="text-green-800 font-medium">Take Photo</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    className="py-3 bg-gray-200 rounded-xl mt-4 items-center"
                    onPress={hideAvatarModal}
                    activeOpacity={0.7}
                  >
                    <Text className="text-gray-800 font-medium">Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            {/* View Photo Modal */}
            <Modal
              visible={isViewPhotoModalVisible}
              transparent
              animationType="fade"
              onRequestClose={hideViewPhotoModal}
            >
              <View className="flex-1 justify-center items-center bg-black/90 p-4">
                <TouchableOpacity 
                  className="absolute top-10 right-4 z-10"
                  onPress={hideViewPhotoModal}
                  activeOpacity={0.7}
                >
                  <View className="bg-white/20 p-2 rounded-full">
                    <X size={24} color="white" />
                  </View>
                </TouchableOpacity>
                
                <View className="w-80 h-80 rounded-lg bg-white items-center justify-center overflow-hidden">
                  <Image
                    source={getAvatarSource() || require('@/assets/images/swu-head.png')}
                    className="w-full h-full"
                    resizeMode="contain"
                  />
                </View>
                
                {isEditing && (
                  <TouchableOpacity
                    className="mt-6 bg-[#8C2323] rounded-lg px-6 py-3"
                    onPress={showAvatarModal}
                    activeOpacity={0.7}
                  >
                    <Text className="text-white font-medium">Change Photo</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Modal>

            {/* Logout Modal */}
            <Modal
              visible={isLogoutModalVisible}
              transparent
              animationType="fade"
              onRequestClose={hideLogoutModal}  
            >
              <View className="flex-1 justify-center items-center bg-black/50 p-4">
                <View className="bg-white rounded-xl p-6 w-full max-w-md">
                  <View className="items-center mb-4">
                    <View className="bg-red-100 p-4 rounded-full mb-3">
                      <LogOut size={28} color="#dc2626" />
                    </View>
                    <Text className="text-xl font-bold text-gray-900">
                      Confirm Logout
                    </Text>
                  </View>

                  <Text className="text-gray-600 text-center mb-6">
                    Are you sure you want to log out of your account?
                  </Text>

                  <View className="flex-row justify-between space-x-4">
                    <TouchableOpacity
                      className="flex-1 py-3 border  mr-3 border-gray-300 rounded-xl items-center"
                      onPress={hideLogoutModal}
                      activeOpacity={0.7}
                    >
                      <Text className="text-gray-800 font-medium">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 py-3 bg-red-500 rounded-xl items-center"
                      onPress={handleLogout}
                      activeOpacity={0.7}
                    >
                      <Text className="text-white font-medium">Log Out</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            {/* Update Status Modal */}
            <Modal
              visible={updateModal.visible}
              transparent
              animationType="fade"
              onRequestClose={hideUpdateModal}
            >
              <View className="flex-1 justify-center items-center bg-black/50 p-4">
                <View className="bg-white rounded-xl p-6 w-full max-w-md">
                  <View className="items-center mb-4">
                    <View className={`p-4 rounded-full mb-3 ${updateModal.success ? "bg-green-100" : "bg-red-100"}`}>
                      {updateModal.success ? (
                        <CheckCircle size={28} color="#10B981" />
                      ) : (
                        <XCircle size={28} color="#dc2626" />
                      )}
                    </View>
                    <Text className={`text-xl font-bold ${updateModal.success ? "text-green-800" : "text-red-800"}`}>
                      {updateModal.success ? "Success" : "Error"}
                    </Text>
                  </View>

                  <Text className="text-gray-600 text-center mb-6">
                    {updateModal.message}
                  </Text>

                  <TouchableOpacity
                    className={`py-3 rounded-xl items-center ${updateModal.success ? "bg-green-500" : "bg-red-500"}`}
                    onPress={hideUpdateModal}
                    activeOpacity={0.7}
                  >
                    <Text className="text-white font-medium">OK</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}