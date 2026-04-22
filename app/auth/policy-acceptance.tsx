import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL } from '@/constants/Config';
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  FileText,
  Shield,
  Lock,
  Users,
  Clock,
  AlertCircle,
  Database,
} from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  Text,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

// Import modular components
import { AuthLoadingModal } from "@/components/auth/AuthLoadingModal";
import { PolicyHeader } from "@/components/auth/policy/PolicyHeader";
import { PolicyCard } from "@/components/auth/policy/PolicyCard";
import { PolicyAcceptanceSection } from "@/components/auth/policy/PolicyAcceptanceSection";

const PolicyAcceptance = () => {
  const APP_URL = `${API_BASE_URL}/api/login.php`;
  const { student_id, user_data } = useLocalSearchParams();
  const router = useRouter();
  const { login, user, updateUserPolicyStatus } = useAuth();

  const [state, setState] = useState({ loading: false, policyAccepted: false, hasScrolledToBottom: false });

  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    if (contentOffset.y >= contentSize.height - layoutMeasurement.height - 20 && !state.hasScrolledToBottom) {
      setState(prev => ({ ...prev, hasScrolledToBottom: true }));
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }
  };

  const handleAcceptPolicy = async () => {
    if (!state.policyAccepted) { Toast.show({ type: "error", text1: "Error", text2: "Accept policy to continue" }); return; }
    setState(prev => ({ ...prev, loading: true }));
    try {
      const res = await axios.post(APP_URL, { student_id, accept_policy: true }, { timeout: 10000 });
      if (res.data.success) {
        let finalUser: any = null;
        if (res.data.user) {
          finalUser = { ...res.data.user, avatar: res.data.user.avatar || "https://ardms.eduisync.io/swu-head.png", policy_accepted: 1 };
          if (user_data && typeof user_data === 'string') {
            try { const parsed = JSON.parse(user_data); if (parsed.password) finalUser.password = parsed.password; } catch (e) {}
          }
        } else if (user_data && typeof user_data === 'string') {
          const parsed = JSON.parse(user_data);
          finalUser = { ...parsed, policy_accepted: 1 };
        } else if (user) { await updateUserPolicyStatus(true); }

        if (finalUser) await login(finalUser);
        Toast.show({ type: "success", text1: "Welcome to ARDMS!" });
        setTimeout(() => router.replace("/(tabs)/home"), 1000);
      } else Toast.show({ type: "error", text1: "Error", text2: res.data.message });
    } catch (e: any) { Toast.show({ type: "error", text1: "Error", text2: e.message });
    } finally { setState(prev => ({ ...prev, loading: false })); }
  };

  return (
    <View className="flex-1 bg-white">
      <PolicyHeader onBack={() => router.replace("/auth/login")} title="Data Policy Agreement" />
      <AuthLoadingModal visible={state.loading} message="Processing... Please wait" />

      <ScrollView ref={scrollViewRef} onScroll={handleScroll} scrollEventThrottle={16} className="flex-1 px-4 bg-gray-50" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="mb-6 mt-6">
          <PolicyCard title="Terms and Conditions" icon={<FileText size={20} color="#3b82f6" />} iconBgColor="bg-blue-100">
            <Text className="text-sm text-gray-600 leading-5">The ARDMS Academic Record and Document Management System is designed to manage student academic records and documents in accordance with Republic Act No. 10173 (Data Privacy Act of 2012).</Text>
          </PolicyCard>

          <PolicyCard title="System Purpose" icon={<Database size={20} color="#9333ea" />} iconBgColor="bg-purple-100">
            <Text className="text-sm text-gray-600 leading-5">ARDMS serves as the official repository for student academic documents, grades, and administrative records throughout your medical education journey.</Text>
          </PolicyCard>

          <PolicyCard title="Data Security" icon={<Shield size={20} color="#15803d" />} iconBgColor="bg-green-100">
            <Text className="text-sm text-gray-600 leading-5">• Document integrity with digital timestamps{"\n"}• Strict confidentiality and access controls{"\n"}• Encryption and regular security audits</Text>
          </PolicyCard>

          <PolicyCard title="Your Rights" icon={<Users size={20} color="#d97706" />} iconBgColor="bg-amber-100">
            <Text className="text-sm text-gray-600 leading-5">Students have the right to access, review, and request corrections to their personal information stored in the system.</Text>
          </PolicyCard>

          <PolicyCard title="Document Retention" icon={<Clock size={20} color="#4f46e5" />} iconBgColor="bg-indigo-100">
            <Text className="text-sm text-gray-600 leading-5 mb-3">Your academic documents are managed with the highest security standards:</Text>
            <View className="bg-gray-50 rounded-lg p-3 mb-3"><Text className="text-sm font-semibold text-gray-800">Active Students: </Text><Text className="text-xs text-gray-600">Full access • Daily backups</Text></View>
            <View className="bg-gray-50 rounded-lg p-3 mb-3"><Text className="text-sm font-semibold text-gray-800">After 1 Year: </Text><Text className="text-xs text-gray-600">Secure deletion • DoD standards</Text></View>
            <View className="bg-amber-50 rounded-lg p-3 border border-amber-200 flex-row items-start"><AlertCircle size={16} color="#d97706" style={{ marginRight: 8 }} /><Text className="text-xs text-amber-800 flex-1">Download your documents before retention expires.</Text></View>
          </PolicyCard>

          <PolicyCard title="Security Measures" icon={<Lock size={20} color="#dc2626" />} iconBgColor="bg-red-100">
            <Text className="text-xs text-gray-600 leading-4">🔐 bcrypt hashing • 🔑 OTP authentication • 🔒 TLS 1.3 encryption • 💾 Daily backups</Text>
          </PolicyCard>

          <View className="bg-gradient-to-r from-[#af1616]/5 to-[#15803d]/5 rounded-xl p-4 mb-4 border-l-4 border-[#af1616]">
            <Text className="text-xs text-gray-700 leading-5 italic">By using ARDMS, I acknowledge and agree to the terms outlined above. I consent to the collection and processing of my academic data.</Text>
          </View>

          <PolicyAcceptanceSection
            fadeAnim={fadeAnim}
            hasScrolledToBottom={state.hasScrolledToBottom}
            policyAccepted={state.policyAccepted}
            setPolicyAccepted={(val) => setState(p => ({ ...p, policyAccepted: val }))}
            loading={state.loading}
            onAccept={handleAcceptPolicy}
            onCancel={() => router.replace("/auth/login")}
            scrollToBottom={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          />
        </View>
      </ScrollView>
      <Toast />
    </View>
  );
};

export default PolicyAcceptance;
