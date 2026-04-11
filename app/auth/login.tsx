import { API_BASE_URL } from '@/constants/Config';
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { useRouter } from "expo-router";
import { LogIn } from "lucide-react-native";
import React, { useRef, useState, useEffect } from "react";
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

// Import modular components
import { AuthBackground } from "@/components/auth/AuthBackground";
import { AuthLoadingModal } from "@/components/auth/AuthLoadingModal";
import { LoginHeader } from "@/components/auth/login/LoginHeader";
import { LoginInputs } from "@/components/auth/login/LoginInputs";

const LoginScreen = () => {
  const APP_URL = `${API_BASE_URL}/api/login.php`;

  const [loginData, setLoginData] = useState({ student_id: "", password: "" });
  const [loginFocused, setLoginFocused] = useState({ student_id: false, password: false });
  const [loginState, setLoginState] = useState({
    loading: false,
    error: "",
    showPassword: false,
    showLoginLoading: false,
    requiresOTP: false,
    requiresPolicyAcceptance: false,
  });

  const router = useRouter();
  const { login, clearUser, user } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);

  const usernameAnim = useRef(new Animated.Value(0)).current;
  const passwordAnim = useRef(new Animated.Value(0)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;

  const isWeb = Platform.OS === "web";

  useEffect(() => {
    clearUser();
    if (user && user.policy_accepted === 0) {
      setLoginState(prev => ({ ...prev, requiresPolicyAcceptance: true }));
      router.push({ pathname: "/auth/policy-acceptance", params: { student_id: user.student_id, user_data: JSON.stringify(user) } });
    }
    Animated.sequence([
      Animated.timing(logoAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(textAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
    ]).start();
  }, []);

  const labelPosition = (anim: Animated.Value) => anim.interpolate({ inputRange: [0, 1], outputRange: isWeb ? [20, 8] : [13, 0] });
  const labelSize = (anim: Animated.Value) => anim.interpolate({ inputRange: [0, 1], outputRange: isWeb ? [16, 13] : [16, 12] });
  const animateLabel = (anim: Animated.Value, toValue: number) => {
    Animated.spring(anim, { toValue, useNativeDriver: false, speed: 20, bounciness: 10 }).start();
  };

  const handleFocus = (field: string, anim: Animated.Value) => {
    setLoginFocused(prev => ({ ...prev, [field]: true })); animateLabel(anim, 1);
  };

  const handleBlur = (field: string, anim: Animated.Value) => {
    setLoginFocused(prev => ({ ...prev, [field]: false }));
    if (!loginData[field as keyof typeof loginData]) animateLabel(anim, 0);
  };

  const validateLoginForm = () => {
    if (!loginData.student_id.trim()) { Toast.show({ type: "error", text1: "Validation Error", text2: "Student ID is required" }); return false; }
    if (!loginData.password.trim()) { Toast.show({ type: "error", text1: "Validation Error", text2: "Password is required" }); return false; }
    return true;
  };

  const handleLogin = async () => {
    if (!validateLoginForm()) return;
    Keyboard.dismiss(); setLoginState(prev => ({ ...prev, loading: true, showLoginLoading: true }));
    try {
      const res = await axios.post(APP_URL, { student_id: loginData.student_id, password: loginData.password }, { timeout: 10000 });
      const result = res.data;
      if (result.success) {
        if (result.requires_otp) {
          setLoginState(prev => ({ ...prev, requiresOTP: true, loading: false, showLoginLoading: false }));
          router.push({ pathname: "/auth/otp-verification", params: { student_id: loginData.student_id, message: result.message, user_data: JSON.stringify(result.user_data || result.user || {}) } });
        } else if (result.requires_policy_acceptance) {
          setLoginState(prev => ({ ...prev, requiresPolicyAcceptance: true, loading: false, showLoginLoading: false }));
          router.push({ pathname: "/auth/policy-acceptance", params: { student_id: loginData.student_id, user_data: JSON.stringify(result.user_data || result.user || {}) } });
        } else if (result.user) {
          if (result.user.policy_accepted === 0) {
            setLoginState(prev => ({ ...prev, requiresPolicyAcceptance: true, loading: false, showLoginLoading: false }));
            router.push({ pathname: "/auth/policy-acceptance", params: { student_id: loginData.student_id, user_data: JSON.stringify(result.user) } });
          } else {
            const userData = { ...result.user, avatar: result.user.avatar || "https://msis.eduisync.io/swu-head.png", joinDate: result.user.joinDate || "Member since 2023", policy_accepted: 1 };
            await login(userData);
            Toast.show({ type: "success", text1: "Login Successful 🎉", text2: `Welcome ${result.user.first_name}` });
            setLoginState(prev => ({ ...prev, loading: false, showLoginLoading: false }));
            router.replace("/home");
          }
        }
      } else {
        Toast.show({ type: "error", text1: "Login Failed", text2: result.message });
        setLoginState(prev => ({ ...prev, loading: false, showLoginLoading: false }));
      }
    } catch (e: any) {
      Toast.show({ type: "error", text1: "Request Error", text2: e.message });
      setLoginState(prev => ({ ...prev, loading: false, showLoginLoading: false }));
    }
  };

  const logoStyle = { opacity: logoAnim, transform: [{ scale: logoAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }, { translateY: logoAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] };
  const textStyle = { opacity: textAnim, transform: [{ scale: textAnim.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }, { translateY: textAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-white">
      <AuthBackground />
      <AuthLoadingModal visible={loginState.showLoginLoading} message="Signing In..." />

      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }} keyboardShouldPersistTaps="handled" ref={scrollViewRef}>
        <View className="flex-1 justify-center px-4 py-6">
          <View className="bg-white opacity-90 p-8 rounded-2xl shadow-lg border border-gray-100 w-full mx-auto max-w-md">
            <LoginHeader logoStyle={logoStyle} textStyle={textStyle} />
            
            <LoginInputs
              loginData={loginData}
              setLoginData={setLoginData}
              loginFocused={loginFocused}
              handleFocus={handleFocus}
              handleBlur={handleBlur}
              usernameAnim={usernameAnim}
              passwordAnim={passwordAnim}
              labelPosition={labelPosition}
              labelSize={labelSize}
              showPassword={loginState.showPassword}
              setShowPassword={(show) => setLoginState(prev => ({ ...prev, showPassword: show }))}
            />

            <TouchableOpacity
              className={`h-14 flex flex-row bg-[#af1616] rounded-[8px] mb-4 justify-center items-center shadow-md ${loginState.loading ? "opacity-80" : ""}`}
              onPress={handleLogin}
              disabled={loginState.loading}
            >
              <Text className="text-white text-lg mr-2 font-semibold">{loginState.loading ? "Signing In..." : "Sign In"}</Text>
              <LogIn size={17} color="white" />
            </TouchableOpacity>

            <TouchableOpacity className="mt-3 items-center" onPress={() => router.navigate("/auth/forgot-password" as any)}>
              <Text className="text-[#af1616] text-[15px] font-medium">Forgot password?</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <Toast />
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
