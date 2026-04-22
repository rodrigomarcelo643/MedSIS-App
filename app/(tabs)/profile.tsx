import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from '@/constants/Config';
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import ProfileSkeleton from '@/components/ProfileSkeleton';
import axios from "axios";
import { launchCameraAsync, launchImageLibraryAsync, requestCameraPermissionsAsync, requestMediaLibraryPermissionsAsync, ImagePickerAsset } from 'expo-image-picker';
import { useRouter } from "expo-router";
import {
  BookOpen,
  Calendar,
  Globe,
  GraduationCap,
  IdCard,
  Mail,
  Phone,
  School,
  User,
} from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { UserData, EditData, ExpandedSections, UpdateModal } from '@/@types/tabs';

// Import modular components
import { Section, InfoItem, EditableField, GenderInput, NationalityInput } from "@/components/profile/ProfileFields";
import { AvatarModal, ViewPhotoModal, LogoutModal, StatusModal } from "@/components/profile/ProfileModals";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileAccountActions } from "@/components/profile/ProfileAccountActions";

const API_URL = `${API_BASE_URL}/api`;

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
    gender: "",
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
  const [selectedImage, setSelectedImage] = useState<ImagePickerAsset | null>(null);
  const [nationalityType, setNationalityType] = useState("Filipino");
  const [hasInitiallyFetched, setHasInitiallyFetched] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { user, logout, clearUser, login, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Theme Change 
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const mutedColor = useThemeColor({}, 'muted');

  const router = useRouter();
  const editDataRef = useRef<EditData>(editData);
  const firstNameInputRef = useRef<any | null>(null);
  const lastNameInputRef = useRef<any | null>(null);
  const contactInputRef = useRef<any | null>(null);
  const customNationalityRef = useRef<any | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Update ref when editData changes
  useEffect(() => {
    editDataRef.current = editData;
  }, [editData]);

  // Check if user is graduating (year level 4)
  const isGraduating = userData?.year_level_id === 4;

  // Get avatar source
  const getAvatarSource = () => {
    if (selectedImage) return { uri: selectedImage.uri };
    if (userData?.avatar_data) return { uri: userData.avatar_data };
    if (userData?.avatar_url) {
      return userData.avatar_url.startsWith('http') 
        ? { uri: userData.avatar_url } 
        : { uri: `${API_URL}/../${userData.avatar_url}` };
    }
    if (userData?.avatar) {
      return userData.avatar.startsWith('http') 
        ? { uri: userData.avatar } 
        : { uri: `${API_URL}/../${userData.avatar}` };
    }
    return require('../../assets/swu_header.jpg');
  };

  // Request permissions
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status: cameraStatus } = await requestCameraPermissionsAsync();
        const { status: libraryStatus } = await requestMediaLibraryPermissionsAsync();
        if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
          Alert.alert('Permission Required', 'We need camera and gallery permissions.');
        }
      }
    })();
  }, []);

  // Fetch function
  const fetchUserData = useCallback(async (showLoading = true, forceLiveFetch = false) => {
    const uid = user?.id;
    if (!uid || isEditing) return;

    if (showLoading) setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/get_user_data.php`, {
        method: 'POST',
        body: JSON.stringify({ user_id: uid, live_fetch: forceLiveFetch || !hasInitiallyFetched }),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.user) {
        setUserData(data.user);
        await login(data.user);
        if (!hasInitiallyFetched) setHasInitiallyFetched(true);
        
        if (data.user.nationality) {
          setNationalityType(data.user.nationality === "Filipino" ? "Filipino" : "Foreigner");
        }
      } else if (data.message?.includes("deactivated")) {
        await clearUser();
        router.replace("/auth/login");
      }
    } catch (error) {
      if ((error as any).response?.status === 403 || (error as any).response?.status === 404) {
        await clearUser();
        router.replace("/auth/login");
      }
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [user, login, clearUser, router, hasInitiallyFetched, isEditing]);

  useEffect(() => {
    if (!user) {
      clearUser();
      router.replace("/auth/login");
    } else {
      setUserData(user as any);
      if (!hasInitiallyFetched && !isEditing) fetchUserData(true, true);
    }
  }, [user, hasInitiallyFetched, fetchUserData, isEditing, clearUser, router]);

  useEffect(() => {
    if (userData && !isEditing) {
      setEditData({
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        gender: userData.gender || "",
        nationality: userData.nationality || "",
        foreigner_specify: userData.foreigner_specify || "",
        contact_number: userData.contact_number || "",
      });
      if (userData.nationality) {
        setNationalityType(userData.nationality === "Filipino" ? "Filipino" : "Foreigner");
      }
    }
  }, [userData, isEditing]);

  const toggleSection = (section: keyof ExpandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setLogoutModalVisible(false);
    router.replace("/auth/login");
  };

  const handleForceLogout = async () => {
    setIsLoggingOut(true);
    await clearUser();
    router.replace("/auth/login");
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData(false, true);
    setRefreshing(false);
  };

  const startEditing = () => {
    if (isEditing) cancelEditing();
    else setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setSelectedImage(null);
    if (userData) {
      setEditData({
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        gender: userData.gender || "",
        nationality: userData.nationality || "",
        foreigner_specify: userData.foreigner_specify || "",
        contact_number: userData.contact_number || "",
      });
      setNationalityType(userData.nationality === "Filipino" ? "Filipino" : "Foreigner");
    }
  };

  const pickImage = async (useCamera = false) => {
    try {
      const options: any = { mediaTypes: 'images', allowsEditing: true, aspect: [1, 1], quality: 0.8 };
      const result = useCamera ? await launchCameraAsync(options) : await launchImageLibraryAsync(options);
      if (!result.canceled) {
        setSelectedImage(result.assets[0]);
        setAvatarModalVisible(false);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleUpdateProfile = async () => {
    if (!user || !userData) return;

    const currentEditData = {
      ...editDataRef.current,
      first_name: editDataRef.current.first_name || userData.first_name || '',
      last_name: editDataRef.current.last_name || userData.last_name || '',
    };

    if (!currentEditData.first_name.trim() || !currentEditData.last_name.trim()) {
      setUpdateModal({ visible: true, success: false, message: "First and Last name are required" });
      return;
    }

    if (nationalityType === "Foreigner" && !currentEditData.foreigner_specify.trim()) {
      setUpdateModal({ visible: true, success: false, message: "Please specify your nationality" });
      return;
    }

    const changes: Record<string, string> = {};
    if (currentEditData.first_name !== userData.first_name) changes.first_name = currentEditData.first_name.trim();
    if (currentEditData.last_name !== userData.last_name) changes.last_name = currentEditData.last_name.trim();
    if (currentEditData.gender !== (userData.gender || "")) changes.gender = currentEditData.gender.trim();
    if (currentEditData.nationality !== userData.nationality) changes.nationality = currentEditData.nationality.trim();
    if (currentEditData.foreigner_specify !== userData.foreigner_specify) changes.foreigner_specify = (currentEditData.foreigner_specify || '').trim();
    if (currentEditData.contact_number !== userData.contact_number) changes.contact_number = currentEditData.contact_number.trim();

    if (Object.keys(changes).length === 0 && !selectedImage) {
      setUpdateModal({ visible: true, success: false, message: "No changes detected" });
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("user_id", user.id);
      Object.entries(changes).forEach(([key, value]) => formData.append(key, value));

      if (selectedImage) {
        const filename = selectedImage.uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename || '');
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        formData.append('avatar', { uri: selectedImage.uri, name: filename, type } as any);
      }

      console.log("Updating profile at:", `${API_URL}/update_profile_student.php`);
      console.log("Payload keys:", Object.keys(changes), "Has Image:", !!selectedImage);

      const response = await fetch(`${API_URL}/update_profile_student.php`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Profile Update Response:", data);

      if (data.success) {
        if (Object.keys(changes).length > 0) await updateUser(changes);
        await fetchUserData(false, true);
        setSelectedImage(null);
        setIsEditing(false);
        setUpdateModal({ visible: true, success: true, message: "Profile updated successfully" });
      } else {
        setUpdateModal({ visible: true, success: false, message: data.message || "Failed to update profile" });
      }
    } catch (error) {
      setUpdateModal({ visible: true, success: false, message: "An error occurred while updating your profile" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleValueChange = (field: keyof EditData, text: string) => {
    editDataRef.current = { ...editDataRef.current, [field]: text };
  };

  if ((!user || !userData) && !isLoggingOut) {
    if (!hasInitiallyFetched) return <ProfileSkeleton />;
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <View className="bg-white p-6 rounded-xl shadow-md w-80 items-center">
          <User size={64} color="#6b7280" />
          <Text className="text-lg font-medium text-gray-800 mt-4 mb-2">No User Data Found</Text>
          <Text className="text-gray-600 text-center mb-6">Your session appears to be invalid or expired.</Text>
          <TouchableOpacity className="bg-[#8C2323] rounded-lg p-3 w-full items-center" onPress={handleForceLogout}>
            <Text className="text-white font-medium">Return to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isLoggingOut) return null;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1, backgroundColor: isGraduating ? '#dbeafe' : backgroundColor }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#8C2323"]} tintColor="#8C2323" />}
          keyboardShouldPersistTaps="handled"
        >
          <View className="w-full max-w-4xl mx-auto p-4">
            <ProfileHeader
              isGraduating={isGraduating}
              isEditing={isEditing}
              userData={userData}
              avatarSource={getAvatarSource()}
              textColor={textColor}
              onShowViewPhoto={() => setViewPhotoModalVisible(true)}
              onShowAvatarModal={() => setAvatarModalVisible(true)}
              onStartEditing={startEditing}
            />

            <Section title="Personal Information" icon={User} isExpanded={expandedSections.personal} onToggle={() => toggleSection("personal")} cardColor={cardColor} textColor={textColor}>
              <InfoItem icon={IdCard} label="Student ID" value={userData?.student_id} theme={theme} borderColor={borderColor} mutedColor={mutedColor} textColor={textColor} />
              <EditableField icon={User} label="First Name" value={userData?.first_name} field="first_name" isEditing={isEditing} theme={theme} borderColor={borderColor} mutedColor={mutedColor} textColor={textColor} inputRef={firstNameInputRef} autoCapitalize="words" onValueChange={handleValueChange} />
              <EditableField icon={User} label="Last Name" value={userData?.last_name} field="last_name" isEditing={isEditing} theme={theme} borderColor={borderColor} mutedColor={mutedColor} textColor={textColor} inputRef={lastNameInputRef} autoCapitalize="words" onValueChange={handleValueChange} />
              <GenderInput label="Sex" value={userData?.gender} isEditing={isEditing} theme={theme} borderColor={borderColor} mutedColor={mutedColor} textColor={textColor} cardColor={cardColor} onGenderChange={(gender) => handleValueChange("gender", gender)} />
              <NationalityInput label="Nationality" value={userData?.nationality} isEditing={isEditing} theme={theme} borderColor={borderColor} mutedColor={mutedColor} textColor={textColor} cardColor={cardColor} nationalityType={nationalityType} onNationalityTypeChange={setNationalityType} customNationalityRef={customNationalityRef} foreignerSpecify={userData?.foreigner_specify || ""} onValueChange={handleValueChange} />
              {userData?.nationality === "Foreigner" && userData?.foreigner_specify && !isEditing && (
                <InfoItem icon={Globe} label="Specified Nationality" value={userData?.foreigner_specify} theme={theme} borderColor={borderColor} mutedColor={mutedColor} textColor={textColor} />
              )}
            </Section>

            <Section title="Academic Information" icon={GraduationCap} isExpanded={expandedSections.academic} onToggle={() => toggleSection("academic")} cardColor={cardColor} textColor={textColor}>
              <InfoItem icon={BookOpen} label="Program" value={userData?.program} theme={theme} borderColor={borderColor} mutedColor={mutedColor} textColor={textColor} />
              <InfoItem icon={School} label="Year Level" value={userData?.year_level_name || userData?.year_level_id?.toString() || "Not specified"} theme={theme} borderColor={borderColor} mutedColor={mutedColor} textColor={textColor} />
              <InfoItem icon={Calendar} label="Curriculum" value={userData?.academic_year} theme={theme} borderColor={borderColor} mutedColor={mutedColor} textColor={textColor} />
            </Section>

            <Section title="Contact Information" icon={Mail} isExpanded={expandedSections.contact} onToggle={() => toggleSection("contact")} cardColor={cardColor} textColor={textColor}>
              <InfoItem icon={Mail} label="Email" value={userData?.email} theme={theme} borderColor={borderColor} mutedColor={mutedColor} textColor={textColor} />
              <EditableField icon={Phone} label="Contact Number" value={userData?.contact_number} field="contact_number" isEditing={isEditing} theme={theme} borderColor={borderColor} mutedColor={mutedColor} textColor={textColor} inputRef={contactInputRef} keyboardType="phone-pad" onValueChange={handleValueChange} />
            </Section>

            {isEditing && (
              <View className="bg-white rounded-xl shadow-sm p-5 mb-4" style={{ backgroundColor: cardColor }}>
                <View className="flex-row justify-between">
                  <TouchableOpacity className="flex-1 px-4 py-3 border mr-3 border-gray-300 rounded-lg items-center" onPress={cancelEditing} disabled={isLoading}>
                    <Text style={{color: textColor}}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-1 px-4 py-3 bg-[#8C2323] rounded-lg items-center flex-row justify-center" onPress={handleUpdateProfile} disabled={isLoading}>
                    {isLoading ? <ActivityIndicator color="white" size="small" className="mr-2" /> : <Text className="text-white font-medium">Save Changes</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <ProfileAccountActions 
              theme={theme} 
              textColor={textColor} 
              cardColor={cardColor} 
              onToggleTheme={toggleTheme} 
              onShowLogoutModal={() => setLogoutModalVisible(true)} 
            />

            <AvatarModal visible={isAvatarModalVisible} onClose={() => setAvatarModalVisible(false)} onPickImage={pickImage} theme={theme} textColor={textColor} cardColor={cardColor} />
            <ViewPhotoModal visible={isViewPhotoModalVisible} onClose={() => setViewPhotoModalVisible(false)} avatarSource={getAvatarSource()} isEditing={isEditing} onShowAvatarModal={() => setAvatarModalVisible(true)} />
            <LogoutModal visible={isLogoutModalVisible} onClose={() => setLogoutModalVisible(false)} onLogout={handleLogout} />
            <StatusModal visible={updateModal.visible} onClose={() => setUpdateModal({ ...updateModal, visible: false })} updateStatus={updateModal} />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}