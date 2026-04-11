import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

interface OtpInputGridProps {
  otp: string[];
  handleOtpChange: (value: string, index: number) => void;
  handleKeyPress: (e: any, index: number) => void;
  inputs: React.MutableRefObject<Array<TextInput | null>>;
  canResend: boolean;
  resendCountdown: number;
  onResend: () => void;
  formatTime: (seconds: number) => string;
  loading: boolean;
}

export const OtpInputGrid: React.FC<OtpInputGridProps> = ({
  otp,
  handleOtpChange,
  handleKeyPress,
  inputs,
  canResend,
  resendCountdown,
  onResend,
  formatTime,
  loading,
}) => (
  <View className="mb-3">
    <Text className="text-sm text-gray-600 mb-3">Enter OTP Code</Text>
    <View className="flex-row justify-between items-center">
      {otp.map((digit, index) => (
        <View key={index} className="justify-center items-center">
          <TextInput
            ref={ref => { inputs.current[index] = ref; }}
            className={`w-14 h-14 border ${digit ? 'border-[#af1616]' : 'border-gray-300'} rounded-lg text-center text-lg font-bold`}
            value={digit}
            onChangeText={value => handleOtpChange(value, index)}
            onKeyPress={e => handleKeyPress(e, index)}
            keyboardType="numeric"
            maxLength={6}
            selectTextOnFocus
            onFocus={() => {
              inputs.current[index]?.setNativeProps({
                selection: { start: 0, end: otp[index].length }
              });
            }}
          />
        </View>
      ))}
    </View>
    
    <View className="mt-4 flex-row justify-center items-center">
      <Text className="text-gray-600 text-sm mr-2">
        Didn't receive the code?
      </Text>
      {canResend ? (
        <TouchableOpacity onPress={onResend} disabled={loading}>
          <Text className="text-[#af1616] font-semibold">Resend OTP</Text>
        </TouchableOpacity>
      ) : (
        <Text className="text-gray-500 text-sm">
          Resend in {formatTime(resendCountdown)}
        </Text>
      )}
    </View>
  </View>
);
