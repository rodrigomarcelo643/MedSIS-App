import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  CheckSquare,
  ChevronDown,
  FileText,
  Scroll,
  Square,
} from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

const PolicyAcceptance = () => {
  const APP_URL =
    process.env.API_BASE_URL || "https://msis.eduisync.io/api/login.php";
  const { student_id, user_data } = useLocalSearchParams();
  const router = useRouter();
  const { login, user, updateUserPolicyStatus } = useAuth();

  const [state, setState] = useState({
    loading: false,
    policyAccepted: false,
    hasScrolledToBottom: false,
  });

  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { width } = Dimensions.get("window");

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isAtBottom =
      contentOffset.y >= contentSize.height - layoutMeasurement.height - 20;

    if (isAtBottom && !state.hasScrolledToBottom) {
      setState((prev) => ({ ...prev, hasScrolledToBottom: true }));
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

const handleAcceptPolicy = async () => {
  if (!state.policyAccepted) {
    Toast.show({
      type: "error",
      text1: "Validation Error",
      text2: "Please accept the policy to continue",
      position: "top",
    });
    return;
  }

  setState((prev) => ({ ...prev, loading: true }));

  try {
    const requestData = {
      student_id,
      accept_policy: true,
    };

    const response = await axios.post(APP_URL, requestData, {
      headers: { "Content-Type": "application/json" },
      timeout: 10000,
    });

    const result = response.data;

    if (result.success) {
      // If we have user data from the API response, use it
      if (result.user) {
        try {
          // Create complete user data with policy accepted and any additional info
          const userData = {
            ...result.user, // Use the complete user object from API
            avatar: result.user.avatar || "https://i.pravatar.cc/150",
            contact_number: result.user.contact_number || "No phone added",
            joinDate: result.user.joinDate || "Member since 2023",
            policy_accepted: 1, // Set to accepted
          };
          
          // If we have password from OTP verification, include it
          if (user_data && typeof user_data === 'string') {
            try {
              const parsedUserData = JSON.parse(user_data);
              if (parsedUserData.password) {
                userData.password = parsedUserData.password;
              }
            } catch (e) {
              console.error("Error parsing user data:", e);
            }
          }
          
          console.log("Complete user data for login:", userData);
          
          // Login with the complete user data
          await login(userData);
        } catch (e) {
          console.error("Error processing user data:", e);
        }
      } else if (user_data && typeof user_data === 'string') {
        // Fallback: use data from params if no user in API response
        try {
          const parsedUserData = JSON.parse(user_data);
          
          // Create complete user data with policy accepted
          const userData = {
            ...parsedUserData,
            avatar: parsedUserData.avatar || "https://i.pravatar.cc/150",
            contact_number: parsedUserData.contact_number || "No phone added",
            joinDate: parsedUserData.joinDate || "Member since 2023",
            policy_accepted: 1, // Set to accepted
          };
          
          console.log("Fallback user data for login:", userData);
          
          // Login with the complete user data
          await login(userData);
        } catch (e) {
          console.error("Error parsing user data:", e);
        }
      } else if (user) {
        // If no user data from API or params but we have a user in context, update policy status
        await updateUserPolicyStatus(true);
      }

      Toast.show({
        type: "success",
        text1: "Policy Accepted",
        text2: "Welcome to MedSIS!",
        position: "top",
      });

      // Navigate directly to home screen using replace
      router.replace("/(tabs)/home");
    } else {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: result.message || "Failed to accept policy",
        position: "top",
      });
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
  } finally {
    setState((prev) => ({ ...prev, loading: false }));
  }
};
  return (
    <View className="flex-1 bg-white mt-10">
      <ScrollView
        ref={scrollViewRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View className="flex-row items-center mb-6 mt-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mr-4 p-2 rounded-full bg-gray-100"
          >
            <ArrowLeft size={24} color="#af1616" />
          </TouchableOpacity>
          <Text
            className="text-2xl font-bold text-[#af1616] flex-1"
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            Privacy Policy Agreement
          </Text>
        </View>

        <View className="bg-white p-2 mb-6">
          {/* Policy Content */}
          <View className="mb-6">
            <View className="flex-row items-center mb-4">
              <FileText size={24} color="#af1616" className="mr-2" />
              <Text className="text-xl font-bold text-[#af1616]">
                MedSIS Privacy Policy
              </Text>
            </View>

            <Text className="text-base text-gray-700 mb-4 leading-6">
              Welcome to the Medical Student Information System (MedSIS). To
              continue using our services, we require you to review and accept
              our Privacy Policy and Terms of Service. This ensures you
              understand how we collect, use, and protect your information.
            </Text>

            <Text className="text-lg font-semibold text-gray-800 mb-3 mt-6">
              📋 Information We Collect
            </Text>
            <Text className="text-base text-gray-700 mb-4 leading-6">
              • Personal identification information (name, student ID, email,
              phone number){"\n"}• Academic records, grades, and course
              enrollment{"\n"}• Attendance records and academic performance
              {"\n"}• System usage data and interaction logs{"\n"}• Device
              information for security and optimization purposes
            </Text>

            <Text className="text-lg font-semibold text-gray-800 mb-3 mt-6">
              🔒 How We Use Your Information
            </Text>
            <Text className="text-base text-gray-700 mb-4 leading-6">
              • To provide and maintain educational services{"\n"}• To manage
              your academic records and progress{"\n"}• To communicate important
              announcements and updates{"\n"}• To improve system functionality
              and user experience{"\n"}• To ensure system security and prevent
              unauthorized access
            </Text>

            <Text className="text-lg font-semibold text-gray-800 mb-3 mt-6">
              🤝 Data Sharing and Disclosure
            </Text>
            <Text className="text-base text-gray-700 mb-4 leading-6">
              Your data is treated with the utmost confidentiality. We may share
              information with:{"\n"}• Authorized faculty and academic staff for
              educational purposes{"\n"}• Administrative departments for
              record-keeping and reporting{"\n"}• Third-party service providers
              under strict confidentiality agreements{"\n"}• When required by
              law or to protect our rights and safety
            </Text>

            <Text className="text-lg font-semibold text-gray-800 mb-3 mt-6">
              📊 Data Retention
            </Text>
            <Text className="text-base text-gray-700 mb-4 leading-6">
              We retain your personal data for as long as necessary to fulfill
              the purposes outlined in this policy, comply with legal
              obligations, resolve disputes, and enforce our agreements.
              Academic records may be retained indefinitely for historical and
              verification purposes.
            </Text>

            <Text className="text-lg font-semibold text-gray-800 mb-3 mt-6">
              🔐 Your Rights and Choices
            </Text>
            <Text className="text-base text-gray-700 mb-4 leading-6">
              You have the right to:{"\n"}• Access and review your personal
              information{"\n"}• Request corrections to inaccurate data{"\n"}•
              Request deletion of your data where applicable{"\n"}• Object to
              certain processing activities{"\n"}• Receive your data in a
              portable format{"\n"}• Withdraw consent at any time (where
              processing is based on consent)
            </Text>

            <Text className="text-lg font-semibold text-gray-800 mb-3 mt-6">
              🛡️ Security Measures
            </Text>
            <Text className="text-base text-gray-700 mb-4 leading-6">
              We implement appropriate technical and organizational measures to
              protect your personal data against unauthorized access,
              alteration, disclosure, or destruction. These include encryption,
              access controls, secure servers, and regular security assessments.
            </Text>

            <Text className="text-lg font-semibold text-gray-800 mb-3 mt-6">
              🌐 International Data Transfers
            </Text>
            <Text className="text-base text-gray-700 mb-4 leading-6">
              Your information may be transferred to and processed in countries
              other than your own. We ensure such transfers comply with
              applicable data protection laws and provide adequate protection
              for your rights through appropriate safeguards.
            </Text>

            <Text className="text-lg font-semibold text-gray-800 mb-3 mt-6">
              📞 Contact Information
            </Text>
            <Text className="text-base text-gray-700 mb-6 leading-6">
              If you have questions about this policy or your data, contact our
              Data Protection Officer:{"\n"}• Email: dpo@medsis.edu{"\n"}•
              Phone: +1 (555) 123-4567{"\n"}• Office: Administration Building,
              Room 305
            </Text>

            <Text className="text-base text-gray-700 mb-6 leading-6 italic">
              By accepting this policy, you acknowledge that you have read,
              understood, and agree to the collection, use, and disclosure of
              your personal information as described above.
            </Text>
          </View>

          {/* Scroll to bottom indicator */}
          {!state.hasScrolledToBottom && (
            <View className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <View className="flex-row items-center justify-center">
                <Scroll size={18} color="#3b82f6" className="mr-2" />
                <Text className="text-blue-700 text-center">
                  Please scroll to the bottom to accept the policy
                </Text>
              </View>
              <TouchableOpacity
                onPress={scrollToBottom}
                className="flex-row items-center justify-center mt-2"
              >
                <ChevronDown size={16} color="#3b82f6" />
                <Text className="text-blue-600 text-sm ml-1">
                  Scroll to bottom
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Acceptance Toggle */}
          <Animated.View
            style={{ opacity: fadeAnim }}
            className={state.hasScrolledToBottom ? "block" : "opacity-0"}
          >
            <TouchableOpacity
              className={`flex-row items-center p-2 rounded-lg mb-6 ${
                state.policyAccepted
                  ? "bg-green-100 border-2 border-green-500"
                  : "bg-gray-100 border border-gray-300"
              }`}
              onPress={() =>
                state.hasScrolledToBottom &&
                setState((prev) => ({
                  ...prev,
                  policyAccepted: !prev.policyAccepted,
                }))
              }
              disabled={!state.hasScrolledToBottom}
            >
              {state.policyAccepted ? (
                <CheckSquare size={24} color="#15803d" />
              ) : (
                <Square size={24} color="#9ca3af" />
              )}
              <Text
                className={`text-base font-medium ml-3 ${
                  state.policyAccepted ? "text-green-800" : "text-gray-600"
                }`}
              >
                I accept the Privacy Policy and Terms of Service
              </Text>
            </TouchableOpacity>

            <View
              className={`flex-row mb-3 justify-between ${width < 380 ? "flex-col" : ""}`}
            >
              <TouchableOpacity
                className={`bg-[#af1616] px-6 py-4 rounded-lg ${width < 380 ? "" : "flex-1"} ${
                  !state.policyAccepted ? "opacity-50" : ""
                }`}
                onPress={handleAcceptPolicy}
                disabled={!state.policyAccepted || state.loading}
              >
                {state.loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center font-medium">
                    Continue to MedSIS
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                className={`bg-gray-300 px-6 py-4 rounded-lg ${width < 380 ? "mt-3" : "flex-1 ml-3"}`}
                onPress={() => router.back()}
              >
                <Text className="text-gray-700 text-center font-medium">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </ScrollView>

      <Toast />
    </View>
  );
};

export default PolicyAcceptance;