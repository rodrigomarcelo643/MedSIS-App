import React from 'react';
import { View, Text, TouchableOpacity, Modal, Image } from 'react-native';
import { Camera, Image as ImageIcon, X, LogOut, CheckCircle, XCircle } from 'lucide-react-native';
import { UpdateModal } from '@/@types/tabs';

// Avatar Selection Modal
export const AvatarModal = ({ visible, onClose, onPickImage, theme, textColor, cardColor }: {
  visible: boolean;
  onClose: () => void;
  onPickImage: (useCamera: boolean) => void;
  theme: string;
  textColor: string;
  cardColor: string;
}) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View className="flex-1 justify-center items-center bg-black/50 p-4">
      <View className="bg-white rounded-xl p-6 w-full max-w-md" style={{ backgroundColor: cardColor }}>
        <View className="items-center mb-4">
          <View className="bg-blue-100 p-4 rounded-full mb-3">
            <Camera size={28} color="#2563EB" />
          </View>
          <Text className="text-xl font-bold text-gray-900" style={{ color: textColor}}>
            Update Profile Picture
          </Text>
        </View>
        <Text className="text-gray-500 text-center mb-6">Choose how you want to update your profile picture</Text>
        <View className="space-y-3">
          <TouchableOpacity className="flex-row items-center py-4 px-4 bg-blue-50 mb-3 rounded-xl" onPress={() => onPickImage(false)} activeOpacity={0.7}>
            <View className="w-10 h-10 bg-blue-100 rounded-lg items-center justify-center mr-3">
              <ImageIcon className="w-6 h-6 text-green-500" />
            </View>
            <Text className="text-blue-600 font-medium">Choose from Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center py-4 px-4 bg-green-50 rounded-xl" onPress={() => onPickImage(true)} activeOpacity={0.7}>
            <View className="w-10 h-10 bg-green-100 rounded-lg items-center justify-center mr-3">
              <Camera size={20} color="#16a34a" />
            </View>
            <Text className="text-green-800 font-medium">Take Photo</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity className="py-3 bg-gray-200 rounded-xl mt-4 items-center" onPress={onClose} activeOpacity={0.7}>
          <Text className="text-gray-800 font-medium">Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

// View Photo Modal
export const ViewPhotoModal = ({ visible, onClose, avatarSource, isEditing, onShowAvatarModal }: {
  visible: boolean;
  onClose: () => void;
  avatarSource: any;
  isEditing: boolean;
  onShowAvatarModal: () => void;
}) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View className="flex-1 justify-center items-center bg-black/90 p-4">
      <TouchableOpacity className="absolute top-10 right-4 z-10" onPress={onClose} activeOpacity={0.7}>
        <View className="bg-white/20 p-2 rounded-full">
          <X size={24} color="white" />
        </View>
      </TouchableOpacity>
      <View className="w-80 h-80 rounded-lg bg-white items-center justify-center overflow-hidden">
        <Image source={avatarSource} className="w-full h-full" resizeMode="contain" />
      </View>
      {isEditing && (
        <TouchableOpacity className="mt-6 bg-[#8C2323] rounded-lg px-6 py-3" onPress={onShowAvatarModal} activeOpacity={0.7}>
          <Text className="text-white font-medium">Change Photo</Text>
        </TouchableOpacity>
      )}
    </View>
  </Modal>
);

// Logout Confirmation Modal
export const LogoutModal = ({ visible, onClose, onLogout }: {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
}) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View className="flex-1 justify-center items-center bg-black/50 p-4">
      <View className="bg-white rounded-xl p-6 w-full max-w-md">
        <View className="items-center mb-4">
          <View className="bg-red-100 p-4 rounded-full mb-3">
            <LogOut size={28} color="#dc2626" />
          </View>
          <Text className="text-xl font-bold text-gray-900">Confirm Logout</Text>
        </View>
        <Text className="text-gray-600 text-center mb-6">Are you sure you want to log out of your account?</Text>
        <View className="flex-row">
          <TouchableOpacity className="flex-1 py-3 border mr-3 border-gray-300 rounded-xl items-center" onPress={onClose} activeOpacity={0.7}>
            <Text className="text-gray-800 font-medium">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 py-3 bg-red-500 rounded-xl items-center" onPress={onLogout} activeOpacity={0.7}>
            <Text className="text-white font-medium">Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

// Update Status Modal
export const StatusModal = ({ visible, onClose, updateStatus }: {
  visible: boolean;
  onClose: () => void;
  updateStatus: UpdateModal;
}) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View className="flex-1 justify-center items-center bg-black/50 p-4">
      <View className="bg-white rounded-xl p-6 w-full max-w-md">
        <View className="items-center mb-4">
          <View className={`p-4 rounded-full mb-3 ${updateStatus.success ? "bg-green-100" : "bg-red-100"}`}>
            {updateStatus.success ? <CheckCircle size={28} color="#10B981" /> : <XCircle size={28} color="#dc2626" />}
          </View>
          <Text className={`text-xl font-bold ${updateStatus.success ? "text-green-800" : "text-red-800"}`}>
            {updateStatus.success ? "Success" : "Error"}
          </Text>
        </View>
        <Text className="text-gray-600 text-center mb-6">{updateStatus.message}</Text>
        <TouchableOpacity className={`py-3 rounded-xl items-center ${updateStatus.success ? "bg-green-500" : "bg-red-500"}`} onPress={onClose} activeOpacity={0.7}>
          <Text className="text-white font-medium">OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);
