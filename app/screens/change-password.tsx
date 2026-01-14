import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from '@/constants/Config';
import { useThemeColor } from "@/hooks/useThemeColor";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from "react-native-toast-message";

const API_URL = `${API_BASE_URL}/api/change_password.php`;

const ChangePassword = () => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  // Theme Change 
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const mutedColor = useThemeColor({}, 'muted');
  
  // Detect three-button navigation
  const hasThreeButtonNav = Platform.OS === 'android' && insets.bottom === 0;

  const navigation = useNavigation();
  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [state, setState] = useState({
    loading: false,
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
    isCurrentPasswordFocused: false,
    isNewPasswordFocused: false,
    isConfirmPasswordFocused: false,
    otpSent: false,
    resendLoading: false,
  });

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const otpInputs = useRef<Array<TextInput | null>>([]);
  const [timer, setTimer] = useState(0);
  const [sentOtp, setSentOtp] = useState('');
  const [otpExpiry, setOtpExpiry] = useState<number>(0);

  const [passwordValidation, setPasswordValidation] = useState({
    hasMinLength: false,
    hasSpecialChar: false,
    hasNumber: false,
    hasUpperCase: false,
    isNotCommon: false,
    isDifferentFromCurrent: true,
    allValid: false,
  });

  const [errors, setErrors] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [modalData, setModalData] = useState({
    type: "", // 'success' or 'error'
    title: "",
    message: "",
  });

  // Animation refs for floating labels
  const currentLabelPosition = useRef(new Animated.Value(0)).current;
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
  }, [passwords.new_password, passwords.current_password]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const validatePassword = (password: string) => {
    const validations = {
      hasMinLength: password.length >= 8,
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      hasNumber: /\d/.test(password),
      hasUpperCase: /[A-Z]/.test(password),
      isNotCommon: !commonPasswords.includes(password.toLowerCase()),
      isDifferentFromCurrent: password !== passwords.current_password,
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
    if (field === "current_password") {
      setState((prev) => ({ ...prev, isCurrentPasswordFocused: true }));
      Animated.timing(currentLabelPosition, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    } else if (field === "new_password") {
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
    if (field === "current_password") {
      setState((prev) => ({ ...prev, isCurrentPasswordFocused: false }));
      if (!passwords.current_password) {
        Animated.timing(currentLabelPosition, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    } else if (field === "new_password") {
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
      current_password: "",
      new_password: "",
      confirm_password: "",
    };

    let isValid = true;

    if (!passwords.current_password || !passwords.current_password.trim()) {
      newErrors.current_password = "Current password is required";
      isValid = false;
    }

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
      console.log('Validation failed:', newErrors);
      console.log('Current passwords state:', passwords);
      console.log('Password validation:', passwordValidation);
    }
    return isValid;
  };

  const requestOTP = async () => {
    if (!validateForm()) return;

    setState((prev) => ({ ...prev, loading: true }));
    setErrors({ current_password: "", new_password: "", confirm_password: "" });

    try {
      console.log('Sending OTP request to:', API_URL);
      console.log('User ID:', user?.id);
      
      const response = await axios.post(API_URL, {
        action: "request_otp",
        user_id: user?.id,
      });

      console.log('OTP Response:', response.data);

      if (response.data.success) {
        setSentOtp(response.data.otp);
        setOtpExpiry(Date.now() + 600000);
        setState((prev) => ({ ...prev, otpSent: true, loading: false }));
        setTimer(60);
        Toast.show({
          type: 'success',
          text1: 'OTP Sent',
          text2: `Check ${user?.email || 'your email'}`,
        });
      } else {
        console.log('OTP request failed:', response.data.message);
        showModal("error", "Error", response.data.message);
        setState((prev) => ({ ...prev, loading: false }));
      }
    } catch (error: any) {
      console.log('OTP Error:', error);
      console.log('Error response:', error.response?.data);
      console.log('Error message:', error.message);
      const errorMsg = error.response?.data?.message || error.message || "Failed to send OTP";
      showModal("error", "Error", errorMsg);
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const resendOTP = async () => {
    setState((prev) => ({ ...prev, resendLoading: true }));
    setOtp(['', '', '', '', '', '']);
    setOtpError('');

    try {
      const response = await axios.post(API_URL, {
        action: "request_otp",
        user_id: user?.id,
      });

      if (response.data.success) {
        setSentOtp(response.data.otp);
        setOtpExpiry(Date.now() + 600000);
        setTimer(60);
        Toast.show({ type: 'success', text1: 'OTP Resent', text2: `Check ${user?.email || 'your email'}` });
      } else {
        Toast.show({ type: 'error', text1: 'Failed to resend', text2: response.data.message });
      }
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to resend OTP' });
    } finally {
      setState((prev) => ({ ...prev, resendLoading: false }));
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError('');
    if (value && index < 5) otpInputs.current[index + 1]?.focus();
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const verifyOTPAndChangePassword = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setOtpError('Please enter complete OTP');
      return;
    }

    if (Date.now() > otpExpiry) {
      setOtpError('OTP has expired');
      return;
    }

    if (otpCode !== sentOtp) {
      setOtpError('Invalid OTP');
      return;
    }

    setState((prev) => ({ ...prev, loading: true }));

    try {
      const response = await axios.post(API_URL, {
        action: "change_password",
        user_id: user?.id,
        current_password: passwords.current_password,
        new_password: passwords.new_password,
      });

      if (response.data.success) {
        setPasswords({ current_password: "", new_password: "", confirm_password: "" });
        setOtp(['', '', '', '', '', '']);
        setSentOtp('');
        setOtpExpiry(0);
        setState((prev) => ({ ...prev, otpSent: false, loading: false }));
        showModal("success", "Success", "Password changed successfully");
      } else {
        setOtpError(response.data.message);
        setState((prev) => ({ ...prev, loading: false }));
      }
    } catch (error: any) {
      setOtpError("Failed to change password");
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  // Label styles with animation
  const currentPasswordLabelStyle = {
    position: "absolute" as "absolute",
    left: 35,
    top: currentLabelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [18, -3],
    }),
    fontSize: currentLabelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [14, 12],
    }),
    color: currentLabelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: ["#6b7280", errors.current_password ? "#ef4444" : "#af1616"],
    }),
    backgroundColor: "white",
    paddingHorizontal: 4,
    zIndex: 1,
  };

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
      style={{ backgroundColor }}
    >
      {/* Fixed Header */}
      <View className="flex-row items-center px-4 py-4 pt-10 bg-white border-b border-gray-200" style={{ backgroundColor: cardColor }}>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
          <ArrowLeft size={24} color={textColor} />
        </TouchableOpacity>
        <Text className="text-xl font-bold" style={{ color: textColor }}>Change Password</Text>
      </View>

      <ScrollView
        className="flex-1 px-3 py-6"
        keyboardShouldPersistTaps="handled"
        style={{ backgroundColor }}
        contentContainerStyle={{ paddingBottom: hasThreeButtonNav ? 48 : 0 }}
      >

        <View className="bg-white p-3 mt-10 rounded-xl shadow-sm" style={{ backgroundColor: cardColor }}>
          {/* Current Password Input */}
          <View className="mb-6">
            <View className="relative">
              <Animated.Text style={[currentPasswordLabelStyle, { backgroundColor: cardColor }]}>
                Current Password
              </Animated.Text>

              <View
                className={`flex-row items-center border ${errors.current_password ? "border-red-500" : state.isCurrentPasswordFocused ? "border-[#af1616]" : "border-gray-300"} rounded-lg px-3 py-2 mt-1`}
              >
                <Key
                  size={20}
                  color={errors.current_password ? "#ef4444" : "#6b7280"}
                  className="mr-2"
                />
                <TextInput
                  className="flex-1 text-[#1f2937] py-2"
                  style={{color: textColor }}
                  value={passwords.current_password}
                  onChangeText={(value) =>
                    handlePasswordChange("current_password", value)
                  }
                  onFocus={() => handleFocus("current_password")}
                  onBlur={() => handleBlur("current_password")}
                  secureTextEntry={!state.showCurrentPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() =>
                    setState((prev) => ({
                      ...prev,
                      showCurrentPassword: !prev.showCurrentPassword,
                    }))
                  }
                >
                  {state.showCurrentPassword ? (
                    <EyeOff
                      size={20}
                      color={errors.current_password ? "#ef4444" : "#af1616"}
                    />
                  ) : (
                    <Eye
                      size={20}
                      color={errors.current_password ? "#ef4444" : "#af1616"}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>
            {errors.current_password ? (
              <Text className="text-red-500 text-xs mt-1">
                {errors.current_password}
              </Text>
            ) : null}
          </View>

          {/* New Password Input */}
          <View className="mb-6">
            <View className="relative">
              <Animated.Text style={[newPasswordLabelStyle, { backgroundColor: cardColor }] }>
                New Password
              </Animated.Text>
              <View
                className={`flex-row items-center border ${errors.new_password ? "border-red-500" : passwordValidation.allValid ? "border-green-500" : state.isNewPasswordFocused ? "border-[#af1616]" : "border-gray-300"} rounded-lg px-3 py-2 mt-1`}
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
                  style={{ color: textColor }}
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
              <Animated.Text style={[confirmPasswordLabelStyle, { backgroundColor: cardColor }]}>
                Confirm Password
              </Animated.Text>
              <View
                className={`flex-row items-center border ${errors.confirm_password ? "border-red-500" : passwords.new_password === passwords.confirm_password && passwords.confirm_password ? "border-green-500" : state.isConfirmPasswordFocused ? "border-[#af1616]" : "border-gray-300"} rounded-lg px-3 py-2 mt-1`}
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
                  style={{color: textColor }}
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
                  className={`text-xs ml-2 ${passwords.new_password === passwords.confirm_password ? "text-green-600" : "text-red-600"}`}
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
            <View className="mt-0 mb-3 p-3 rounded-lg" style={{ backgroundColor: backgroundColor }}>
              <Text className="text-sm font-medium mb-2" style={{ color: mutedColor }}>
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
                    className={`text-xs ml-2 ${passwordValidation.hasMinLength ? "text-green-600" : "text-red-600"}`}
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
                    className={`text-xs ml-2 ${passwordValidation.hasSpecialChar ? "text-green-600" : "text-red-600"}`}
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
                    className={`text-xs ml-2 ${passwordValidation.hasNumber ? "text-green-600" : "text-red-600"}`}
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
                    className={`text-xs ml-2 ${passwordValidation.hasUpperCase ? "text-green-600" : "text-red-600"}`}
                  >
                    At least one uppercase letter
                  </Text>
                </View>
                <View className="flex-row items-center mb-1">
                  {passwordValidation.isNotCommon ? (
                    <Check size={14} color="#10b981" />
                  ) : (
                    <X size={14} color="#ef4444" />
                  )}
                  <Text
                    className={`text-xs ml-2 ${passwordValidation.isNotCommon ? "text-green-600" : "text-red-600"}`}
                  >
                    Not a common password
                  </Text>
                </View>
                <View className="flex-row items-center">
                  {passwordValidation.isDifferentFromCurrent ? (
                    <Check size={14} color="#10b981" />
                  ) : (
                    <X size={14} color="#ef4444" />
                  )}
                  <Text
                    className={`text-xs ml-2 ${passwordValidation.isDifferentFromCurrent ? "text-green-600" : "text-red-600"}`}
                  >
                    Different from current password
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* OTP Section or Submit Button */}
          {!state.otpSent ? (
            <TouchableOpacity
              className={`h-14 bg-[#af1616] rounded-xl justify-center items-center flex-row shadow-lg ${state.loading ? "opacity-80" : ""}`}
              onPress={requestOTP}
              disabled={state.loading}
              style={{ elevation: 3 }}
            >
              {state.loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white text-base font-bold">Send OTP to Email</Text>
              )}
            </TouchableOpacity>
          ) : (
            <View>
              <Text className="text-sm font-semibold mb-3" style={{ color: textColor }}>Enter OTP Code</Text>
              <View className="flex-row justify-between mb-4">
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => { if (ref) otpInputs.current[index] = ref; }}
                    className="w-12 h-14 border-2 rounded-xl text-center text-xl font-bold"
                    style={{ borderColor: otpError ? '#ef4444' : digit ? '#af1616' : mutedColor + '40', color: textColor, backgroundColor: cardColor }}
                    value={digit}
                    onChangeText={(value) => {
                      if (value.length > 1) {
                        const digits = value.replace(/\D/g, '').slice(0, 6).split('');
                        const newOtp = [...otp];
                        digits.forEach((d, i) => {
                          if (index + i < 6) newOtp[index + i] = d;
                        });
                        setOtp(newOtp);
                        const nextIndex = Math.min(index + digits.length, 5);
                        otpInputs.current[nextIndex]?.focus();
                      } else {
                        handleOtpChange(value, index);
                      }
                    }}
                    onKeyPress={(e) => handleOtpKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={6}
                    selectTextOnFocus
                    onFocus={() => {
                      otpInputs.current[index]?.setNativeProps({
                        selection: { start: 0, end: otp[index].length }
                      });
                    }}
                  />
                ))}
              </View>
              {otpError ? <Text className="text-red-500 text-xs mb-3">{otpError}</Text> : null}
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-sm" style={{ color: mutedColor }}>Didn't receive code?</Text>
                <TouchableOpacity onPress={resendOTP} disabled={timer > 0 || state.resendLoading}>
                  <Text className="text-sm font-semibold" style={{ color: timer > 0 ? mutedColor : '#af1616' }}>
                    {state.resendLoading ? 'Sending...' : timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                className={`h-14 bg-[#af1616] rounded-xl justify-center items-center flex-row shadow-lg ${state.loading ? "opacity-80" : ""}`}
                onPress={verifyOTPAndChangePassword}
                disabled={state.loading}
                style={{ elevation: 3 }}
              >
                {state.loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-white text-base font-bold">Verify & Change Password</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
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
              className={`rounded-full h-16 w-16 justify-center items-center mx-auto mb-4 ${modalData.type === "success" ? "bg-green-100" : "bg-red-100"}`}
            >
              <Text
                className={`text-2xl ${modalData.type === "success" ? "text-green-600" : "text-red-600"}`}
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
              className={`${modalData.type === "success" ? "bg-[#af1616]" : "bg-[#af1616]"} rounded-lg py-3 px-6`}
              onPress={() => {
                setModalVisible(false);
                if (modalData.type === "success") {
                  navigation.goBack();
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

export default ChangePassword;
