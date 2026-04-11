import React from 'react';
import { View, Text, Modal, ActivityIndicator } from 'react-native';

interface AuthLoadingModalProps {
  visible: boolean;
  message: string;
}

export const AuthLoadingModal: React.FC<AuthLoadingModalProps> = ({
  visible,
  message,
}) => (
  <Modal visible={visible} transparent>
    <View className="flex-1 justify-center items-center bg-black/50">
      <View className="bg-white p-6 rounded-2xl w-72 items-center">
        <ActivityIndicator size="large" color="#af1616" />
        <Text className="mt-4 text-lg font-medium text-gray-800">
          {message}
        </Text>
      </View>
    </View>
  </Modal>
);
