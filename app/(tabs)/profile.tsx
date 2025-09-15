import { useAuth } from "@/contexts/AuthContext";
import { 
  User, 
  Edit2, 
  Settings, 
  Lock, 
  Moon, 
  LogOut, 
  ChevronRight, 
  X,
  Mail,
  Phone,
  BookOpen,
  GraduationCap,
  Globe,
  IdCard,
  Calendar,
  MapPin,
  School
} from "lucide-react-native";
import axios from "axios";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  RefreshControl,
  ScrollView,
  Modal,
  Switch,
  Dimensions
} from "react-native";

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const [editData, setEditData] = useState({
    first_name: "",
    last_name: "",
    nationality: "",
    contact_number: "",
  });
  const { user, login, logout, clearUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      clearUser();
      router.replace("/auth/login");
    }
  }, [user]);

  const showLogoutModal = () => setLogoutModalVisible(true);
  const hideLogoutModal = () => setLogoutModalVisible(false);

  const handleLogout = async () => {
    await logout();
    hideLogoutModal();
    router.replace("/auth/login");
  };

  const handleForceLogout = async () => {
    await clearUser();
    router.replace("/auth/login");
  };

  const fetchUserData = async () => {
    if (!user?.id) return;
    
    try {
      const response = await axios.post(
        "https://msis.eduisync.io/api/get_user_data.php",
        { user_id: user.id },
        { timeout: 10000 }
      );

      if (response.data.success && response.data.user) {
        await login(response.data.user);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  };

  const startEditing = () => {
    setEditData({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      nationality: user.nationality || "",
      contact_number: user.contact_number || "",
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditData({
      first_name: "",
      last_name: "",
      nationality: "",
      contact_number: "",
    });
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    // Validate input fields
    if (!editData.first_name.trim()) {
      Alert.alert("Error", "First name is required");
      return;
    }

    if (!editData.last_name.trim()) {
      Alert.alert("Error", "Last name is required");
      return;
    }

    if (
      editData.contact_number &&
      !/^[\d\s\-\+\(\)]{10,15}$/.test(editData.contact_number)
    ) {
      Alert.alert("Error", "Please enter a valid contact number");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("user_id", user.id);

      // Only include fields that have changed
      if (editData.first_name !== user.first_name) {
        formData.append("first_name", editData.first_name.trim());
      }
      if (editData.last_name !== user.last_name) {
        formData.append("last_name", editData.last_name.trim());
      }
      if (editData.nationality !== user.nationality) {
        formData.append("nationality", editData.nationality.trim());
      }
      if (editData.contact_number !== user.contact_number) {
        formData.append("contact_number", editData.contact_number.trim());
      }

      // Check if there are any fields to update
      if (formData._parts.length <= 1) {
        Alert.alert("Info", "No changes detected");
        cancelEditing();
        return;
      }

      const response = await axios.post(
        "https://msis.eduisync.io/api/update_profile_student.php",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 10000,
        }
      );

      if (response.data.success) {
        await fetchUserData();
        Alert.alert("Success", "Profile updated successfully");
        cancelEditing();
      } else {
        let errorMessage = "Failed to update profile";
        if (response.data.message) {
          errorMessage = response.data.message;
        } else if (response.data.error) {
          errorMessage = response.data.error;
        }
        Alert.alert("Error", errorMessage);
      }
    } catch (error) {
      console.error("Update error:", error);
      let errorMessage = "An error occurred while updating your profile";

      if (error.response) {
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 400) {
          errorMessage = "Invalid request. Please check your input and try again.";
        } else if (error.response.status === 404) {
          errorMessage = "Server endpoint not found. Please contact support.";
        } else if (error.response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        }
      } else if (error.request) {
        errorMessage = "No response from server. Please check your internet connection.";
      } else if (error.code === "ECONNABORTED") {
        errorMessage = "Request timeout. Please try again.";
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
        <View className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md w-80 items-center">
          <User size={64} color="#6b7280" />
          <Text className="text-lg font-medium text-gray-800 dark:text-white mt-4 mb-2">
            No User Data Found
          </Text>
          <Text className="text-gray-600 dark:text-gray-300 text-center mb-6">
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

  // Information card component
  const InfoCard = ({ icon: Icon, title, value, editable = false, field = null, isEditing = false }) => (
    <View className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 flex-1 m-1 min-w-[45%]">
      <View className="flex-row items-center mb-2">
        <View className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-2">
          <Icon size={16} color="#8C2323" />
        </View>
        <Text className="text-gray-500 dark:text-gray-400 text-xs font-medium">
          {title}
        </Text>
      </View>
      {isEditing && editable ? (
        <TextInput
          className="text-gray-800 dark:text-white font-semibold text-sm bg-white dark:bg-gray-600 p-2 rounded-lg"
          value={editData[field]}
          onChangeText={(text) => setEditData({ ...editData, [field]: text })}
          placeholder={`Enter ${title.toLowerCase()}`}
        />
      ) : (
        <Text className="text-gray-800 dark:text-white font-semibold text-sm" numberOfLines={1}>
          {value || "Not provided"}
        </Text>
      )}
    </View>
  );

  return (
    <ScrollView 
      className="flex-1 bg-gray-50 dark:bg-gray-900"
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
        {/* Profile Header */}
        <View className="items-center mb-6">
          <View className="relative mb-4">
            <Image
              source={{ uri: user.avatar || "https://i.pravatar.cc/150" }}
              className="w-28 h-28 rounded-full border-4 border-white dark:border-gray-800 shadow-lg"
            />
            <TouchableOpacity
              className="absolute bottom-1 right-1 bg-[#8C2323] p-2 rounded-full shadow-md"
              onPress={startEditing}
            >
              <Edit2 size={16} color="white" />
            </TouchableOpacity>
          </View>

          <Text className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-1">
            {user.first_name} {user.last_name}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400">
            {user.student_id}
          </Text>
        </View>

        {/* Personal Information Card */}
        <View className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 mb-5">
          <View className="flex-row items-center justify-between mb-5">
            <View className="flex-row items-center">
              <View className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                <User size={20} color="#8C2323" />
              </View>
              <Text className="text-lg font-semibold text-gray-800 dark:text-white ml-3">
                Personal Information
              </Text>
            </View>
            {!isEditing && (
              <TouchableOpacity
                onPress={startEditing}
                className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg"
              >
                <Edit2 size={18} color="#6b7280" />
              </TouchableOpacity>
            )}
          </View>

          {/* Two-column grid for information */}
          <View className="flex-row flex-wrap justify-between mb-2">
            <InfoCard
              icon={IdCard}
              title="Student ID"
              value={user.student_id}
              isEditing={isEditing}
            />
            <InfoCard
              icon={User}
              title="First Name"
              value={user.first_name}
              editable={true}
              field="first_name"
              isEditing={isEditing}
            />
            <InfoCard
              icon={User}
              title="Last Name"
              value={user.last_name}
              editable={true}
              field="last_name"
              isEditing={isEditing}
            />
            <InfoCard
              icon={Globe}
              title="Nationality"
              value={user.nationality}
              editable={true}
              field="nationality"
              isEditing={isEditing}
            />
            <InfoCard
              icon={Mail}
              title="Email"
              value={user.email}
              isEditing={isEditing}
            />
            <InfoCard
              icon={Phone}
              title="Contact"
              value={user.contact_number}
              editable={true}
              field="contact_number"
              isEditing={isEditing}
            />
            <InfoCard
              icon={GraduationCap}
              title="Program"
              value={user.program}
              isEditing={isEditing}
            />
            <InfoCard
              icon={BookOpen}
              title="Curriculum"
              value={user.academic_year}
              isEditing={isEditing}
            />
          </View>

          {/* Save and Cancel Buttons */}

          {/* Edit Action Buttons */}
          {isEditing && (
            <View className="flex-row justify-end space-x-3 mt-6">
              <TouchableOpacity
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                onPress={cancelEditing}
              >
                <Text className="text-gray-800 dark:text-white">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="px-4 py-2 bg-[#8C2323] rounded-lg flex-row items-center"
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
          )}
        </View>

        {/* Settings Card */}
        <View className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 mb-5">
          <View className="flex-row items-center mb-5">
            <View className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
              <Settings size={20} color="#8C2323" />
            </View>
            <Text className="text-lg font-semibold text-gray-800 dark:text-white ml-3">
              Settings
            </Text>
          </View>

          <View className="space-y-4">
            {/* Change Password */}
            <TouchableOpacity className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center">
                <View className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                  <Lock size={18} color="#10B981" />
                </View>
                <View className="ml-3">
                  <Text className="text-gray-800 dark:text-white font-medium">
                    Change Password
                  </Text>
                  <Text className="text-gray-500 dark:text-gray-400 text-sm">
                    Update your security password
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color="#d1d5db" />
            </TouchableOpacity>

            {/* Appearance */}
            <View className="flex-row items-center justify-between py-3">
              <View className="flex-row items-center">
                <View className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                  <Moon size={18} color="#8B5CF6" />
                </View>
                <View className="ml-3">
                  <Text className="text-gray-800 dark:text-white font-medium">
                    Dark Mode
                  </Text>
                  <Text className="text-gray-500 dark:text-gray-400 text-sm">
                    Switch between themes
                  </Text>
                </View>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={setIsDarkMode}
                trackColor={{ false: "#767577", true: "#8C2323" }}
                thumbColor={isDarkMode ? "#f4f3f4" : "#f4f3f4"}
              />
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl p-4 flex-row items-center justify-center mb-16"
          onPress={showLogoutModal}
        >
          <View className="bg-red-100 dark:bg-red-800 p-2 rounded-lg">
            <LogOut size={18} color="#dc2626" />
          </View>
          <Text className="text-red-600 dark:text-red-400 font-medium ml-3">
            Log Out
          </Text>
        </TouchableOpacity>

        {/* Logout Confirmation Modal */}
        <Modal
          visible={isLogoutModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={hideLogoutModal}
        >
          <View className="flex-1 justify-center items-center bg-black/50 p-4">
            <View className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
              <View className="items-center mb-4">
                <View className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full mb-3">
                  <LogOut size={28} color="#dc2626" />
                </View>
                <Text className="text-xl font-bold text-gray-900 dark:text-white">
                  Confirm Logout
                </Text>
              </View>

              <Text className="text-gray-600 dark:text-gray-300 text-center mb-6">
                Are you sure you want to log out of your account?
              </Text>

              <View className="flex-row justify-between space-x-4">
                <TouchableOpacity
                  className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-xl items-center"
                  onPress={hideLogoutModal}
                >
                  <Text className="text-gray-800 dark:text-white font-medium">
                    Cancel
                  </Text>
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
      </View>
    </ScrollView>
  );
}