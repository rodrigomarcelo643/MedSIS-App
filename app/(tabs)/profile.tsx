import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { useRouter } from "expo-router";
import {
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Edit2,
  Globe,
  GraduationCap,
  IdCard,
  LogOut,
  Mail,
  Phone,
  School,
  Shield,
  User,
  XCircle,
} from "lucide-react-native";
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "https://msis.eduisync.io/api";

export default function ProfileScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    academic: true,
    contact: true,
  });
  const [editData, setEditData] = useState({
    first_name: "",
    last_name: "",
    nationality: "",
    contact_number: "",
  });
  const [userData, setUserData] = useState(null);
  const [updateModal, setUpdateModal] = useState({
    visible: false,
    success: false,
    message: "",
  });

  const { user, login, logout, clearUser } = useAuth();
  const router = useRouter();
  const editDataRef = useRef(editData); // Ref to track editData without re-renders

  // Update ref when editData changes
  useEffect(() => {
    editDataRef.current = editData;
  }, [editData]);

  // Check if user is graduating (year level 4)
  const isGraduating = userData?.year_level_id === 4;

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchUserData = useCallback(async (showLoading = true) => {
    const uid = user?.id || user?.user_id;
    if (!uid) return;

    if (showLoading) setIsLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/get_user_data.php`,
        { user_id: uid },
        {
          timeout: 10000,
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.success && response.data.user) {
        setUserData(response.data.user);
        // Update auth context with latest data including year_level_id
        await login(response.data.user);
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
  }, [user, login, clearUser, router]);

  useEffect(() => {
    if (!user) {
      clearUser();
      router.replace("/auth/login");
    } else {
      setUserData(user);
      // Only fetch if we don't have complete data
      if (!user.program || !user.academic_year) {
        fetchUserData(false);
      }
    }
  }, [user]);

  useEffect(() => {
    // Reset edit data when userData changes (but not when editing)
    if (userData && !isEditing) {
      setEditData({
        first_name: userData.first_name || "",
        last_name: userData.last_name || "",
        nationality: userData.nationality || "",
        contact_number: userData.contact_number || "",
      });
    }
  }, [userData, isEditing]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const showLogoutModal = () => setLogoutModalVisible(true);
  const hideLogoutModal = () => setLogoutModalVisible(false);

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
    await fetchUserData(false);
    setRefreshing(false);
  };

  const startEditing = () => {
    if (isEditing) {
      cancelEditing();
    } else {
      // Set edit data to current user data when starting to edit
      setEditData({
        first_name: userData?.first_name || "",
        last_name: userData?.last_name || "",
        nationality: userData?.nationality || "",
        contact_number: userData?.contact_number || "",
      });
      setIsEditing(true);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    // Reset edit data to current user data
    setEditData({
      first_name: userData?.first_name || "",
      last_name: userData?.last_name || "",
      nationality: userData?.nationality || "",
      contact_number: userData?.contact_number || "",
    });
  };

  const handleUpdateProfile = async () => {
    if (!user || !userData) return;

    // Use ref value to get the latest editData without re-render dependency
    const currentEditData = editDataRef.current;

    if (!currentEditData.first_name.trim() || !currentEditData.last_name.trim()) {
      showUpdateModal(false, "First and Last name are required");
      return;
    }

    const changes: Record<string, string> = {};
    if (currentEditData.first_name !== userData.first_name)
      changes.first_name = currentEditData.first_name.trim();
    if (currentEditData.last_name !== userData.last_name)
      changes.last_name = currentEditData.last_name.trim();
    if (currentEditData.nationality !== userData.nationality)
      changes.nationality = currentEditData.nationality.trim();
    if (currentEditData.contact_number !== userData.contact_number)
      changes.contact_number = currentEditData.contact_number.trim();

    if (Object.keys(changes).length === 0) {
      showUpdateModal(false, "No changes detected");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("user_id", user.id);
      Object.entries(changes).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await axios.post(
        `${API_URL}/update_profile_student.php`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 10000,
        }
      );

      if (response.data.success) {
        // Update both context and local state
        const updatedUser = { ...userData, ...changes };
        await login(updatedUser);
        setUserData(updatedUser);
        
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
    }
  };

  // Reusable Info Item component with optimized input handling
  const InfoItem = React.memo(({
    icon: Icon,
    label,
    value,
    editable = false,
    field = null,
  }) => {
    const handleTextChange = (text: string) => {
      setEditData(prev => ({ ...prev, [field]: text }));
    };

    return (
      <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
        <View className="flex-row items-center flex-1">
          <View className="w-8 h-8 bg-gray-100 rounded-lg items-center justify-center mr-3">
            <Icon size={16} color="#8C2323" />
          </View>
          <View className="flex-1">
            <Text className="text-gray-500 text-sm">{label}</Text>
            {isEditing && editable ? (
              <TextInput
                className="text-gray-800 font-medium text-base bg-white p-2 rounded-lg border border-gray-200 mt-1"
                value={editData[field]}
                onChangeText={handleTextChange}
                placeholder={`Enter ${label.toLowerCase()}`}
                autoCapitalize={field === 'first_name' || field === 'last_name' ? 'words' : 'none'}
                autoCorrect={true}
                keyboardType={field === 'contact_number' ? 'phone-pad' : 'default'}
              />
            ) : (
              <Text
                className="text-gray-800 font-medium text-base"
                numberOfLines={1}
              >
                {value || "Not provided"}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  });

  const Section = ({ title, icon: Icon, children, isExpanded, onToggle }) => (
    <View className="bg-white rounded-xl shadow-sm p-5 mb-4">
      <TouchableOpacity
        className="flex-row items-center justify-between mb-4"
        onPress={onToggle}
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
    <ScrollView
      className={`flex-1 ${isGraduating ? "bg-blue-50" : "bg-gray-50"}`}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#8C2323"]}
          tintColor="#8C2323"
        />
      }
    >
      <View className="w-full max-w-4xl mx-auto p-4">
        {/* Header with blue background for graduating students */}
        <View className={`items-center mb-6 ${isGraduating ? "bg-blue-600 p-5 rounded-xl" : ""}`}>
          <View className="relative mb-4">
            <Image
              source={{ uri: userData.avatar|| "https://i.pravatar.cc/150" }}
              className="w-28 h-28 rounded-full border-4 border-white shadow-lg"
            />
            <View className="flex mt-3">
              <TouchableOpacity
                className={`flex-row gap-2 justify-center items-center p-2 rounded-[15px] shadow-md ${isGraduating ? "bg-white" : "bg-[#8C2323]"}`}
                onPress={startEditing}
              >
                <Text className={isGraduating ? "text-blue-600" : "text-white"}>
                  {isEditing ? "Cancel" : "Edit"}
                </Text>
                <Edit2 size={16} color={isGraduating ? "#2563EB" : "white"} />
              </TouchableOpacity>
            </View>
          </View>

          <Text className={`text-2xl font-bold text-center mb-1 ${isGraduating ? "text-white" : "text-gray-900"}`}>
            {userData.first_name} {userData.last_name}
          </Text>
          <Text className={isGraduating ? "text-blue-100" : "text-gray-500"}>
            {userData.student_id}
            {isGraduating && " • Graduating Student"}
          </Text>
        </View>

        {/* Personal */}
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
          />
          <InfoItem
            icon={User}
            label="Last Name"
            value={userData.last_name}
            editable
            field="last_name"
          />
          <InfoItem
            icon={Globe}
            label="Nationality"
            value={userData.nationality}
            editable
            field="nationality"
          />
        </Section>

        {/* Academic */}
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
            value={userData.year_level_name || userData.year_level_id || "Not specified"}
          />
          <InfoItem
            icon={Calendar}
            label="Academic Year"
            value={userData.academic_year}
          />
        </Section>

        {/* Contact */}
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
          />
        </Section>

        {/* Save Changes */}
        {isEditing && (
          <View className="bg-white rounded-xl shadow-sm p-5 mb-4">
            <View className="flex-row justify-between space-x-3">
              <TouchableOpacity
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg items-center"
                onPress={cancelEditing}
              >
                <Text className="text-gray-800 font-medium">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 px-4 py-3 bg-[#8C2323] rounded-lg items-center"
                onPress={handleUpdateProfile}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-white font-medium">Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Account Actions */}
        <View className="bg-white rounded-xl shadow-sm p-5 mb-16">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            Account Actions
          </Text>

          <TouchableOpacity className="flex-row items-center justify-between py-3 border-b border-gray-100">
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-green-100 rounded-lg items-center justify-center mr-3">
                <Shield size={16} color="#10B981" />
              </View>
              <Text className="text-gray-800 font-medium">Change Password</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between py-3"
            onPress={showLogoutModal}
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 bg-red-100 rounded-lg items-center justify-center mr-3">
                <LogOut size={16} color="#dc2626" />
              </View>
              <Text className="text-red-600 font-medium">Log Out</Text>
            </View>
          </TouchableOpacity>
        </View>
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
                  className="flex-1 py-3 border border-gray-300 rounded-xl items-center"
                  onPress={hideLogoutModal}
                >
                  <Text className="text-gray-800 font-medium">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 py-3 bg-red-500 rounded-xl items-center"
                  onPress={handleLogout}
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
              >
                <Text className="text-white font-medium">OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}