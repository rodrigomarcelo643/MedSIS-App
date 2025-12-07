import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from '@/constants/Config';
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  CheckSquare,
  ChevronDown,
  FileText,
  Scroll,
  Square,
  Shield,
  Lock,
  Users,
  Clock,
  AlertCircle,
  Database,
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

  const APP_URL = `${API_BASE_URL}/api/login.php`;
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
            Data Policy Agreement
          </Text>
        </View>
        <Text className="text-white/90 text-sm ml-12">
          Please read carefully before accepting
        </Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        className="flex-1 px-4 bg-gray-50"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Policy Content */}
        <View className="mb-6 mt-6">

          {/* Card 1: Terms */}
          <View className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-3">
              <View className="bg-blue-100 p-2 rounded-lg mr-3">
                <FileText size={20} color="#3b82f6" />
              </View>
              <Text className="text-lg font-bold text-gray-800 flex-1">
                Terms and Conditions
              </Text>
            </View>
            <Text className="text-sm text-gray-600 leading-5">
              The Medical Student Information System (MSIS) is designed to manage student academic records and documents in accordance with Republic Act No. 10173, also known as the Data Privacy Act of 2012, ensuring the protection of personal and sensitive information.
            </Text>
          </View>

          {/* Card 2: System Purpose */}
          <View className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-3">
              <View className="bg-purple-100 p-2 rounded-lg mr-3">
                <Database size={20} color="#9333ea" />
              </View>
              <Text className="text-lg font-bold text-gray-800 flex-1">
                System Purpose
              </Text>
            </View>
            <Text className="text-sm text-gray-600 leading-5">
              MSIS serves as the official repository for student academic documents, grades, and administrative records throughout your medical education journey.
            </Text>
          </View>

          {/* Card 3: Security */}
          <View className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-3">
              <View className="bg-green-100 p-2 rounded-lg mr-3">
                <Shield size={20} color="#15803d" />
              </View>
              <Text className="text-lg font-bold text-gray-800 flex-1">
                Data Security
              </Text>
            </View>
            <Text className="text-sm text-gray-600 leading-5 mb-2">
              All student data is protected through multiple security layers:
            </Text>
            <Text className="text-sm text-gray-600 leading-5">
              • Document integrity with digital timestamps{"\n"}
              • Strict confidentiality and access controls{"\n"}
              • Encryption and regular security audits{"\n"}
              • Academic use only
            </Text>
          </View>

          {/* Card 4: Student Rights */}
          <View className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-3">
              <View className="bg-amber-100 p-2 rounded-lg mr-3">
                <Users size={20} color="#d97706" />
              </View>
              <Text className="text-lg font-bold text-gray-800 flex-1">
                Your Rights
              </Text>
            </View>
            <Text className="text-sm text-gray-600 leading-5">
              Students have the right to access, review, and request corrections to their personal information stored in the system, in accordance with data privacy regulations.
            </Text>
          </View>

          {/* Card 5: Retention Policy */}
          <View className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-3">
              <View className="bg-indigo-100 p-2 rounded-lg mr-3">
                <Clock size={20} color="#4f46e5" />
              </View>
              <Text className="text-lg font-bold text-gray-800 flex-1">
                Document Retention
              </Text>
            </View>
            <Text className="text-sm text-gray-600 leading-5 mb-3">
              Your academic documents are managed with the highest security standards:
            </Text>
            
            <View className="bg-gray-50 rounded-lg p-3 mb-3">
              <Text className="text-sm font-semibold text-gray-800 mb-1">
                Active Students (Year 1-4)
              </Text>
              <Text className="text-xs text-gray-600 leading-4">
                Full access • Daily backups • Real-time sync
              </Text>
            </View>
            
            <View className="bg-gray-50 rounded-lg p-3 mb-3">
              <Text className="text-sm font-semibold text-gray-800 mb-1">
                Post-Graduation
              </Text>
              <Text className="text-xs text-gray-600 leading-4">
                1-year recovery period • Email notifications • Bulk download
              </Text>
            </View>
            
            <View className="bg-gray-50 rounded-lg p-3 mb-3">
              <Text className="text-sm font-semibold text-gray-800 mb-1">
                After 1 Year
              </Text>
              <Text className="text-xs text-gray-600 leading-4">
                Secure deletion • DoD standards • Official records archived
              </Text>
            </View>

            <View className="bg-amber-50 rounded-lg p-3 border border-amber-200">
              <View className="flex-row items-start">
                <AlertCircle size={16} color="#d97706" style={{ marginTop: 2, marginRight: 8 }} />
                <Text className="text-xs text-amber-800 flex-1 leading-4">
                  Download your documents before the retention period expires. The university is not liable for documents not retrieved within the timeframe.
                </Text>
              </View>
            </View>
          </View>

          {/* Card 6: Security Measures */}
          <View className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-3">
              <View className="bg-red-100 p-2 rounded-lg mr-3">
                <Lock size={20} color="#dc2626" />
              </View>
              <Text className="text-lg font-bold text-gray-800 flex-1">
                Security Measures
              </Text>
            </View>
            <Text className="text-sm text-gray-600 leading-5 mb-3">
              Multiple layers of security protect your data:
            </Text>
            <View className="space-y-2">
              <Text className="text-xs text-gray-600 leading-4">
                🔐 bcrypt password hashing{"\n"}
                🔑 CAPTCHA + OTP authentication{"\n"}
                🔒 AES-256 & TLS 1.3 encryption{"\n"}
                👁️ 24/7 security monitoring{"\n"}
                💾 Encrypted daily backups{"\n"}
                ⚠️ 72-hour breach notification
              </Text>
            </View>
          </View>

          {/* Card 7: Data Sharing */}
          <View className="bg-white rounded-xl p-5 mb-4 shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-3">
              <View className="bg-teal-100 p-2 rounded-lg mr-3">
                <Users size={20} color="#0d9488" />
              </View>
              <Text className="text-lg font-bold text-gray-800 flex-1">
                Data Sharing Policy
              </Text>
            </View>
            <Text className="text-sm text-gray-600 leading-5 mb-2">
              Your data may be shared only:
            </Text>
            <Text className="text-xs text-gray-600 leading-4">
              • With government agencies (CHED, PRC){"\n"}
              • For academic research (anonymized){"\n"}
              • When legally compelled{"\n"}
              • With alumni associations (opt-out available)
            </Text>
            <View className="bg-green-50 rounded-lg p-2 mt-3">
              <Text className="text-xs text-green-800 font-medium">
                ✓ We never sell your data to third parties
              </Text>
            </View>
          </View>

          {/* Final Agreement */}
          <View className="bg-gradient-to-r from-[#af1616]/5 to-[#15803d]/5 rounded-xl p-4 mb-4 border-l-4 border-[#af1616]">
            <Text className="text-xs text-gray-700 leading-5 italic">
              By using MSIS, I acknowledge and agree to the terms outlined above. I understand my rights regarding document access, retention periods, and secure disposal procedures. I consent to the collection and processing of my academic data in accordance with the Data Privacy Act of 2012 (RA 10173).
            </Text>
          </View>

          {/* Scroll to bottom indicator */}
          {!state.hasScrolledToBottom && (
            <View className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200 shadow-sm">
              <View className="flex-row items-center justify-center">
                <Scroll size={18} color="#3b82f6" className="mr-2" />
                <Text className="text-blue-700 text-center text-sm font-medium">
                  Please scroll to the bottom to accept
                </Text>
              </View>
              <TouchableOpacity
                onPress={scrollToBottom}
                className="flex-row items-center justify-center mt-2 bg-blue-100 rounded-lg py-2 px-4"
              >
                <ChevronDown size={16} color="#3b82f6" />
                <Text className="text-blue-600 text-xs ml-1 font-medium">
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
            <View className="bg-white rounded-xl p-0 mb-">
              <TouchableOpacity
                className={`flex-row items-center p-4 rounded-xl mb-4 ${
                  state.policyAccepted
                    ? "bg-green-50 border-2 border-green-500 shadow-sm"
                    : "bg-gray-50 border-2 border-gray-300"
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
                  className={`text-sm font-semibold ml-3 flex-1 ${
                    state.policyAccepted ? "text-green-800" : "text-gray-600"
                  }`}
                >
                  I accept the Data Policy Agreement and Terms of Service
                </Text>
              </TouchableOpacity>

              <View
                className={`flex-row justify-between ${width < 380 ? "flex-col" : ""}`}
              >
                <TouchableOpacity
                  className={`bg-[#af1616] px-6 py-4 rounded-xl ${width < 380 ? "" : "flex-1"} shadow-md ${
                    !state.policyAccepted ? "opacity-50" : ""
                  }`}
                  onPress={handleAcceptPolicy}
                  disabled={!state.policyAccepted || state.loading}
                >
                  {state.loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white text-center font-semibold">
                      Continue to MedSIS
                    </Text>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity
                  className={`bg-gray-200 px-6 py-4 rounded-xl ${width < 380 ? "mt-3" : "flex-1 ml-3"} shadow-sm`}
                  onPress={() => router.replace("/auth/login")}
                >
                  <Text className="text-gray-700 text-center font-semibold">
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