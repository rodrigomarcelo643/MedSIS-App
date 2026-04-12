import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ImageIcon } from 'lucide-react-native';
import { AcademicCalendarDocument } from '@/@types/screens/school-calendar';
import { FileIcon } from './FileIcon';

interface DocumentViewerModalProps {
  visible: boolean;
  onClose: () => void;
  document: AcademicCalendarDocument | null;
  onDownload: () => void;
}

export const DocumentViewerModal = ({
  visible,
  onClose,
  document,
  onDownload,
}: DocumentViewerModalProps) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black">
        <View className="bg-[#af1616] pt-12 pb-4 px-5 flex-row items-center">
          <TouchableOpacity
            onPress={onClose}
            className="mr-4"
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text
            className="text-white text-lg font-bold flex-1"
            numberOfLines={1}
          >
            {document?.file_name}
          </Text>
        </View>
        <View className="flex-1 justify-center items-center">
          {document?.mime_type.includes("image") ? (
            <View className="flex-1 justify-center items-center">
              <ImageIcon size={64} color="#af1616" />
              <Text className="text-white mt-4 text-center">
                Image preview not available. Download to view.
              </Text>
              <TouchableOpacity
                className="bg-[#af1616] px-6 py-3 rounded-lg mt-4"
                onPress={onDownload}
              >
                <Text className="text-white">Download File</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="flex-1 justify-center items-center">
              <FileIcon mimeType={document?.mime_type || ""} />
              <Text className="text-white mt-4 text-center">
                Use the download button to view this file
              </Text>
              <TouchableOpacity
                className="bg-[#af1616] px-6 py-3 rounded-lg mt-4"
                onPress={onDownload}
              >
                <Text className="text-white">Download File</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};
