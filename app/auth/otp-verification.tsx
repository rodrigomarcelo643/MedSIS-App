import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from '@/constants/Config';
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Eye, Key } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
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

// Import modular components
import { OtpHeader } from "@/components/auth/otp/OtpHeader";
import { OtpInputGrid } from "@/components/auth/otp/OtpInputGrid";
import { PasswordValidationUI } from "@/components/auth/otp/PasswordValidationUI";

const OTPVerification = () => {
  const APP_URL = `${API_BASE_URL}/api/login.php`;
  const { student_id, message, user_data } = useLocalSearchParams();
  const { login } = useAuth();
  const router = useRouter();
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [passwords, setPasswords] = useState({ new_password: "", confirm_password: "" });
  const [state, setState] = useState({
    loading: false,
    showNewPassword: false,
    showConfirmPassword: false,
    isNewPasswordFocused: false,
    isConfirmPasswordFocused: false,
    canResend: false,
    resendCountdown: 180,
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

  const commonPasswords = ["password", "123456", "qwerty", "letmein", "welcome", "admin"];

  useEffect(() => {
    const validations = {
      hasUpperCase: /[A-Z]/.test(passwords.new_password),
      hasNumber: /[0-9]/.test(passwords.new_password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(passwords.new_password),
      hasMinLength: passwords.new_password.length >= 8,
      isNotCommon: !commonPasswords.includes(passwords.new_password.toLowerCase()),
    };
    setPasswordValidation({ ...validations, allValid: Object.values(validations).every(v => v) });
  }, [passwords.new_password]);

  useEffect(() => {
    if (state.resendCountdown > 0 && !state.canResend) {
      const timer = setTimeout(() => setState(prev => ({ ...prev, resendCountdown: prev.resendCountdown - 1 })), 1000);
      return () => clearTimeout(timer);
    } else if (state.resendCountdown === 0) setState(prev => ({ ...prev, canResend: true }));
  }, [state.resendCountdown, state.canResend]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleOtpPaste = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 6).split('');
    const newOtp = [...otp];
    digits.forEach((digit, index) => { if (index < 6) newOtp[index] = digit; });
    setOtp(newOtp);
    const nextEmptyIndex = newOtp.findIndex(d => !d);
    inputs.current[nextEmptyIndex !== -1 ? nextEmptyIndex : 5]?.focus();
  };

  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp]; newOtp[index] = value; setOtp(newOtp);
    if (value && index < 5) inputs.current[index + 1]?.focus();
    if (value.length > 1) handleOtpPaste(value);
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) inputs.current[index - 1]?.focus();
  };

  const handleFocus = (field: string) => {
    const anim = field === "new_password" ? labelPosition : confirmLabelPosition;
    setState(prev => ({ ...prev, [field === "new_password" ? "isNewPasswordFocused" : "isConfirmPasswordFocused"]: true }));
    Animated.timing(anim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  };

  const handleBlur = (field: string) => {
    const anim = field === "new_password" ? labelPosition : confirmLabelPosition;
    const val = field === "new_password" ? passwords.new_password : passwords.confirm_password;
    setState(prev => ({ ...prev, [field === "new_password" ? "isNewPasswordFocused" : "isConfirmPasswordFocused"]: false }));
    if (!val) Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  };

  const resendOTP = async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      let userPassword = student_id;
      if (user_data && typeof user_data === 'string') {
        try { const parsed = JSON.parse(user_data); userPassword = parsed.password || student_id; } catch (e) {}
      }
      const res = await axios.post(APP_URL, { student_id, password: userPassword, resend_otp: true }, { timeout: 10000 });
      if (res.data.success) {
        Toast.show({ type: "success", text1: "Success", text2: res.data.message });
        setState(prev => ({ ...prev, canResend: false, resendCountdown: 180, loading: false }));
      } else {
        Toast.show({ type: "error", text1: "Error", text2: res.data.message });
        setState(prev => ({ ...prev, loading: false }));
      }
    } catch (e: any) {
      Toast.show({ type: "error", text1: "Error", text2: e.message });
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleSubmit = async () => {
    if (otp.some(d => !d) || !passwords.new_password || !passwordValidation.allValid || passwords.new_password !== passwords.confirm_password) {
      Toast.show({ type: "error", text1: "Validation Error", text2: "Check all fields and password requirements" });
      return;
    }
    setState(prev => ({ ...prev, loading: true }));
    try {
      const res = await axios.post(APP_URL, { student_id, otp: otp.join(""), new_password: passwords.new_password }, { timeout: 10000 });
      if (res.data.success) {
        if (res.data.requires_policy_acceptance) {
          const updated = { ...(res.data.user_data || res.data.user || {}), ...(user_data && typeof user_data === 'string' ? JSON.parse(user_data) : {}), password: passwords.new_password };
          setTimeout(() => router.push({ pathname: "/auth/policy-acceptance", params: { student_id, user_data: JSON.stringify(updated) } }), 100);
        } else if (res.data.user) {
          await login({ ...res.data.user, avatar: res.data.user.avatar || "https://i.pravatar.cc/150", policy_accepted: 1 });
          Toast.show({ type: "success", text1: "Success" });
          router.replace("/home");
        } else router.back();
      } else Toast.show({ type: "error", text1: "Error", text2: res.data.message });
    } catch (e: any) {
      Toast.show({ type: "error", text1: "Error", text2: e.message });
    } finally { setState(prev => ({ ...prev, loading: false })); }
  };

  const getLabelStyle = (anim: Animated.Value, field: string) => ({
    position: 'absolute' as 'absolute', left: 35, zIndex: 1, backgroundColor: 'white', paddingHorizontal: 4,
    top: anim.interpolate({ inputRange: [0, 1], outputRange: [18, -3] }),
    fontSize: anim.interpolate({ inputRange: [0, 1], outputRange: [14, 12] }),
    color: anim.interpolate({ inputRange: [0, 1], outputRange: ['#6b7280', (field === 'new' ? passwordValidation.allValid : (passwords.new_password === passwords.confirm_password && passwords.confirm_password)) ? '#10b981' : '#af1616'] }),
  });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-white">
      <ScrollView className="flex-1 px-3 py-6 mt-10" keyboardShouldPersistTaps="handled">
        <OtpHeader onBack={() => router.back()} title="OTP Verification" />
        <View className="bg-white p-3 mt-10 rounded-xl shadow-sm">
          {message && <Text className="text-center text-green-600 mb-6 text-base font-medium">{typeof message === "string" ? message : "OTP sent to your email"}</Text>}
          
          <OtpInputGrid
            otp={otp}
            handleOtpChange={handleOtpChange}
            handleKeyPress={handleKeyPress}
            inputs={inputs}
            canResend={state.canResend}
            resendCountdown={state.resendCountdown}
            onResend={resendOTP}
            formatTime={formatTime}
            loading={state.loading}
          />

          <View className="mb-6 relative">
            <Animated.Text style={getLabelStyle(labelPosition, 'new')}>New Password</Animated.Text>
            <View className={`flex-row items-center border ${passwordValidation.allValid ? 'border-green-500' : state.isNewPasswordFocused ? "border-[#af1616]" : "border-gray-300"} rounded-lg px-3 py-2 mt-1`}>
              <Key size={20} color={passwordValidation.allValid ? '#10b981' : '#6b7280'} className="mr-2" />
              <TextInput className="flex-1 text-[#1f2937] py-2" value={passwords.new_password} onChangeText={v => setPasswords(p => ({ ...p, new_password: v }))} onFocus={() => handleFocus("new_password")} onBlur={() => handleBlur("new_password")} secureTextEntry={!state.showNewPassword} autoCapitalize="none" />
              <TouchableOpacity onPress={() => setState(p => ({ ...p, showNewPassword: !p.showNewPassword }))}><Eye size={20} color={passwordValidation.allValid ? '#10b981' : '#af1616'} /></TouchableOpacity>
            </View>
          </View>

          <View className="mb-3 relative">
            <Animated.Text style={getLabelStyle(confirmLabelPosition, 'confirm')}>Confirm Password</Animated.Text>
            <View className={`flex-row items-center border ${passwords.new_password === passwords.confirm_password && passwords.confirm_password ? 'border-green-500' : state.isConfirmPasswordFocused ? "border-[#af1616]" : "border-gray-300"} rounded-lg px-3 py-2 mt-1`}>
              <Key size={20} color={passwords.new_password === passwords.confirm_password && passwords.confirm_password ? '#10b981' : '#6b7280'} className="mr-2" />
              <TextInput className="flex-1 text-[#1f2937] py-2" value={passwords.confirm_password} onChangeText={v => setPasswords(p => ({ ...p, confirm_password: v }))} onFocus={() => handleFocus("confirm_password")} onBlur={() => handleBlur("confirm_password")} secureTextEntry={!state.showConfirmPassword} autoCapitalize="none" />
              <TouchableOpacity onPress={() => setState(p => ({ ...p, showConfirmPassword: !p.showConfirmPassword }))}><Eye size={20} color={passwords.new_password === passwords.confirm_password && passwords.confirm_password ? '#10b981' : '#af1616'} /></TouchableOpacity>
            </View>
          </View>

          <PasswordValidationUI validation={passwordValidation} passwords={passwords} />

          <TouchableOpacity className={`h-14 bg-[#af1616] rounded-lg justify-center items-center flex-row shadow-sm ${state.loading ? "opacity-80" : ""}`} onPress={handleSubmit} disabled={state.loading}>
            {state.loading ? <ActivityIndicator color="white" /> : <Text className="text-white text-lg font-semibold">Update Password</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Toast />
    </KeyboardAvoidingView>
  );
};

export default OTPVerification;
