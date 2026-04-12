import React from 'react';
import { View, Text, Modal, ActivityIndicator } from 'react-native';

interface ChatLoadingModalProps {
  visible: boolean;
  cardColor: string;
  textColor: string;
}

export const ChatLoadingModal = ({ visible, cardColor, textColor }: ChatLoadingModalProps) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
    >
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View className="rounded-lg p-6 items-center" style={{ backgroundColor: cardColor, minWidth: 200 }}>
          <ActivityIndicator size="large" color="#af1616" />
          <Text className="mt-4 text-base font-medium" style={{ color: textColor }}>Loading chat...</Text>
        </View>
      </View>
    </Modal>
  );
};
