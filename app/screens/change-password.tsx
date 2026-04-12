import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from '@/constants/Config';
import { useThemeColor } from "@/hooks/useThemeColor";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { ArrowLeft, Check, X } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import { PasswordInput } from "@/components/change-password/PasswordInput";
import { PasswordRequirements } from "@/components/change-password/PasswordRequirements";
import { EmailOtpRequest } from "@/components/change-password/EmailOtpRequest";
import { OtpVerification } from "@/components/change-password/OtpVerification";
import { FeedbackModal } from "@/components/change-password/FeedbackModal";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from "react-native-toast-message";

// Configuration URL for change password backend logic
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
  // Navigation 
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
  // OTP states 
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const otpInputs = useRef<Array<TextInput | null>>([]);
  const [timer, setTimer] = useState(0);
  const [sentOtp, setSentOtp] = useState('');
  const [otpExpiry, setOtpExpiry] = useState<number>(0);
  // Password validation states 
  const [passwordValidation, setPasswordValidation] = useState({
    hasMinLength: false,
    hasSpecialChar: false,
    hasNumber: false,
    hasUpperCase: false,
    isNotCommon: false,
    isDifferentFromCurrent: true,
    allValid: false,
  });
  // Errpr handling states 
  const [errors, setErrors] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
 // modal states 
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
          <PasswordInput
            label="Current Password"
            value={passwords.current_password}
            onChangeText={(val) => handlePasswordChange("current_password", val)}
            onFocus={() => handleFocus("current_password")}
            onBlur={() => handleBlur("current_password")}
            error={errors.current_password}
            showPassword={state.showCurrentPassword}
            onToggleShowPassword={() => setState((prev) => ({ ...prev, showCurrentPassword: !prev.showCurrentPassword }))}
            labelStyle={currentPasswordLabelStyle}
            isFocused={state.isCurrentPasswordFocused as boolean}
            cardColor={cardColor}
            textColor={textColor}
          />

          {/* New Password Input */}
          <PasswordInput
            label="New Password"
            value={passwords.new_password}
            onChangeText={(val) => handlePasswordChange("new_password", val)}
            onFocus={() => handleFocus("new_password")}
            onBlur={() => handleBlur("new_password")}
            error={errors.new_password}
            showPassword={state.showNewPassword}
            onToggleShowPassword={() => setState((prev) => ({ ...prev, showNewPassword: !prev.showNewPassword }))}
            labelStyle={newPasswordLabelStyle}
            isValid={passwordValidation.allValid}
            isFocused={state.isNewPasswordFocused as boolean}
            cardColor={cardColor}
            textColor={textColor}
          />

          {/* Confirm Password Input */}
          <View className="mb-3">
            <PasswordInput
              label="Confirm Password"
              value={passwords.confirm_password}
              onChangeText={(val) => handlePasswordChange("confirm_password", val)}
              onFocus={() => handleFocus("confirm_password")}
              onBlur={() => handleBlur("confirm_password")}
              error={errors.confirm_password}
              showPassword={state.showConfirmPassword}
              onToggleShowPassword={() => setState((prev) => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }))}
              labelStyle={confirmPasswordLabelStyle}
              isValid={passwords.new_password === passwords.confirm_password && passwords.confirm_password.length > 0}
              isFocused={state.isConfirmPasswordFocused as boolean}
              cardColor={cardColor}
              textColor={textColor}
            />
            {/* Password Match Validation */}
            {passwords.confirm_password.length > 0 && (
              <View className="flex-row items-center mt-[-16px] mb-2">
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
          </View>

          {/* Password Validation */}
          {passwords.new_password.length > 0 && (
            <PasswordRequirements
              validation={passwordValidation}
              backgroundColor={backgroundColor}
              mutedColor={mutedColor}
            />
          )}

          {/* Email Input with Get OTP Button */}
          {!state.otpSent && (
            <EmailOtpRequest
              email={user?.email}
              loading={state.loading}
              onRequestOTP={requestOTP}
              mutedColor={mutedColor}
              textColor={textColor}
            />
          )}

          {/* OTP Section */}
          {state.otpSent && (
            <OtpVerification
              otp={otp}
              setOtp={setOtp}
              otpError={otpError}
              otpInputs={otpInputs}
              timer={timer}
              resendLoading={state.resendLoading}
              onResend={resendOTP}
              onVerify={verifyOTPAndChangePassword}
              loading={state.loading}
              textColor={textColor}
              mutedColor={mutedColor}
              cardColor={cardColor}
              handleOtpChange={handleOtpChange}
              handleOtpKeyPress={handleOtpKeyPress}
            />
          )}
        </View>
      </ScrollView>

      {/* Success/Error Modal */}
      <FeedbackModal
        visible={modalVisible}
        type={modalData.type}
        title={modalData.title}
        message={modalData.message}
        onClose={() => setModalVisible(false)}
      />

      <Toast />
    </KeyboardAvoidingView>
  );
};

export default ChangePassword;
