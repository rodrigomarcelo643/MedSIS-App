import { API_BASE_URL } from '@/constants/Config';
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Check, Eye, Key, X } from "lucide-react-native";
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
import { PasswordValidationUI } from "@/components/auth/otp/PasswordValidationUI";
import { ResetPasswordHeader } from "@/components/auth/reset-password/ResetPasswordHeader";
import { ResetPasswordModal } from "@/components/auth/reset-password/ResetPasswordModal";

const ResetPasswordScreen = () => {
  const { email } = useLocalSearchParams();
  const router = useRouter();
  
  const [passwords, setPasswords] = useState({ new_password: "", confirm_password: "" });
  const [state, setState] = useState({ loading: false, showNewPassword: false, showConfirmPassword: false, isNewPasswordFocused: false, isConfirmPasswordFocused: false });
  const [passwordValidation, setPasswordValidation] = useState({ hasMinLength: false, hasSpecialChar: false, hasNumber: false, hasUpperCase: false, isNotCommon: false, allValid: false });
  const [errors, setErrors] = useState({ new_password: "", confirm_password: "" });
  const [modal, setModal] = useState({ visible: false, type: "", title: "", message: "" });

  const newLabelPosition = useRef(new Animated.Value(0)).current;
  const confirmLabelPosition = useRef(new Animated.Value(0)).current;

  const commonPasswords = ["password", "123456", "qwerty", "letmein", "welcome", "admin"];

  useEffect(() => {
    const validations = {
      hasMinLength: passwords.new_password.length >= 8,
      hasSpecialChar: /[!@#$%^&*(),.?\":{}|<>]/.test(passwords.new_password),
      hasNumber: /\d/.test(passwords.new_password),
      hasUpperCase: /[A-Z]/.test(passwords.new_password),
      isNotCommon: !commonPasswords.includes(passwords.new_password.toLowerCase()),
    };
    setPasswordValidation({ ...validations, allValid: Object.values(validations).every((v) => v) });
  }, [passwords.new_password]);

  const handleFocus = (field: string) => {
    const anim = field === "new_password" ? newLabelPosition : confirmLabelPosition;
    setState(prev => ({ ...prev, [field === "new_password" ? "isNewPasswordFocused" : "isConfirmPasswordFocused"]: true }));
    Animated.timing(anim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  };

  const handleBlur = (field: string) => {
    const anim = field === "new_password" ? newLabelPosition : confirmLabelPosition;
    const val = field === "new_password" ? passwords.new_password : passwords.confirm_password;
    setState(prev => ({ ...prev, [field === "new_password" ? "isNewPasswordFocused" : "isConfirmPasswordFocused"]: false }));
    if (!val) Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  };

  const resetPassword = async () => {
    if (!passwords.new_password || !passwordValidation.allValid || passwords.new_password !== passwords.confirm_password) {
      setErrors({ new_password: !passwords.new_password ? "Required" : (!passwordValidation.allValid ? "Invalid" : ""), confirm_password: passwords.new_password !== passwords.confirm_password ? "Match fail" : "" });
      return;
    }
    setState(prev => ({ ...prev, loading: true }));
    try {
      const res = await axios.post(`${API_BASE_URL}/api/forgot-password.php`, { action: "reset_password", email, new_password: passwords.new_password });
      if (res.data.success) setModal({ visible: true, type: "success", title: "Success", message: "Password reset successfully!" });
      else setModal({ visible: true, type: "error", title: "Error", message: res.data.message || "Failed" });
    } catch (e: any) { setModal({ visible: true, type: "error", title: "Error", message: e.message });
    } finally { setState(prev => ({ ...prev, loading: false })); }
  };

  const getLabelStyle = (anim: Animated.Value, isNew: boolean) => ({
    position: "absolute" as "absolute", left: 35, zIndex: 1, backgroundColor: "white", paddingHorizontal: 4,
    top: anim.interpolate({ inputRange: [0, 1], outputRange: [18, -3] }),
    fontSize: anim.interpolate({ inputRange: [0, 1], outputRange: [14, 12] }),
    color: anim.interpolate({ inputRange: [0, 1], outputRange: ["#6b7280", (isNew ? passwordValidation.allValid : (passwords.new_password === passwords.confirm_password && passwords.confirm_password)) ? "#10b981" : "#af1616"] }),
  });

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-gray-50">
      <ResetPasswordHeader onBack={() => router.back()} title="Reset Password" />
      <ScrollView className="flex-1 px-3 py-6" keyboardShouldPersistTaps="handled">
        <View className="bg-white p-3 mt-10 rounded-xl shadow-sm">
          <Text className="text-center text-gray-600 mb-6">Create a new password for {email}</Text>

          <View className="mb-6 relative">
            <Animated.Text style={getLabelStyle(newLabelPosition, true)}>New Password</Animated.Text>
            <View className={`flex-row items-center border ${passwordValidation.allValid ? "border-green-500" : state.isNewPasswordFocused ? "border-[#af1616]" : "border-gray-300"} rounded-lg px-3 py-2 mt-1`}>
              <Key size={20} color={passwordValidation.allValid ? "#10b981" : "#6b7280"} className="mr-2" />
              <TextInput className="flex-1 text-[#1f2937] py-2" value={passwords.new_password} onChangeText={v => setPasswords(p => ({ ...p, new_password: v }))} onFocus={() => handleFocus("new_password")} onBlur={() => handleBlur("new_password")} secureTextEntry={!state.showNewPassword} autoCapitalize="none" />
              <TouchableOpacity onPress={() => setState(p => ({ ...p, showNewPassword: !p.showNewPassword }))}><Eye size={20} color={passwordValidation.allValid ? "#10b981" : "#af1616"} /></TouchableOpacity>
            </View>
          </View>

          <View className="mb-3 relative">
            <Animated.Text style={getLabelStyle(confirmLabelPosition, false)}>Confirm Password</Animated.Text>
            <View className={`flex-row items-center border ${passwords.new_password === passwords.confirm_password && passwords.confirm_password ? "border-green-500" : state.isConfirmPasswordFocused ? "border-[#af1616]" : "border-gray-300"} rounded-lg px-3 py-2 mt-1`}>
              <Key size={20} color={passwords.new_password === passwords.confirm_password && passwords.confirm_password ? "#10b981" : "#6b7280"} className="mr-2" />
              <TextInput className="flex-1 text-[#1f2937] py-2" value={passwords.confirm_password} onChangeText={v => setPasswords(p => ({ ...p, confirm_password: v }))} onFocus={() => handleFocus("confirm_password")} onBlur={() => handleBlur("confirm_password")} secureTextEntry={!state.showConfirmPassword} autoCapitalize="none" />
              <TouchableOpacity onPress={() => setState(p => ({ ...p, showConfirmPassword: !p.showConfirmPassword }))}><Eye size={20} color={passwords.new_password === passwords.confirm_password && passwords.confirm_password ? "#10b981" : "#af1616"} /></TouchableOpacity>
            </View>
            {passwords.confirm_password.length > 0 && (
              <View className="mt-2 flex-row items-center">
                {passwords.new_password === passwords.confirm_password ? <Check size={14} color="#10b981" /> : <X size={14} color="#ef4444" />}
                <Text className={`text-xs ml-2 ${passwords.new_password === passwords.confirm_password ? "text-green-600" : "text-red-600"}`}>{passwords.new_password === passwords.confirm_password ? "Passwords match" : "Passwords do not match"}</Text>
              </View>
            )}
          </View>

          <PasswordValidationUI validation={passwordValidation} passwords={passwords} />

          <TouchableOpacity className={`h-14 bg-[#af1616] rounded-xl justify-center items-center flex-row shadow-lg ${state.loading ? "opacity-80" : ""}`} onPress={resetPassword} disabled={state.loading}>
            {state.loading ? <ActivityIndicator color="white" size="small" /> : <Text className="text-white text-base font-bold">Reset Password</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ResetPasswordModal visible={modal.visible} type={modal.type} title={modal.title} message={modal.message} onClose={() => { setModal(p => ({ ...p, visible: false })); if (modal.type === "success") router.push("/auth/login" as any); }} />
      <Toast />
    </KeyboardAvoidingView>
  );
};

export default ResetPasswordScreen;