import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from '@/constants/Config';
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Check, Eye, EyeOff, Lock, X, Key } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Toast from "react-native-toast-message";

const OTPVerification = () => {

  const APP_URL = `${API_BASE_URL}/api/login.php`;
  const { student_id, message, user_data } = useLocalSearchParams();
  const { login, clearUser, user } = useAuth();
  const router = useRouter();
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
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
    canResend: false,
    resendCountdown: 180, // 3 minutes in seconds
  });
  
  const [passwordValidation, setPasswordValidation] = useState({
    hasUpperCase: false,
    hasNumber: false,
    hasSpecialChar: false,
    hasMinLength: false,
    isNotCommon: true,
    allValid: false,
  });
  
  const inputs = useRef<Array<TextInput | null>>([]);
  const labelPosition = useRef(new Animated.Value(0)).current;
  const confirmLabelPosition = useRef(new Animated.Value(0)).current;

  // Common passwords list
  const commonPasswords = ["password", "123456", "qwerty", "letmein", "welcome", "admin"];

  useEffect(() => {
    validatePassword(passwords.new_password);
  }, [passwords.new_password]);

  useEffect(() => {
    // Start countdown timer for resend OTP
    if (state.resendCountdown > 0 && !state.canResend) {
      const timer = setTimeout(() => {
        setState(prev => ({ 
          ...prev, 
          resendCountdown: prev.resendCountdown - 1 
        }));
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (state.resendCountdown === 0 && !state.canResend) {
      setState(prev => ({ ...prev, canResend: true }));
    }
  }, [state.resendCountdown, state.canResend]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const validatePassword = (password: string) => {
    const validations = {
      hasUpperCase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      hasMinLength: password.length >= 8,
      isNotCommon: !commonPasswords.includes(password.toLowerCase()),
    };
    
    setPasswordValidation({
      ...validations,
      allValid: Object.values(validations).every(v => v),
    });
  };

  const handleOtpPaste = (text: string) => {
    // Filter only digits and take first 6
    const digits = text.replace(/\D/g, '').slice(0, 6).split('');
    const newOtp = [...otp];
    
    digits.forEach((digit, index) => {
      if (index < 6) {
        newOtp[index] = digit;
      }
    });
    
    setOtp(newOtp);
    
    // Focus on the next empty field after the pasted content
    const nextEmptyIndex = newOtp.findIndex(d => !d);
    if (nextEmptyIndex !== -1 && nextEmptyIndex < 6) {
      inputs.current[nextEmptyIndex]?.focus();
    } else if (nextEmptyIndex === -1) {
      // All fields are filled, focus on the last one
      inputs.current[5]?.focus();
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return; // Only allow numbers
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
    
    // If pasting multiple digits (from clipboard)
    if (value.length > 1) {
      handleOtpPaste(value);
    }
  };

  const handleKeyPress = (e: { nativeEvent: { key: string } }, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
  };

  const handleFocus = (field: string) => {
    if (field === "new_password") {
      setState(prev => ({ ...prev, isNewPasswordFocused: true }));
      Animated.timing(labelPosition, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    } else if (field === "confirm_password") {
      setState(prev => ({ ...prev, isConfirmPasswordFocused: true }));
      Animated.timing(confirmLabelPosition, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleBlur = (field: string) => {
    if (field === "new_password") {
      setState(prev => ({ ...prev, isNewPasswordFocused: false }));
      if (!passwords.new_password) {
        Animated.timing(labelPosition, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    } else if (field === "confirm_password") {
      setState(prev => ({ ...prev, isConfirmPasswordFocused: false }));
      if (!passwords.confirm_password) {
        Animated.timing(confirmLabelPosition, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    }
  };

  const resendOTP = async () => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      // Parse user_data to get the password, or use student_id as default for first login
      let userPassword = student_id; // Default to student_id for first login
      if (user_data && typeof user_data === 'string') {
        try {
          const parsedData = JSON.parse(user_data);
          userPassword = parsedData.password || student_id;
        } catch (e) {
          console.error('Error parsing user_data:', e);
        }
      }

      const requestData = {
        student_id,
        password: userPassword,
        resend_otp: true,
      };

      const response = await axios.post(APP_URL, requestData, {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      });

      const result = response.data;

      if (result.success) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: result.message || "OTP sent successfully",
          position: "top",
        });
        
        // Reset countdown
        setState(prev => ({ 
          ...prev, 
          canResend: false, 
          resendCountdown: 180,
          loading: false 
        }));
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: result.message || "Failed to resend OTP",
          position: "top",
        });
        setState(prev => ({ ...prev, loading: false }));
      }
    } catch (error: unknown) {
      const err = error as any;
      Toast.show({
        type: "error",
        text1: "Request Error",
        text2: err.response?.data?.message || err.message || "Something went wrong",
        position: "top",
      });
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const validateForm = () => {
    if (otp.some(digit => !digit)) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter all OTP digits",
        position: "top",
      });
      return false;
    }
    
    if (!passwords.new_password.trim()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "New password is required",
        position: "top",
      });
      return false;
    }
    
    if (!passwordValidation.hasUpperCase) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Password must contain at least one uppercase letter",
        position: "top",
      });
      return false;
    }
    
    if (!passwordValidation.hasNumber) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Password must contain at least one number",
        position: "top",
      });
      return false;
    }
    
    if (!passwordValidation.hasSpecialChar) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Password must contain at least one special character",
        position: "top",
      });
      return false;
    }
    
    if (!passwordValidation.hasMinLength) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Password must be at least 8 characters",
        position: "top",
      });
      return false;
    }
    
    if (!passwordValidation.isNotCommon) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Password is too common, please choose a stronger one",
        position: "top",
      });
      return false;
    }
    
    if (passwords.new_password !== passwords.confirm_password) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Passwords do not match",
        position: "top",
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setState(prev => ({ ...prev, loading: true }));

    try {
      const requestData = {
        student_id,
        otp: otp.join(""),
        new_password: passwords.new_password,
      };

      const response = await axios.post(APP_URL, requestData, {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      });

      const result = response.data;

      if (result.success) {
        if (result.requires_policy_acceptance) {
          // Navigate to policy acceptance screen with user data
          // Create updated user data with the new password
          const updatedUserData = {
            ...(result.user_data || result.user || {}),
            // If we have user_data from params, parse and merge it
            ...(user_data && typeof user_data === 'string' ? JSON.parse(user_data) : {}),
            // Ensure we have the latest password
            password: passwords.new_password
          };
          console.log("updated data" , updatedUserData);
          setTimeout(() => {
            router.push({
              pathname: "/auth/policy-acceptance",
              params: { 
                student_id,
                user_data: JSON.stringify(updatedUserData)
              }
            });
          }, 100);
        } else if (result.user) {
          // If no policy acceptance needed, login directly
          const userData = {
            ...result.user,
            avatar: result.user.avatar || "https://i.pravatar.cc/150",
            contact_number: result.user.contact_number || "No phone added",
            joinDate: result.user.joinDate || "Member since 2023",
            policy_accepted: result.user.policy_accepted || 1,
          };

          await login(userData);
          
          Toast.show({
            type: "success",
            text1: "Success",
            text2: result.message || "Password updated successfully",
            position: "top",
          });
          
          router.replace("/home");
        } else {
          Toast.show({
            type: "success",
            text1: "Success",
            text2: result.message || "Password updated successfully",
            position: "top",
          });
          router.back();
        }
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: result.message || "Failed to verify OTP",
          position: "top",
        });
      }
    } catch (error: unknown) {
      const err = error as any;
      Toast.show({
        type: "error",
        text1: "Request Error",
        text2: err.response?.data?.message || err.message || "Something went wrong",
        position: "top",
      });
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const newPasswordLabelStyle = {
    position: 'absolute' as 'absolute',
    left: 35,
    top: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [18, -3],
    }),
    fontSize: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [14, 12],
    }),
    color: labelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: ['#6b7280', passwordValidation.allValid ? '#10b981' : '#af1616'],
    }),
    backgroundColor: 'white',
    paddingHorizontal: 4,
    zIndex: 1,
  };

  const confirmPasswordLabelStyle = {
    position: 'absolute' as 'absolute',
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
      outputRange: ['#6b7280', passwords.new_password === passwords.confirm_password && passwords.confirm_password ? '#10b981' : '#af1616'],
    }),
    backgroundColor: 'white',
    paddingHorizontal: 4,
    zIndex: 1,
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView className="flex-1 px-3 py-6 mt-10" keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 rounded-full bg-gray-100">
            <ArrowLeft size={24} color="#af1616" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-[#af1616]">OTP Verification</Text>
        </View>

        <View className="bg-white p-3 mt-10 rounded-xl shadow-sm">
          {/* Message */}
          {message && (
            <Text className="text-center text-green-600 mb-6 text-base font-medium">
              {typeof message === "string" ? message : "OTP sent to your email"}
            </Text>
          )}
          {/* OTP Inputs */}
          <View className="mb-3">
            <Text className="text-sm text-gray-600 mb-3">Enter OTP Code</Text>
            <View className="flex-row justify-between items-center">
              {otp.map((digit, index) => (
                <View key={index} className="justify-center items-center">
                  <TextInput
                    ref={ref => { inputs.current[index] = ref; }}
                    className={`w-14 h-14 border ${digit ? 'border-[#af1616]' : 'border-gray-300'} rounded-lg text-center text-lg font-bold`}
                    value={digit}
                    onChangeText={value => handleOtpChange(value, index)}
                    onKeyPress={e => handleKeyPress(e, index)}
                    keyboardType="numeric"
                    maxLength={6} // Allow pasting multiple digits
                    selectTextOnFocus
                    onFocus={() => {
                      // Select all text when focused for easy replacement
                      inputs.current[index]?.setNativeProps({
                        selection: { start: 0, end: otp[index].length }
                      });
                    }}
                  />
                </View>
              ))}
            </View>
            
            {/* Resend OTP Section */}
            <View className="mt-4 flex-row justify-center items-center">
              <Text className="text-gray-600 text-sm mr-2">
                Didn't receive the code?
              </Text>
              {state.canResend ? (
                <TouchableOpacity onPress={resendOTP} disabled={state.loading}>
                  <Text className="text-[#af1616] font-semibold">Resend OTP</Text>
                </TouchableOpacity>
              ) : (
                <Text className="text-gray-500 text-sm">
                  Resend in {formatTime(state.resendCountdown)}
                </Text>
              )}
            </View>
            
            <TouchableOpacity 
              onPress={() => {
                Alert.prompt(
                  "Paste OTP",
                  "Enter the OTP code you received",
                  [
                    { text: "Cancel", style: "cancel" },
                    { 
                      text: "Paste", 
                      onPress: (text) => text && handleOtpPaste(text)
                    }
                  ],
                  "plain-text"
                );
              }}
              className="mt-3"
            >
            </TouchableOpacity>
          </View>

          {/* New Password Input */}
          <View className="mb-6">
            <View className="relative">
              <Animated.Text style={newPasswordLabelStyle}>
                New Password
              </Animated.Text>
              <View className={`flex-row items-center border ${passwordValidation.allValid ? 'border-green-500' : state.isNewPasswordFocused ? "border-[#af1616]" : "border-gray-300"} rounded-lg px-3 py-2 mt-1`}>
                <Key size={20} color={passwordValidation.allValid ? '#10b981' : '#6b7280'} className="mr-2" />
                <TextInput
                  className="flex-1 text-[#1f2937] py-2"
                  value={passwords.new_password}
                  onChangeText={value => handlePasswordChange("new_password", value)}
                  onFocus={() => handleFocus("new_password")}
                  onBlur={() => handleBlur("new_password")}
                  secureTextEntry={!state.showNewPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setState(prev => ({ ...prev, showNewPassword: !prev.showNewPassword }))}
                >
                  {state.showNewPassword ? (
                    <EyeOff size={20} color={passwordValidation.allValid ? '#10b981' : '#af1616'} />
                  ) : (
                    <Eye size={20} color={passwordValidation.allValid ? '#10b981' : '#af1616'} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Confirm Password Input */}
          <View className="mb-3">
            <View className="relative">
              <Animated.Text style={confirmPasswordLabelStyle}>
                Confirm Password
              </Animated.Text>
              <View className={`flex-row items-center border ${passwords.new_password === passwords.confirm_password && passwords.confirm_password ? 'border-green-500' : state.isConfirmPasswordFocused ? "border-[#af1616]" : "border-gray-300"} rounded-lg px-3 py-2 mt-1`}>
                <Key size={20} color={passwords.new_password === passwords.confirm_password && passwords.confirm_password ? '#10b981' : '#6b7280'} className="mr-2" />
                <TextInput
                  className="flex-1 text-[#1f2937] py-2"
                  value={passwords.confirm_password}
                  onChangeText={value => handlePasswordChange("confirm_password", value)}
                  onFocus={() => handleFocus("confirm_password")}
                  onBlur={() => handleBlur("confirm_password")}
                  secureTextEntry={!state.showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setState(prev => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }))}
                >
                  {state.showConfirmPassword ? (
                    <EyeOff size={20} color={passwords.new_password === passwords.confirm_password && passwords.confirm_password ? '#10b981' : '#af1616'} />
                  ) : (
                    <Eye size={20} color={passwords.new_password === passwords.confirm_password && passwords.confirm_password ? '#10b981' : '#af1616'} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Password Match Validation */}
            {passwords.confirm_password.length > 0 && (
              <View className="mt-2 flex-row items-center">
                {passwords.new_password === passwords.confirm_password ? 
                  <Check size={14} color="#10b981" /> : 
                  <X size={14} color="#ef4444" />}
                <Text className={`text-xs ml-2 ${passwords.new_password === passwords.confirm_password ? 'text-green-600' : 'text-red-600'}`}>
                  {passwords.new_password === passwords.confirm_password ? 'Passwords match' : 'Passwords do not match'}
                </Text>
              </View>
            )}
          </View>
            {/* Password Validation */}
            {passwords.new_password.length > 0 && (
              <View className="mt-0 mb-3 p-3 bg-gray-50 rounded-lg">
                <Text className="text-sm font-medium text-gray-600 mb-2">Password requirements:</Text>
                <View className="ml-1">
                  <View className="flex-row items-center mb-1">
                    {passwordValidation.hasUpperCase ? 
                      <Check size={14} color="#10b981" /> : 
                      <X size={14} color="#ef4444" />}
                    <Text className={`text-xs ml-2 ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-red-600'}`}>
                      At least one uppercase letter
                    </Text>
                  </View>
                  <View className="flex-row items-center mb-1">
                    {passwordValidation.hasNumber ? 
                      <Check size={14} color="#10b981" /> : 
                      <X size={14} color="#ef4444" />}
                    <Text className={`text-xs ml-2 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-red-600'}`}>
                      At least one number
                    </Text>
                  </View>
                  <View className="flex-row items-center mb-1">
                    {passwordValidation.hasSpecialChar ? 
                      <Check size={14} color="#10b981" /> : 
                      <X size={14} color="#ef4444" />}
                    <Text className={`text-xs ml-2 ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-red-600'}`}>
                      At least one special character
                    </Text>
                  </View>
                  <View className="flex-row items-center mb-1">
                    {passwordValidation.hasMinLength ? 
                      <Check size={14} color="#10b981" /> : 
                      <X size={14} color="#ef4444" />}
                    <Text className={`text-xs ml-2 ${passwordValidation.hasMinLength ? 'text-green-600' : 'text-red-600'}`}>
                      At least 8 characters
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    {passwordValidation.isNotCommon ? 
                      <Check size={14} color="#10b981" /> : 
                      <X size={14} color="#ef4444" />}
                    <Text className={`text-xs ml-2 ${passwordValidation.isNotCommon ? 'text-green-600' : 'text-red-600'}`}>
                      Not a common password
                    </Text>
                </View>
                </View>
              </View>
            )}
          {/* Submit Button */}
          <TouchableOpacity
            className={`h-14 bg-[#af1616] rounded-lg justify-center items-center flex-row shadow-sm ${
              state.loading ? "opacity-80" : ""
            }`}
            onPress={handleSubmit}
            disabled={state.loading}
          >
            {state.loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-lg font-semibold">Update Password</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Toast />
    </KeyboardAvoidingView>
  );
};

export default OTPVerification;