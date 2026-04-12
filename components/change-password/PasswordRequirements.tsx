import React from 'react';
import { View, Text } from 'react-native';
import { Check, X } from 'lucide-react-native';

interface PasswordRequirementsProps {
  validation: {
    hasMinLength: boolean;
    hasSpecialChar: boolean;
    hasNumber: boolean;
    hasUpperCase: boolean;
    isNotCommon: boolean;
    isDifferentFromCurrent: boolean;
  };
  backgroundColor: string;
  mutedColor: string;
}

export const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({
  validation,
  backgroundColor,
  mutedColor,
}) => {
  return (
    <View className="mt-0 mb-3 p-3 rounded-lg" style={{ backgroundColor }}>
      <Text className="text-sm font-medium mb-2" style={{ color: mutedColor }}>
        Password requirements:
      </Text>
      <View className="ml-1">
        <View className="flex-row items-center mb-1">
          {validation.hasMinLength ? (
            <Check size={14} color="#10b981" />
          ) : (
            <X size={14} color="#ef4444" />
          )}
          <Text
            className={`text-xs ml-2 ${
              validation.hasMinLength ? "text-green-600" : "text-red-600"
            }`}
          >
            At least 8 characters
          </Text>
        </View>
        <View className="flex-row items-center mb-1">
          {validation.hasSpecialChar ? (
            <Check size={14} color="#10b981" />
          ) : (
            <X size={14} color="#ef4444" />
          )}
          <Text
            className={`text-xs ml-2 ${
              validation.hasSpecialChar ? "text-green-600" : "text-red-600"
            }`}
          >
            At least one special character
          </Text>
        </View>
        <View className="flex-row items-center mb-1">
          {validation.hasNumber ? (
            <Check size={14} color="#10b981" />
          ) : (
            <X size={14} color="#ef4444" />
          )}
          <Text
            className={`text-xs ml-2 ${
              validation.hasNumber ? "text-green-600" : "text-red-600"
            }`}
          >
            At least one number
          </Text>
        </View>
        <View className="flex-row items-center mb-1">
          {validation.hasUpperCase ? (
            <Check size={14} color="#10b981" />
          ) : (
            <X size={14} color="#ef4444" />
          )}
          <Text
            className={`text-xs ml-2 ${
              validation.hasUpperCase ? "text-green-600" : "text-red-600"
            }`}
          >
            At least one uppercase letter
          </Text>
        </View>
        <View className="flex-row items-center mb-1">
          {validation.isNotCommon ? (
            <Check size={14} color="#10b981" />
          ) : (
            <X size={14} color="#ef4444" />
          )}
          <Text
            className={`text-xs ml-2 ${
              validation.isNotCommon ? "text-green-600" : "text-red-600"
            }`}
          >
            Not a common password
          </Text>
        </View>
        <View className="flex-row items-center">
          {validation.isDifferentFromCurrent ? (
            <Check size={14} color="#10b981" />
          ) : (
            <X size={14} color="#ef4444" />
          )}
          <Text
            className={`text-xs ml-2 ${
              validation.isDifferentFromCurrent
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            Different from current password
          </Text>
        </View>
      </View>
    </View>
  );
};
