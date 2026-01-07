import RotatingDots from "@/components/ui/RotatingDots";
import { API_BASE_URL } from '@/constants/Config';
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { useRouter } from "expo-router";
import { Eye, EyeOff, Lock, LogIn, User } from "lucide-react-native";
import React, { useRef, useState, useEffect } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const LoginScreen = () => {

  const APP_URL = `${API_BASE_URL}/api/login.php`;

  const [loginData, setLoginData] = useState({
    student_id: "",
    password: "",
  });

  const [loginFocused, setLoginFocused] = useState({
    student_id: false,
    password: false,
  });

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

  // Animations
  const usernameAnim = useRef(new Animated.Value(0)).current;
  const passwordAnim = useRef(new Animated.Value(0)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;

  const isWeb = Platform.OS === "web";


  useEffect(() => {
    clearUser();
    // Check if user needs to accept policy (if coming from policy screen)
    const checkPolicyStatus = async () => {
      // If we have a user in context but they haven't accepted policy
      if (user && user.policy_accepted === 0) {
        setLoginState((prev) => ({
          ...prev,
          requiresPolicyAcceptance: true,
        }));
        
        router.push({
          pathname: "/auth/policy-acceptance",
          params: { 
            student_id: user.student_id,
            user_data: JSON.stringify(user)
          }
        });
      }
    };
    // Check if user needs to accept policy (if coming from policy screen)
    checkPolicyStatus();

    // Animate logo + app name smoothly
    Animated.sequence([
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(textAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  //==============================================
  // Animation Functions 
  const labelPosition = (anim: Animated.Value) =>
    anim.interpolate({
      inputRange: [0, 1],
      outputRange: isWeb ? [20, 8] : [13, 0],
    });

  const labelSize = (anim: Animated.Value) =>
    anim.interpolate({
      inputRange: [0, 1],
      outputRange: isWeb ? [16, 13] : [16, 12],
    });

  const animateLabel = (anim: Animated.Value, toValue: number) => {
    Animated.spring(anim, {
      toValue,
      useNativeDriver: false,
      speed: 20,
      bounciness: 10,
    }).start();
  };
  //==========================================================================

  //=========================================================================
  // Input Logic Functions
  const handleInputChange = (field: string, value: string) => {
    setLoginData((prev) => ({ ...prev, [field]: value }));
    if (loginState.error) setLoginState((prev) => ({ ...prev, error: "" }));
  };

  const handleFocus = (field: string, anim: Animated.Value) => {
    setLoginFocused((prev) => ({ ...prev, [field]: true }));
    animateLabel(anim, 1);
  };

  const handleBlur = (field: string, anim: Animated.Value) => {
    setLoginFocused((prev) => ({ ...prev, [field]: false }));
    if (!loginData[field as keyof typeof loginData]) {
      animateLabel(anim, 0);
    }
  };
//=============================================================================
//=============================================================================
// Form Validation Function 
  const validateLoginForm = () => {
    if (!loginData.student_id.trim()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Student ID is required",
        position: "top",
      });
      return false;
    }
    
    if (!loginData.password.trim()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Password is required",
        position: "top",
      });
      return false;
    }
    
    return true;
  };
  // ================================================================
  // <!--- Main Login Logic 
  const handleLogin = async () => {
    if (!validateLoginForm()) return;

    Keyboard.dismiss();
    setLoginState((prev) => ({
      ...prev,
      loading: true,
      showLoginLoading: true,
    }));

    try {
      const requestData = {
        student_id: loginData.student_id,
        password: loginData.password,
      };

      const response = await axios.post(APP_URL, requestData, {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      });

      const result = response.data;

      if (result.success) {
        if (result.requires_otp) {
          // First-time login - requires OTP
          setLoginState((prev) => ({
            ...prev,
            requiresOTP: true,
            loading: false,
            showLoginLoading: false,
          }));
          
          // Navigate to OTP screen
          router.push({
            pathname: "/auth/otp-verification",
            params: { 
              student_id: loginData.student_id,
              message: result.message || "Check your email for OTP",
              user_data: JSON.stringify(result.user_data || result.user || {})
            }
          });
        } else if (result.requires_policy_acceptance) {
          // Password updated, now requires policy acceptance
          setLoginState((prev) => ({
            ...prev,
            requiresPolicyAcceptance: true,
            loading: false,
            showLoginLoading: false,
          }));
          
          // Navigate to policy screen
          router.push({
            pathname: "/auth/policy-acceptance",
            params: { 
              student_id: loginData.student_id,
              user_data: JSON.stringify(result.user_data || result.user || {})
            }
          });
        } else if (result.user) {
          // Check if user has accepted the policy
          if (result.user.policy_accepted === 0) {
            // User needs to accept policy
            setLoginState((prev) => ({
              ...prev,
              requiresPolicyAcceptance: true,
              loading: false,
              showLoginLoading: false,
            }));
            
            // Navigate to policy screen
            router.push({
              pathname: "/auth/policy-acceptance",
              params: { 
                student_id: loginData.student_id,
                user_data: JSON.stringify(result.user)
              }
            });
          } else {
            // Regular login successful with policy accepted
            const userData = {
              ...result.user,
              avatar: result.user.avatar || "https://msis.eduisync.io/swu-head.png",
              contact_number: result.user.contact_number || "No phone added",
              joinDate: result.user.joinDate || "Member since 2023",
              policy_accepted: result.user.policy_accepted || 1,
            };

            await login(userData);

            Toast.show({
              type: "success",
              text1: "Login Successful 🎉",
              text2: `Welcome ${result.user.first_name} ${result.user.last_name}`,
              position: "top",
            });

            setLoginState((prev) => ({
              ...prev,
              loading: false,
              showLoginLoading: false,
            }));

            router.replace("/home");
          }
        }
      } else {
        Toast.show({
          type: "error",
          text1: "Login Failed",
          text2: result.message || "Invalid login credentials",
          position: "top",
        });
        setLoginState((prev) => ({
          ...prev,
          loading: false,
          showLoginLoading: false,
        }));
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Request Error",
        text2:
          error.response?.data?.message ||
          error.message ||
          "Something went wrong",
        position: "top",
      });
      setLoginState((prev) => ({
        ...prev,
        loading: false,
        showLoginLoading: false,
      }));
    }
  };
// ============================================================================================
// ============================================================================================
// Logo Animations
  const logoStyle = {
    opacity: logoAnim,
    transform: [
      {
        scale: logoAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.7, 1],
        }),
      },
      {
        translateY: logoAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  };

  const textStyle = {
    opacity: textAnim,
    transform: [
      {
        scale: textAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.7, 1],
        }),
      },
      {
        translateY: textAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
      keyboardVerticalOffset={Platform.OS === "android" ? 20 : 0}
    >
      {/* Grid Background */}
      <View className="absolute inset-0">
        <View className="flex-1 bg-white">
          {Array.from({ length: 20 }).map((_, i) => (
            <View
              key={`v-${i}`}
              className="absolute top-0 bottom-0 border-l border-gray-100"
              style={{ left: i * 40 }}
            />
          ))}
          {Array.from({ length: 40 }).map((_, i) => (
            <View
              key={`h-${i}`}
              className="absolute left-0 right-0 border-t border-gray-100"
              style={{ top: i * 40 }}
            />
          ))}
        </View>
      </View>

      {/* Watermark Logo */}
      <View className="absolute ml-4 inset-0">
        <Image
          source={require("../../assets/images/medicine-logo.png")}
          className="w-[98%] h-[98%] opacity-94"
          resizeMode="contain"
          accessibilityLabel="Medicine logo watermark"
        />
      </View>

      {/* Loading Modal */}
      <Modal visible={loginState.showLoginLoading} transparent>
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-2xl w-72 items-center">
            <ActivityIndicator size="large" color="#af1616" />
            <Text className="mt-4 text-lg font-medium text-gray-800">
              Signing In...
            </Text>
          </View>
        </View>
      </Modal>

      {/* Form */}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
        ref={scrollViewRef}
      >
        <View className="flex-1 justify-center px-4 py-6">
          <View className="bg-white opacity-90 p-8 rounded-2xl shadow-lg border border-gray-100 w-full mx-auto max-w-md">
            {/* Logo + Text Animated */}
            <View className="items-center mb-8">
              <Animated.View style={logoStyle}>
                <Image
                  source={require("../../assets/images/swu-head.png")}
                  className="w-20 h-20 mb-1"
                  accessibilityLabel="App logo"
                />
              </Animated.View>

              <Animated.View style={textStyle}>
                <Text className="text-5xl whitespace-nowrap text-center font-extrabold tracking-wide">
                  <Text
                    style={{
                      color: "#af1616",
                      fontWeight: "900",
                      textShadowColor: "rgba(0,0,0,0.3)",
                      textShadowOffset: { width: 1, height: 2 },
                      textShadowRadius: 3,
                    }}
                  >
                    Med
                  </Text>
                 
                  <Text
                    style={{
                      color: "#15803d",
                      fontWeight: "900",
                      textShadowColor: "rgba(0,0,0,0.3)",
                      textShadowOffset: { width: 1, height: 2 },
                      textShadowRadius: 3,
                    }}
                    
                  >
                    SIS
                  </Text>
                </Text>
              </Animated.View>

              <RotatingDots />
            </View>

            {/* Student ID Input */}
            <View className="mb-6">
              <Animated.Text
                className="absolute left-10 z-10"
                style={{
                  top: labelPosition(usernameAnim),
                  fontSize: labelSize(usernameAnim),
                  color: loginFocused.student_id ? "#af1616" : "#4B5563",
                  transform: [{ translateY: labelPosition(usernameAnim) }],
                }}
              >
                Student ID
              </Animated.Text>
              <View
                className={`border-b py-1 px-2 ${
                  loginFocused.student_id
                    ? "border-[#af1616]"
                    : "border-gray-400"
                }`}
              >
                <View className="flex-row items-center">
                  <User
                    size={20}
                    color={loginFocused.student_id ? "#af1616" : "#6b7280"}
                    style={{ marginRight: 10, marginTop: 15 }}
                  />
                  <TextInput
                    className="h-14 text-[#af1616] pt-5 flex-1"
                    value={loginData.student_id}
                    onChangeText={(text) =>
                      handleInputChange("student_id", text)
                    }
                    onFocus={() => handleFocus("student_id", usernameAnim)}
                    onBlur={() => handleBlur("student_id", usernameAnim)}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>
            </View>

            {/* Regular Password Input */}
            <View className="mb-6">
              <Animated.Text
                className="absolute left-10 z-10"
                style={{
                  top: labelPosition(passwordAnim),
                  fontSize: labelSize(passwordAnim),
                  color: loginFocused.password ? "#af1616" : "#6b7280",
                  transform: [{ translateY: labelPosition(passwordAnim) }],
                }}
              >
                Password
              </Animated.Text>
              <View
                className={`border-b py-1 px-2 ${
                  loginFocused.password ? "border-[#af1616]" : "border-gray-400"
                }`}
              >
                <View className="flex-row items-center">
                  <Lock
                    size={20}
                    color={loginFocused.password ? "#af1616" : "#6b7280"}
                    style={{ marginRight: 10, marginTop: 15 }}
                  />
                  <TextInput
                    className="h-14 text-[#af1616] pt-5 flex-1"
                    value={loginData.password}
                    onChangeText={(text) => handleInputChange("password", text)}
                    onFocus={() => handleFocus("password", passwordAnim)}
                    onBlur={() => handleBlur("password", passwordAnim)}
                    secureTextEntry={!loginState.showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() =>
                      setLoginState((prev) => ({
                        ...prev,
                        showPassword: !prev.showPassword,
                      }))
                    }
                    className="ml-2 px-2 py-1"
                    style={{ marginTop: 25 }}
                  >
                    {loginState.showPassword ? (
                      <EyeOff size={20} color="#af1616" />
                    ) : (
                      <Eye size={20} color="#af1616" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity
              className={`h-14 flex flex-row bg-[#af1616] rounded-[8px] mb-4 justify-center items-center shadow-md ${
                loginState.loading ? "opacity-80" : ""
              }`}
              onPress={handleLogin}
              disabled={loginState.loading}
            >
              <Text className="text-white text-lg mr-2 font-semibold">
                {loginState.loading ? "Signing In..." : "Sign In"}
              </Text>
              <LogIn size={17} color="white" />
            </TouchableOpacity>

            {/* Forgot password */}
            <TouchableOpacity
              className="mt-3 items-center"
              onPress={() =>
                Linking.openURL(`${API_BASE_URL}/forgot-password`)
              }
            >
              <Text className="text-[#af1616] text-[15px] font-medium">
                Forgot password?
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      {/** Toast UI */}
      <Toast />
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;