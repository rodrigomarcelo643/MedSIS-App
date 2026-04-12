import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Mail } from 'lucide-react-native';

interface EmailOtpRequestProps {
  email: string | undefined;
  loading: boolean;
  onRequestOTP: () => void;
  mutedColor: string;
  textColor: string;
}

export const EmailOtpRequest: React.FC<EmailOtpRequestProps> = ({
  email,
  loading,
  onRequestOTP,
  mutedColor,
  textColor,
}) => {
  return (
    <View className="mb-2 mt-3">
      <View className="flex-row items-center gap-2">
        <View
          className="flex-1 flex-row items-center border rounded-lg px-3 py-1.5"
          style={{ borderColor: mutedColor + '80' }}
        >
          <Mail size={18} color="#6b7280" />
          <TextInput
            className="flex-1 ml-0 text-[12px]"
            style={{ color: textColor }}
            value={email || ''}
            editable={false}
            placeholder="No email"
            placeholderTextColor={mutedColor}
          />
        </View>
        <TouchableOpacity
          className="bg-[#af1616] rounded-lg px-4 py-4"
          onPress={onRequestOTP}
          disabled={loading || !email}
          style={{ opacity: loading || !email ? 0.5 : 1 }}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text className="text-white text-sm font-bold">Get OTP</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};
