import { API_BASE_URL } from '@/constants/Config';
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Check, Eye, EyeOff, Key, X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const ResetPasswordScreen = () => {
  const { email } = useLocalSearchParams();
  const router = useRouter();
  
  const [passwords, setPasswords] = useState({
    new_password: "",
    confirm_password: "",
  });
  
  const [state, setState] = useState({
    loading: false,
    showNewPassword: false,
    showConfirmPassword: false,
    isNewPasswordFocused: false,
    isConfirmPasswordFocused: false,
  });

  const [passwordValidation, setPasswordValidation] = useState({
    hasMinLength: false,
    hasSpecialChar: false,
    hasNumber: false,
    hasUpperCase: false,
    isNotCommon: false,
    allValid: false,
  });

  const [errors, setErrors] = useState({
    new_password: "",
    confirm_password: "",
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState({
    type: "",
    title: "",
    message: "",
  });

  // Animation refs for floating labels
  const newLabelPosition = useRef(new Animated.Value(0)).current;
  const confirmLabelPosition = useRef(new Animated.Value(0)).current;

  // Common passwords list
  const commonPasswords = [
    "password",
    "123456",
    "qwerty",
    "letmein",
    "welcome",
    "admin",
  ];

  useEffect(() => {
    validatePassword(passwords.new_password);
  }, [passwords.new_password]);

  const validatePassword = (password: string) => {
    const validations = {
      hasMinLength: password.length >= 8,
      hasSpecialChar: /[!@#$%^&*(),.?\":{}|<>]/.test(password),
      hasNumber: /\d/.test(password),
      hasUpperCase: /[A-Z]/.test(password),
      isNotCommon: !commonPasswords.includes(password.toLowerCase()),
    };

    setPasswordValidation({
      ...validations,
      allValid: Object.values(validations).every((v) => v),
    });
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));

    // Clear error when user types
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFocus = (field: string) => {
    if (field === "new_password") {
      setState((prev) => ({ ...prev, isNewPasswordFocused: true }));
      Animated.timing(newLabelPosition, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    } else if (field === "confirm_password") {
      setState((prev) => ({ ...prev, isConfirmPasswordFocused: true }));
      Animated.timing(confirmLabelPosition, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleBlur = (field: string) => {
    if (field === "new_password") {
      setState((prev) => ({ ...prev, isNewPasswordFocused: false }));
      if (!passwords.new_password) {
        Animated.timing(newLabelPosition, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    } else if (field === "confirm_password") {
      setState((prev) => ({ ...prev, isConfirmPasswordFocused: false }));
      if (!passwords.confirm_password) {
        Animated.timing(confirmLabelPosition, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    }
  };

  const showModal = (type: string, title: string, message: string) => {
    setModalData({
      type,
      title,
      message,
    });
    setModalVisible(true);
  };

  const validateForm = () => {
    const newErrors = {
      new_password: "",
      confirm_password: "",
    };

    let isValid = true;

    if (!passwords.new_password || !passwords.new_password.trim()) {
      newErrors.new_password = "New password is required";
      isValid = false;
    } else if (!passwordValidation.allValid) {
      newErrors.new_password = "New password doesn't meet requirements";
      isValid = false;
    }

    if (!passwords.confirm_password || !passwords.confirm_password.trim()) {
      newErrors.confirm_password = "Please confirm your password";
      isValid = false;
    } else if (passwords.new_password !== passwords.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
    }
    return isValid;
  };

  const resetPassword = async () => {
    if (!validateForm()) return;

    setState((prev) => ({ ...prev, loading: true }));
    setErrors({ new_password: "", confirm_password: "" });

    try {
      const response = await axios.post(`${API_BASE_URL}/api/forgot-password.php`, {
        action: "reset_password",
        email: email,
        new_password: passwords.new_password,
      });

      if (response.data.success) {
        showModal("success", "Success", "Password reset successfully! You can now login with your new password.");
      } else {
        showModal("error", "Error", response.data.message || "Failed to reset password");
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || "Failed to reset password";
      showModal("error", "Error", errorMsg);
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  // Label styles with animation
  const newPasswordLabelStyle = {
    position: "absolute" as "absolute",
    left: 35,
    top: newLabelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [18, -3],
    }),
    fontSize: newLabelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [14, 12],
    }),
    color: newLabelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [
        "#6b7280",
        passwordValidation.allValid ? "#10b981" : "#af1616",
      ],
    }),
    backgroundColor: "white",
    paddingHorizontal: 4,
    zIndex: 1,
  };

  const confirmPasswordLabelStyle = {
    position: "absolute" as "absolute",
    left: 35,
    top: confirmLabelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [18, -3],
    }),
    fontSize: confirmLabelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [14, 12],
    }),
    color: confirmLabelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [
        "#6b7280",
        passwords.new_password === passwords.confirm_password &&
        passwords.confirm_password
          ? "#10b981"
          : "#af1616",
      ],
    }),
    backgroundColor: "white",
    paddingHorizontal: 4,
    zIndex: 1,
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-gray-50"
    >
      {/* Fixed Header */}
      <View className="flex-row items-center px-4 py-4 pt-10 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ArrowLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Reset Password</Text>
      </View>

      <ScrollView
        className="flex-1 px-3 py-6"
        keyboardShouldPersistTaps="handled"
      >
        <View className="bg-white p-3 mt-10 rounded-xl shadow-sm">
          <Text className="text-center text-gray-600 mb-6">
            Create a new password for {email}
          </Text>

          {/* New Password Input */}
          <View className="mb-6">
            <View className="relative">
              <Animated.Text style={newPasswordLabelStyle}>
                New Password
              </Animated.Text>
              <View
                className={`flex-row items-center border ${
                  errors.new_password
                    ? "border-red-500"
                    : passwordValidation.allValid
                    ? "border-green-500"
                    : state.isNewPasswordFocused
                    ? "border-[#af1616]"
                    : "border-gray-300"
                } rounded-lg px-3 py-2 mt-1`}
              >
                <Key
                  size={20}
                  color={
                    passwordValidation.allValid
                      ? "#10b981"
                      : errors.new_password
                      ? "#ef4444"
                      : "#6b7280"
                  }
                  className="mr-2"
                />
                <TextInput
                  className="flex-1 text-[#1f2937] py-2"
                  value={passwords.new_password}
                  onChangeText={(value) =>
                    handlePasswordChange("new_password", value)
                  }
                  onFocus={() => handleFocus("new_password")}
                  onBlur={() => handleBlur("new_password")}
                  secureTextEntry={!state.showNewPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() =>
                    setState((prev) => ({
                      ...prev,
                      showNewPassword: !prev.showNewPassword,
                    }))
                  }
                >
                  {state.showNewPassword ? (
                    <EyeOff
                      size={20}
                      color={
                        passwordValidation.allValid
                          ? "#10b981"
                          : errors.new_password
                          ? "#ef4444"
                          : "#af1616"
                      }
                    />
                  ) : (
                    <Eye
                      size={20}
                      color={
                        passwordValidation.allValid
                          ? "#10b981"
                          : errors.new_password
                          ? "#ef4444"
                          : "#af1616"
                      }
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>
            {errors.new_password ? (
              <Text className="text-red-500 text-xs mt-1">
                {errors.new_password}
              </Text>
            ) : null}
          </View>

          {/* Confirm Password Input */}
          <View className="mb-3">
            <View className="relative">
              <Animated.Text style={confirmPasswordLabelStyle}>
                Confirm Password
              </Animated.Text>
              <View
                className={`flex-row items-center border ${
                  errors.confirm_password
                    ? "border-red-500"
                    : passwords.new_password === passwords.confirm_password &&
                      passwords.confirm_password
                    ? "border-green-500"
                    : state.isConfirmPasswordFocused
                    ? "border-[#af1616]"
                    : "border-gray-300"
                } rounded-lg px-3 py-2 mt-1`}
              >
                <Key
                  size={20}
                  color={
                    passwords.new_password === passwords.confirm_password &&
                    passwords.confirm_password
                      ? "#10b981"
                      : errors.confirm_password
                      ? "#ef4444"
                      : "#6b7280"
                  }
                  className="mr-2"
                />
                <TextInput
                  className="flex-1 text-[#1f2937] py-2"
                  value={passwords.confirm_password}
                  onChangeText={(value) =>
                    handlePasswordChange("confirm_password", value)
                  }
                  onFocus={() => handleFocus("confirm_password")}
                  onBlur={() => handleBlur("confirm_password")}
                  secureTextEntry={!state.showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() =>
                    setState((prev) => ({
                      ...prev,
                      showConfirmPassword: !prev.showConfirmPassword,
                    }))
                  }
                >
                  {state.showConfirmPassword ? (
                    <EyeOff
                      size={20}
                      color={
                        passwords.new_password === passwords.confirm_password &&
                        passwords.confirm_password
                          ? "#10b981"
                          : errors.confirm_password
                          ? "#ef4444"
                          : "#af1616"
                      }
                    />
                  ) : (
                    <Eye
                      size={20}
                      color={
                        passwords.new_password === passwords.confirm_password &&
                        passwords.confirm_password
                          ? "#10b981"
                          : errors.confirm_password
                          ? "#ef4444"
                          : "#af1616"
                      }
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Password Match Validation */}
            {passwords.confirm_password.length > 0 && (
              <View className="mt-2 flex-row items-center">
                {passwords.new_password === passwords.confirm_password ? (
                  <Check size={14} color="#10b981" />
                ) : (
                  <X size={14} color="#ef4444" />
                )}
                <Text
                  className={`text-xs ml-2 ${
                    passwords.new_password === passwords.confirm_password
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {passwords.new_password === passwords.confirm_password
                    ? "Passwords match"
                    : "Passwords do not match"}
                </Text>
              </View>
            )}

            {errors.confirm_password ? (
              <Text className="text-red-500 text-xs mt-1">
                {errors.confirm_password}
              </Text>
            ) : null}
          </View>

          {/* Password Validation */}
          {passwords.new_password.length > 0 && (
            <View className="mt-0 mb-3 p-3 bg-gray-50 rounded-lg">
              <Text className="text-sm font-medium text-gray-600 mb-2">
                Password requirements:
              </Text>
              <View className="ml-1">
                <View className="flex-row items-center mb-1">
                  {passwordValidation.hasMinLength ? (
                    <Check size={14} color="#10b981" />
                  ) : (
                    <X size={14} color="#ef4444" />
                  )}
                  <Text
                    className={`text-xs ml-2 ${
                      passwordValidation.hasMinLength
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    At least 8 characters
                  </Text>
                </View>
                <View className="flex-row items-center mb-1">
                  {passwordValidation.hasSpecialChar ? (
                    <Check size={14} color="#10b981" />
                  ) : (
                    <X size={14} color="#ef4444" />
                  )}
                  <Text
                    className={`text-xs ml-2 ${
                      passwordValidation.hasSpecialChar
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    At least one special character
                  </Text>
                </View>
                <View className="flex-row items-center mb-1">
                  {passwordValidation.hasNumber ? (
                    <Check size={14} color="#10b981" />
                  ) : (
                    <X size={14} color="#ef4444" />
                  )}
                  <Text
                    className={`text-xs ml-2 ${
                      passwordValidation.hasNumber
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    At least one number
                  </Text>
                </View>
                <View className="flex-row items-center mb-1">
                  {passwordValidation.hasUpperCase ? (
                    <Check size={14} color="#10b981" />
                  ) : (
                    <X size={14} color="#ef4444" />
                  )}
                  <Text
                    className={`text-xs ml-2 ${
                      passwordValidation.hasUpperCase
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    At least one uppercase letter
                  </Text>
                </View>
                <View className="flex-row items-center">
                  {passwordValidation.isNotCommon ? (
                    <Check size={14} color="#10b981" />
                  ) : (
                    <X size={14} color="#ef4444" />
                  )}
                  <Text
                    className={`text-xs ml-2 ${
                      passwordValidation.isNotCommon
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    Not a common password
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Reset Password Button */}
          <TouchableOpacity
            className={`h-14 bg-[#af1616] rounded-xl justify-center items-center flex-row shadow-lg ${
              state.loading ? "opacity-80" : ""
            }`}
            onPress={resetPassword}
            disabled={state.loading}
          >
            {state.loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="text-white text-base font-bold">Reset Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Success/Error Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/70">
          <View className="bg-white rounded-lg p-6 w-4/5 max-w-md">
            <View
              className={`rounded-full h-16 w-16 justify-center items-center mx-auto mb-4 ${
                modalData.type === "success" ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <Text
                className={`text-2xl ${
                  modalData.type === "success" ? "text-green-600" : "text-red-600"
                }`}
              >
                {modalData.type === "success" ? "✓" : "✕"}
              </Text>
            </View>
            <Text className="text-xl font-bold text-gray-800 text-center mb-2">
              {modalData.title}
            </Text>
            <Text className="text-gray-600 text-center mb-6">
              {modalData.message}
            </Text>
            <Pressable
              className="bg-[#af1616] rounded-lg py-3 px-6"
              onPress={() => {
                setModalVisible(false);
                if (modalData.type === "success") {
                  router.push("/auth/login" as any);
                }
              }}
            >
              <Text className="text-white font-semibold text-center">OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Toast />
    </KeyboardAvoidingView>
  );
};

export default ResetPasswordScreen;