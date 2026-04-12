import React from 'react';
import { View, TextInput, TouchableOpacity, Animated, Text } from 'react-native';
import { Key, Eye, EyeOff } from 'lucide-react-native';

interface PasswordInputProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  error?: string;
  showPassword: boolean;
  onToggleShowPassword: () => void;
  labelStyle: any;
  isValid?: boolean;
  isFocused: boolean;
  cardColor: string;
  textColor: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  value,
  onChangeText,
  onFocus,
  onBlur,
  error,
  showPassword,
  onToggleShowPassword,
  labelStyle,
  isValid = false,
  isFocused,
  cardColor,
  textColor,
}) => {
  return (
    <View className="mb-6">
      <View className="relative">
        <Animated.Text style={[labelStyle, { backgroundColor: cardColor }]}>
          {label}
        </Animated.Text>
        <View
          className={`flex-row items-center border ${
            error
              ? "border-red-500"
              : isValid
              ? "border-green-500"
              : isFocused
              ? "border-[#af1616]"
              : "border-gray-300"
          } rounded-lg px-3 py-2 mt-1`}
        >
          <Key
            size={20}
            color={error ? "#ef4444" : isValid ? "#10b981" : "#6b7280"}
            className="mr-2"
          />
          <TextInput
            className="flex-1 text-[#1f2937] py-2"
            style={{ color: textColor }}
            value={value}
            onChangeText={onChangeText}
            onFocus={onFocus}
            onBlur={onBlur}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity onPress={onToggleShowPassword}>
            {showPassword ? (
              <EyeOff
                size={20}
                color={error ? "#ef4444" : isValid ? "#10b981" : "#af1616"}
              />
            ) : (
              <Eye
                size={20}
                color={error ? "#ef4444" : isValid ? "#10b981" : "#af1616"}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
      {error ? (
        <Text className="text-red-500 text-xs mt-1">{error}</Text>
      ) : null}
    </View>
  );
};
