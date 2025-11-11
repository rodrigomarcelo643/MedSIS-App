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
                Data Policy Agreement
              </Text>
            </View>

            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Terms and Conditions
            </Text>
            <Text className="text-base text-gray-700 mb-4 leading-6">
              The Medical Student Information System (MSIS) is designed to manage student academic records and documents in accordance with Republic Act No. 10173, also known as the Data Privacy Act of 2012, ensuring the protection of personal and sensitive information.
            </Text>

            <Text className="text-lg font-semibold text-gray-800 mb-3">
              System Purpose
            </Text>
            <Text className="text-base text-gray-700 mb-4 leading-6">
              MSIS serves as the official repository for student academic documents, grades, and administrative records throughout your medical education journey.
            </Text>

            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Document Integrity
            </Text>
            <Text className="text-base text-gray-700 mb-4 leading-6">
              All uploaded documents are verified for authenticity and stored with digital timestamps to maintain academic integrity and prevent unauthorized modifications.
            </Text>

            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Confidentiality Protection
            </Text>
            <Text className="text-base text-gray-700 mb-4 leading-6">
              All student records are treated with strict confidentiality. Access is limited to authorized personnel only, including faculty, administrators, and the student themselves.
            </Text>

            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Academic Use Only
            </Text>
            <Text className="text-base text-gray-700 mb-4 leading-6">
              Student information is used exclusively for educational administration, academic evaluation, and institutional compliance purposes.
            </Text>

            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Data Security Measures
            </Text>
            <Text className="text-base text-gray-700 mb-4 leading-6">
              All student data is protected through multiple security layers including encryption, access controls, and regular security audits to prevent unauthorized access or data breaches.
            </Text>

            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Student Rights
            </Text>
            <Text className="text-base text-gray-700 mb-4 leading-6">
              Students have the right to access, review, and request corrections to their personal information stored in the system, in accordance with data privacy regulations.
            </Text>

            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Student Document Management & Retention Policy
            </Text>
            <Text className="text-base text-gray-700 mb-4 leading-6">
              Your academic documents and records are managed with the highest security standards throughout your medical education journey:
            </Text>

            <Text className="text-base font-semibold text-gray-800 mb-2">
              Year 1 to Year 4 Students (Active Enrollment)
            </Text>
            <Text className="text-base text-gray-700 mb-4 leading-6">
              • Full access to all uploaded documents and academic records{"\n"}
              • Documents are backed up daily with 99.9% uptime guarantee{"\n"}
              • Real-time synchronization across all authorized devices{"\n"}
              • Version control for document updates and revisions{"\n"}
              • Secure download capabilities for personal copies
            </Text>

            <Text className="text-base font-semibold text-gray-800 mb-2">
              Post-Graduation (1 Year Recovery Period)
            </Text>
            <Text className="text-base text-gray-700 mb-4 leading-6">
              • Account converted to alumni status with limited access{"\n"}
              • Document Recovery Window: 1 full year to download all personal documents{"\n"}
              • Email notifications sent at 6 months and 1 month before deletion{"\n"}
              • Bulk download feature available for easy document retrieval{"\n"}
              • Academic transcripts remain accessible through official channels
            </Text>

            <Text className="text-base font-semibold text-gray-800 mb-2">
              Document Disposal (After 1 Year Post-Graduation)
            </Text>
            <Text className="text-base text-gray-700 mb-4 leading-6">
              • Secure deletion using DoD 5220.22-M standards (3-pass overwrite){"\n"}
              • Cryptographic erasure of encrypted data{"\n"}
              • Physical destruction of backup media{"\n"}
              • Certificate of destruction provided upon request{"\n"}
              • Only official academic records retained in university archives
            </Text>

            <Text className="text-base font-semibold text-gray-800 mb-2">
              Special Circumstances
            </Text>
            <Text className="text-base text-gray-700 mb-4 leading-6">
              • Dropped/Transferred Students: 6-month recovery period before deletion{"\n"}
              • Disciplinary Cases: Relevant documents retained for 7 years as per institutional policy{"\n"}
              • Legal Holds: Documents preserved as required by law or court order{"\n"}
              • Emergency Access: Family members may request access with proper legal documentation
            </Text>

            <View className="bg-yellow-50 p-4 rounded-lg mb-4 border border-yellow-200">
              <Text className="text-yellow-800 font-semibold mb-2">Important:</Text>
              <Text className="text-yellow-700 text-sm">
                It is your responsibility to download and secure personal copies of all important documents before the retention period expires. The university is not liable for any documents lost due to failure to retrieve them within the specified timeframe.
              </Text>
            </View>

            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Enhanced Security Measures
            </Text>
            <Text className="text-base text-gray-700 mb-4 leading-6">
              We implement multiple layers of security to protect your data:
            </Text>

            <Text className="text-base font-semibold text-gray-800 mb-2">
              Password Protection:
            </Text>
            <Text className="text-base text-gray-700 mb-3 leading-6">
              bcrypt hashing with salt rounds
            </Text>

            <Text className="text-base font-semibold text-gray-800 mb-2">
              Authentication:
            </Text>
            <Text className="text-base text-gray-700 mb-3 leading-6">
              • CAPTCHA verification on all logins{"\n"}
              • OTP Integration{"\n"}
              • 30-minute session timeout
            </Text>

            <Text className="text-base font-semibold text-gray-800 mb-2">
              Data Encryption:
            </Text>
            <Text className="text-base text-gray-700 mb-3 leading-6">
              • AES-256 for data at rest{"\n"}
              • TLS 1.3 for data in transit
            </Text>

            <Text className="text-base font-semibold text-gray-800 mb-2">
              Additional Security:
            </Text>
            <Text className="text-base text-gray-700 mb-4 leading-6">
              • Access Controls: Role-based access with audit logging{"\n"}
              • Monitoring: 24/7 security monitoring{"\n"}
              • Backups: Encrypted daily backups{"\n"}
              • Alumni Data: Segregated storage with additional restrictions{"\n"}
              • Breach Notification: Affected individuals will be notified within 72 hours of any data breach as required by law
            </Text>

            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Data Sharing & Third Parties
            </Text>
            <Text className="text-base text-gray-700 mb-4 leading-6">
              Your data may be shared only under these circumstances:{"\n"}
              • With government agencies as required by law (CHED, PRC, etc.){"\n"}
              • For academic research (anonymized/aggregated only){"\n"}
              • When legally compelled by court order{"\n"}
              • With alumni associations (opt-out available){"\n\n"}
              We never sell student or alumni data to third parties. All external sharing undergoes strict review by our Data Protection Officer.
            </Text>

            <Text className="text-lg font-semibold text-gray-800 mb-3">
              Policy Updates & Contact Information
            </Text>
            <Text className="text-base text-gray-700 mb-6 leading-6">
              This policy may be updated to comply with new regulations or institutional changes. Significant changes will be communicated via official MSIS notifications and email.{"\n\n"}
              Questions or Concerns: Contact the College of Medicine Data Protection Officer or the MSIS Administrator for any inquiries regarding your document security and privacy rights.
            </Text>

            <Text className="text-base text-gray-700 mb-6 leading-6 italic border-l-4 border-[#af1616] pl-4 py-2 bg-gray-50">
              By using the Medical Student Information System (MSIS), I acknowledge and agree to the terms outlined above. I understand my rights regarding document access, retention periods, and secure disposal procedures. I consent to the collection and processing of my academic data in accordance with the Data Privacy Act of 2012 (RA 10173) and institutional policies.
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
                  I accept the Data Policy Agreement and Terms of Service
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