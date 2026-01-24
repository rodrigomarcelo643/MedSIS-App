import RotatingDots from "@/components/ui/RotatingDots";
import { API_BASE_URL } from '@/constants/Config';
import axios from "axios";
import { useRouter } from "expo-router";
import { ArrowLeft, Mail, Send, User } from "lucide-react-native";
import React, { useRef, useState, useEffect } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const ForgotPasswordScreen = () => {
  const APP_URL = `${API_BASE_URL}/api/forgot-password.php`;

  const [formData, setFormData] = useState({
    email: "",
  });

  const [focused, setFocused] = useState({
    email: false,
  });

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const [state, setState] = useState({
    loading: false,
    showLoading: false,
    otpSent: false,
    verifying: false,
  });

  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const inputs = useRef<Array<TextInput | null>>([]);

  // Animations
  const emailAnim = useRef(new Animated.Value(0)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;

  const isWeb = Platform.OS === "web";

  useEffect(() => {
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

  // OTP handling functions
  const handleOtpChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return; // Only allow numbers
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: { nativeEvent: { key: string } }, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFocus = (field: string, anim: Animated.Value) => {
    setFocused((prev) => ({ ...prev, [field]: true }));
    animateLabel(anim, 1);
  };

  const handleBlur = (field: string, anim: Animated.Value) => {
    setFocused((prev) => ({ ...prev, [field]: false }));
    if (!formData[field as keyof typeof formData]) {
      animateLabel(anim, 0);
    }
  };

  // Form Validation Function 
  const validateForm = () => {
    if (!formData.email.trim()) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Email is required",
        position: "top",
      });
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter a valid email address",
        position: "top",
      });
      return false;
    }
    
    return true;
  };

  // Main Submit Logic
  const sendOTP = async () => {
    if (!validateForm()) return;

    Keyboard.dismiss();
    setState((prev) => ({
      ...prev,
      loading: true,
      showLoading: true,
    }));

    try {
      const requestData = {
        email: formData.email,
        action: "send_otp",
      };

      const response = await axios.post(APP_URL, requestData, {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      });

      const result = response.data;

      if (result.success) {
        Toast.show({
          type: "success",
          text1: "OTP Sent 📧",
          text2: result.message || "Check your email for OTP",
          position: "top",
        });

        setState((prev) => ({
          ...prev,
          loading: false,
          showLoading: false,
          otpSent: true,
        }));
      } else {
        Toast.show({
          type: "error",
          text1: "Request Failed",
          text2: result.message || "Email not found",
          position: "top",
        });
        setState((prev) => ({
          ...prev,
          loading: false,
          showLoading: false,
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
      setState((prev) => ({
        ...prev,
        loading: false,
        showLoading: false,
      }));
    }
  };

  const verifyOTP = async () => {
    if (otp.some(digit => !digit)) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter all OTP digits",
        position: "top",
      });
      return;
    }

    setState((prev) => ({
      ...prev,
      verifying: true,
    }));

    try {
      const requestData = {
        email: formData.email,
        otp: otp.join(""),
        action: "verify_otp",
      };

      const response = await axios.post(APP_URL, requestData, {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      });

      const result = response.data;

      if (result.success) {
        Toast.show({
          type: "success",
          text1: "OTP Verified ✅",
          text2: result.message || "OTP verified successfully",
          position: "top",
        });

        setState((prev) => ({
          ...prev,
          verifying: false,
        }));

        // Navigate to reset password screen
        setTimeout(() => {
          router.push({
            pathname: "/auth/reset-password" as any,
            params: { email: formData.email }
          });
        }, 1000);
      } else {
        Toast.show({
          type: "error",
          text1: "Verification Failed",
          text2: result.message || "Invalid OTP",
          position: "top",
        });
        setState((prev) => ({
          ...prev,
          verifying: false,
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
      setState((prev) => ({
        ...prev,
        verifying: false,
      }));
    }
  };

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
      <Modal visible={state.showLoading || state.verifying} transparent>
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-6 rounded-2xl w-72 items-center">
            <ActivityIndicator size="large" color="#af1616" />
            <Text className="mt-4 text-lg font-medium text-gray-800">
              {state.verifying ? "Verifying OTP..." : "Sending OTP..."}
            </Text>
          </View>
        </View>
      </Modal>

      {/* Back Button */}
      <View className="absolute top-12 left-4 z-10">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-white/80 p-3 rounded-full shadow-md"
        >
          <ArrowLeft size={24} color="#af1616" />
        </TouchableOpacity>
      </View>

      {/* Form */}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
        keyboardShouldPersistTaps="handled"
        ref={scrollViewRef}
      >
        <View className="flex-1 justify-center px-4 py-6">
          <View className="bg-white opacity-90 p-8 rounded-2xl shadow-lg border border-gray-100 w-full mx-auto max-w-md">
            {/* Logo + Text Animated */}
            <View className="items-center mb-8 z-10">
              <Animated.View style={logoStyle}>
                <Image
                  source={require("../../assets/images/swu-head.png")}
                  className="w-20 h-20 mb-1"
                  accessibilityLabel="App logo"
                />
              </Animated.View>

              <Animated.View style={textStyle}>
                <Text className="text-4xl whitespace-nowrap text-center font-extrabold tracking-wide mb-2">
                  <Text
                    style={{
                      color: "#af1616",
                      fontWeight: "900",
                      textShadowColor: "rgba(0,0,0,0.3)",
                      textShadowOffset: { width: 1, height: 2 },
                      textShadowRadius: 3,
                    }}
                  >
                    Forgot Password
                  </Text>
                </Text>
                <Text className="text-gray-600 text-center text-sm">
                  Enter your email address to reset your password
                </Text>
              </Animated.View>

              <RotatingDots />
            </View>

            {/* Email Input */}
            <View className="mb-6">
              <Animated.Text
                className="absolute left-10 z-10"
                style={{
                  top: labelPosition(emailAnim),
                  fontSize: labelSize(emailAnim),
                  color: focused.email ? "#af1616" : "#4B5563",
                  transform: [{ translateY: labelPosition(emailAnim) }],
                }}
              >
                Email Address
              </Animated.Text>
              <View
                className={`border-b py-1 px-2 ${
                  focused.email
                    ? "border-[#af1616]"
                    : "border-gray-400"
                }`}
              >
                <View className="flex-row items-center">
                  <Mail
                    size={20}
                    color={focused.email ? "#af1616" : "#6b7280"}
                    style={{ marginRight: 10, marginTop: 15 }}
                  />
                  <TextInput
                    className="h-14 text-[#af1616] pt-5 flex-1"
                    value={formData.email}
                    onChangeText={(text) =>
                      handleInputChange("email", text)
                    }
                    onFocus={() => handleFocus("email", emailAnim)}
                    onBlur={() => handleBlur("email", emailAnim)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    editable={!state.otpSent}
                  />
                </View>
              </View>
            </View>

            {/* Send OTP Button */}
            {!state.otpSent && (
              <TouchableOpacity
                className={`h-14 flex flex-row bg-[#af1616] rounded-[8px] mb-6 justify-center items-center shadow-md ${
                  state.loading ? "opacity-80" : ""
                }`}
                onPress={sendOTP}
                disabled={state.loading}
              >
                <Text className="text-white text-lg mr-2 font-semibold">
                  {state.loading ? "Sending..." : "Send OTP"}
                </Text>
                <Send size={17} color="white" />
              </TouchableOpacity>
            )}

            {/* OTP Input Section */}
            {state.otpSent && (
              <>
                <View className="mb-6">
                  <Text className="text-sm text-gray-600 mb-3">Enter OTP Code</Text>
                  <View className="flex-row justify-between items-center">
                    {otp.map((digit, index) => (
                      <View key={index} className="justify-center items-center">
                        <TextInput
                          ref={ref => { inputs.current[index] = ref; }}
                          className={`w-12 h-12 border ${
                            digit ? 'border-[#af1616]' : 'border-gray-300'
                          } rounded-lg text-center text-lg font-bold`}
                          value={digit}
                          onChangeText={value => handleOtpChange(value, index)}
                          onKeyPress={e => handleKeyPress(e, index)}
                          keyboardType="numeric"
                          maxLength={1}
                          selectTextOnFocus
                        />
                      </View>
                    ))}
                  </View>
                </View>

                {/* Verify OTP Button */}
                <TouchableOpacity
                  className={`h-14 flex flex-row bg-[#15803d] rounded-[8px] mb-4 justify-center items-center shadow-md ${
                    state.verifying ? "opacity-80" : ""
                  }`}
                  onPress={verifyOTP}
                  disabled={state.verifying}
                >
                  <Text className="text-white text-lg mr-2 font-semibold">
                    {state.verifying ? "Verifying..." : "Verify OTP"}
                  </Text>
                  <Send size={17} color="white" />
                </TouchableOpacity>
              </>
            )}

            {/* Back to login */}
            <TouchableOpacity
              className="mt-3 items-center"
              onPress={() => router.back()}
            >
              <Text className="text-[#af1616] text-[15px] font-medium">
                Back to Sign In
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

export default ForgotPasswordScreen;