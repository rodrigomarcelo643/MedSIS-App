import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';

interface OtpVerificationProps {
  otp: string[];
  setOtp: (otp: string[]) => void;
  otpError: string;
  otpInputs: React.MutableRefObject<Array<TextInput | null>>;
  timer: number;
  resendLoading: boolean;
  onResend: () => void;
  onVerify: () => void;
  loading: boolean;
  textColor: string;
  mutedColor: string;
  cardColor: string;
  handleOtpChange: (value: string, index: number) => void;
  handleOtpKeyPress: (e: any, index: number) => void;
}

export const OtpVerification: React.FC<OtpVerificationProps> = ({
  otp,
  setOtp,
  otpError,
  otpInputs,
  timer,
  resendLoading,
  onResend,
  onVerify,
  loading,
  textColor,
  mutedColor,
  cardColor,
  handleOtpChange,
  handleOtpKeyPress,
}) => {
  return (
    <View>
      <Text className="text-sm font-semibold mb-3" style={{ color: textColor }}>
        Enter OTP Code
      </Text>
      <View className="flex-row justify-between mb-4">
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              if (ref) otpInputs.current[index] = ref;
            }}
            className="w-12 h-14 border-2 rounded-xl text-center text-xl font-bold"
            style={{
              borderColor: otpError
                ? '#ef4444'
                : digit
                ? '#af1616'
                : mutedColor + '40',
              color: textColor,
              backgroundColor: cardColor,
            }}
            value={digit}
            onChangeText={(value) => {
              if (value.length > 1) {
                const digits = value.replace(/\D/g, '').slice(0, 6).split('');
                const newOtp = [...otp];
                digits.forEach((d, i) => {
                  if (index + i < 6) newOtp[index + i] = d;
                });
                setOtp(newOtp);
                const nextIndex = Math.min(index + digits.length, 5);
                otpInputs.current[nextIndex]?.focus();
              } else {
                handleOtpChange(value, index);
              }
            }}
            onKeyPress={(e) => handleOtpKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={6}
            selectTextOnFocus
            onFocus={() => {
              otpInputs.current[index]?.setNativeProps({
                selection: { start: 0, end: otp[index].length },
              });
            }}
          />
        ))}
      </View>
      {otpError ? (
        <Text className="text-red-500 text-xs mb-3">{otpError}</Text>
      ) : null}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-sm" style={{ color: mutedColor }}>
          Didn't receive code?
        </Text>
        <TouchableOpacity
          onPress={onResend}
          disabled={timer > 0 || resendLoading}
        >
          <Text
            className="text-sm font-semibold"
            style={{ color: timer > 0 ? mutedColor : '#af1616' }}
          >
            {resendLoading
              ? 'Sending...'
              : timer > 0
              ? `Resend in ${timer}s`
              : 'Resend OTP'}
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        className={`h-14 bg-[#af1616] rounded-xl justify-center items-center flex-row shadow-lg ${
          loading ? 'opacity-80' : ''
        }`}
        onPress={onVerify}
        disabled={loading}
        style={{ elevation: 3 }}
      >
        {loading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <Text className="text-white text-base font-bold">
            Verify & Change Password
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};
