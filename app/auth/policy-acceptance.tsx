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
              avatar: parsedUserData.avatar || "https://msis.eduisync.io/swu-head.png",
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
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-[#af1616] pt-16 px-4 pb-4 rounded-b-2xl shadow-sm">
        <View className="flex-row items-center mb-2">
          <TouchableOpacity
            onPress={() => router.replace("/auth/login")}
            className="mr-4 p-2 rounded-full bg-white/20"
          >
            <ArrowLeft size={20} color="white" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white flex-1" numberOfLines={1}>
            Privacy Policy Agreement
          </Text>
        </View>
        <Text className="text-white/90 text-sm ml-12">
          Please read and accept to continue
        </Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Policy Content */}
        <View className="bg-white p-2 mb-6 mt-6">
          <View className="mb-6">
            <View className="flex-row items-center mb-4">
              <View className="bg-[#af1616]/10 p-2 rounded-full mr-3">
                <FileText size={20} color="#af1616" />
              </View>
              <Text className="text-xl font-bold text-[#af1616]">
                MedSIS Privacy Policy
              </Text>
            </View>

            <Text className="text-base text-gray-700 mb-6 leading-6">
              Welcome to the Medical Student Information System (MedSIS). To continue, 
              please review and accept our Privacy Policy. This ensures you understand 
              how we handle your information.
            </Text>

            <View className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
              <Text className="text-blue-800 font-semibold mb-2">Key Points:</Text>
              <Text className="text-blue-700 text-sm">
                • We collect only necessary information for educational purposes{"\n"}
                • Your data is protected with industry-standard security{"\n"}
                • We don't share your information without your consent{"\n"}
                • You have control over your personal data
              </Text>
            </View>

            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Information We Collect
            </Text>
            <Text className="text-base text-gray-700 mb-4 leading-6">
              • Personal identification information (name, student ID, email){"\n"}
              • Academic records, grades, and course enrollment{"\n"}
              • Attendance records and academic performance{"\n"}
              • System usage data for optimization purposes
            </Text>

            <Text className="text-lg font-semibold text-gray-800 mb-3">
              How We Use Your Information
            </Text>
            <Text className="text-base text-gray-700 mb-4 leading-6">
              • To provide and maintain educational services{"\n"}
              • To manage your academic records and progress{"\n"}
              • To communicate important announcements{"\n"}
              • To improve system functionality and user experience
            </Text>

            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Data Protection & Security
            </Text>
            <Text className="text-base text-gray-700 mb-4 leading-6">
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Your data is stored on secure servers with encryption and regular security audits.
            </Text>

            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Your Rights
            </Text>
            <Text className="text-base text-gray-700 mb-4 leading-6">
              • Right to access your personal data{"\n"}
              • Right to correct inaccurate information{"\n"}
              • Right to request data deletion (subject to academic requirements){"\n"}
              • Right to data portability{"\n"}
              • Right to withdraw consent where applicable
            </Text>

            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Data Sharing
            </Text>
            <Text className="text-base text-gray-700 mb-4 leading-6">
              We do not sell, trade, or rent your personal information to third parties. We may share information only:{"\n"}
              • With authorized educational personnel{"\n"}
              • When required by law or regulation{"\n"}
              • With your explicit consent{"\n"}
              • For legitimate educational purposes
            </Text>

            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Cookies & Tracking
            </Text>
            <Text className="text-base text-gray-700 mb-4 leading-6">
              Our system may use cookies and similar technologies to enhance your experience, remember your preferences, and analyze system usage. You can control cookie settings through your device preferences.
            </Text>

            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Contact Information
            </Text>
            <Text className="text-base text-gray-700 mb-4 leading-6">
              If you have questions about this Privacy Policy or your data rights, please contact:{"\n"}
              • Email: privacy@medsis.edu{"\n"}
              • Phone: +63 (02) 123-4567{"\n"}
              • Office: Student Affairs Office, Medical School
            </Text>

            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Policy Updates
            </Text>
            <Text className="text-base text-gray-700 mb-6 leading-6">
              This Privacy Policy may be updated periodically to reflect changes in our practices or legal requirements. We will notify you of significant changes through the system or email. Continued use of MedSIS after updates constitutes acceptance of the revised policy.
            </Text>
           
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Data Security
            </Text>
            <Text className="text-base text-gray-700 mb-6 leading-6">
              We implement appropriate security measures to protect your personal data 
              against unauthorized access. These include encryption, access controls, 
              and regular security assessments.
            </Text>

            <Text className="text-base text-gray-700 mb-6 leading-6 italic border-l-4 border-[#af1616] pl-4 py-2 bg-gray-50">
              By accepting this policy, you acknowledge that you have read, 
              understood, and agree to the collection and use of your information 
              as described above.
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

          {/* Acceptance Section */}
          <Animated.View
            style={{ opacity: fadeAnim }}
            className={state.hasScrolledToBottom ? "block" : "opacity-0"}
          >
            <View className="bg-gray-50 p-4 rounded-lg mb-6">
          
              
              <TouchableOpacity
                className={`flex-row items-center p-4 rounded-lg mb-4 ${
                  state.policyAccepted
                    ? "bg-green-50 border-2 border-green-500"
                    : "bg-white border border-gray-300"
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
                  className={`text-base font-medium ml-3 flex-1 ${
                    state.policyAccepted ? "text-green-800" : "text-gray-600"
                  }`}
                >
                  I accept the Privacy Policy and Terms of Service
                </Text>
              </TouchableOpacity>

              <View
                className={`flex-row justify-between ${width < 380 ? "flex-col" : ""}`}
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
                  className={`bg-gray-200 px-6 py-4 rounded-lg ${width < 380 ? "mt-3" : "flex-1 ml-3"}`}
                  onPress={() => router.replace("/auth/login")}
                >
                  <Text className="text-gray-700 text-center font-medium">
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </ScrollView>

      <Toast />
    </View>
  );
};

export default PolicyAcceptance;