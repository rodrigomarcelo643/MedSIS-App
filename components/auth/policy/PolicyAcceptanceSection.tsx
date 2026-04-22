import React from 'react';
import { View, Text, TouchableOpacity, Animated, ActivityIndicator, Dimensions } from 'react-native';
import { CheckCircle2, Square, ChevronDown, Scroll } from "lucide-react-native";

interface PolicyAcceptanceSectionProps {
  fadeAnim: Animated.Value;
  hasScrolledToBottom: boolean;
  policyAccepted: boolean;
  setPolicyAccepted: (accepted: boolean) => void;
  loading: boolean;
  onAccept: () => void;
  onCancel: () => void;
  scrollToBottom: () => void;
}

export const PolicyAcceptanceSection: React.FC<PolicyAcceptanceSectionProps> = ({
  fadeAnim,
  hasScrolledToBottom,
  policyAccepted,
  setPolicyAccepted,
  loading,
  onAccept,
  onCancel,
  scrollToBottom,
}) => {
  const { width } = Dimensions.get("window");

  return (
    <View className="mb-6">
      {/* Scroll to bottom indicator */}
      {!hasScrolledToBottom && (
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
        className={hasScrolledToBottom ? "block" : "opacity-0"}
      >
        <View className="bg-gray-50 rounded-lg mb-6">
          <TouchableOpacity
            className={`flex-row items-center p-4 rounded mb-4 ${
              policyAccepted
                ? "bg-green-50 border-2 border-green-500"
                : "bg-white border border-gray-300"
            }`}
            onPress={() => hasScrolledToBottom && setPolicyAccepted(!policyAccepted)}
            disabled={!hasScrolledToBottom}
          >
            {policyAccepted ? (
              <CheckCircle2 size={24} color="#15803d" />
            ) : (
              <Square size={24} color="#9ca3af" />
            )}
            <Text
              className={`text-base font-medium ml-3 flex-1 ${
                policyAccepted ? "text-green-800" : "text-gray-600"
              }`}
            >
              I accept the Data Policy Agreement and Terms of Service
            </Text>
          </TouchableOpacity>

          <View className={`flex-row justify-between ${width < 380 ? "flex-col" : ""}`}>
            <TouchableOpacity
              className={`bg-[#af1616] px-6 py-4 rounded-lg ${width < 380 ? "" : "flex-1"} ${
                !policyAccepted ? "opacity-50" : ""
              }`}
              onPress={onAccept}
              disabled={!policyAccepted || loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center font-medium">
                  Continue to ARDMS
                </Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              className={`bg-gray-200 px-6 py-4 rounded-lg ${width < 380 ? "mt-3" : "flex-1 ml-3"}`}
              onPress={onCancel}
            >
              <Text className="text-gray-700 text-center font-medium">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};
