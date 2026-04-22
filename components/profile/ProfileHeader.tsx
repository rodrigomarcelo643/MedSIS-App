import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Camera } from 'lucide-react-native';

interface ProfileHeaderProps {
  isGraduating: boolean;
  isEditing: boolean;
  userData: any;
  avatarSource: any;
  textColor: string;
  onShowViewPhoto: () => void;
  onShowAvatarModal: () => void;
  onStartEditing: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  isGraduating,
  isEditing,
  userData,
  avatarSource,
  textColor,
  onShowViewPhoto,
  onShowAvatarModal,
  onStartEditing,
}) => {
  return (
    <View className={`items-center mb-6 ${isGraduating ? "bg-blue-500 p-5 rounded-3xl " : ""}`}>
      <View className="relative mb-4">
        <TouchableOpacity onPress={onShowViewPhoto} activeOpacity={0.8}>
          <View className="w-28 h-28 rounded-full border-4 border-white shadow-lg bg-white items-center justify-center overflow-hidden">
            <Image
              source={avatarSource || require('../../assets/swu_header.jpg')}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
          {isEditing && (
            <TouchableOpacity 
              className="absolute bottom-0 right-0 bg-[#8C2323] p-2 rounded-full shadow-md"
              onPress={onShowAvatarModal}
              activeOpacity={0.8}
            >
              <Camera size={16} color="white" />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
        
        <View className="flex mt-3">
          <TouchableOpacity
            className={`flex-row gap-2 justify-center items-center p-2 px-5 rounded-[15px] shadow-md ${isGraduating ? "bg-white" : "bg-[#8C2323]"}`}
            onPress={onStartEditing}
            activeOpacity={0.8}
          >
            <Text className={isGraduating ? "text-blue-600 font-medium" : "text-white font-medium"}>
              {isEditing ? "Cancel" : "Edit Profile"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text className={`text-2xl font-bold text-center mb-1 ${isGraduating ? "text-white" : ""}`} style={{ color: textColor }}>
        {userData?.first_name} {userData?.last_name}
      </Text>
    </View>
  );
};
