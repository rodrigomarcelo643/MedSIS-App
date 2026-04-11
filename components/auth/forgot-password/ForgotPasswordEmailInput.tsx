import React from 'react';
import { View, TextInput, Animated } from 'react-native';
import { Mail } from "lucide-react-native";

interface ForgotPasswordEmailInputProps {
  email: string;
  setEmail: (email: string) => void;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  labelPosition: any;
  labelSize: any;
  otpSent: boolean;
}

export const ForgotPasswordEmailInput: React.FC<ForgotPasswordEmailInputProps> = ({
  email,
  setEmail,
  focused,
  onFocus,
  onBlur,
  labelPosition,
  labelSize,
  otpSent,
}) => (
  <View className="mb-6">
    <Animated.Text
      className="absolute left-10 z-10"
      style={{
        top: labelPosition,
        fontSize: labelSize,
        color: focused ? "#af1616" : "#4B5563",
        transform: [{ translateY: labelPosition }],
      }}
    >
      Email Address
    </Animated.Text>
    <View
      className={`border-b py-1 px-2 ${
        focused
          ? "border-[#af1616]"
          : "border-gray-400"
      }`}
    >
      <View className="flex-row items-center">
        <Mail
          size={20}
          color={focused ? "#af1616" : "#6b7280"}
          style={{ marginRight: 10, marginTop: 15 }}
        />
        <TextInput
          className="h-14 text-[#af1616] pt-5 flex-1"
          value={email}
          onChangeText={setEmail}
          onFocus={onFocus}
          onBlur={onBlur}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          editable={!otpSent}
        />
      </View>
    </View>
  </View>
);
