import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Moon, Sun, Shield, LogOut } from 'lucide-react-native';
import { Link } from 'expo-router';

interface ProfileAccountActionsProps {
  theme: string;
  textColor: string;
  cardColor: string;
  onToggleTheme: () => void;
  onShowLogoutModal: () => void;
}

export const ProfileAccountActions: React.FC<ProfileAccountActionsProps> = ({
  theme,
  textColor,
  cardColor,
  onToggleTheme,
  onShowLogoutModal,
}) => {
  return (
    <View style={{ backgroundColor: cardColor, borderRadius: 12, padding: 20, marginBottom: 64, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}>
      <Text style={{ fontSize: 18, fontWeight: '600', color: textColor, marginBottom: 16 }}>
        Account Actions
      </Text>

      <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
        <View className="flex-row items-center">
          <View
            className={`w-8 h-8 rounded-lg items-center justify-center mr-3 ${
              theme === 'dark' ? 'bg-blue-100' : 'bg-yellow-100'
            }`}
          >
            {theme === 'dark' ? (
              <Moon size={16} color="#3B82F6" />
            ) : (
              <Sun size={16} color="#F59E0B" />
            )}
          </View>

          <Text style={{ color: textColor, fontWeight: '500' }}>
            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          </Text>
        </View>

        <TouchableOpacity
          className={`w-12 h-6 rounded-full p-1 ${
            theme === 'dark' ? 'bg-red-500' : 'bg-gray-300'
          }`}
          onPress={onToggleTheme}
          activeOpacity={0.8}
        >
          <View
            className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
              theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </TouchableOpacity>
      </View>
      <Link href="/screens/change-password" asChild>
        <TouchableOpacity className="flex-row items-center justify-between py-3 border-b border-gray-100" activeOpacity={0.7}>
          <View className="flex-row items-center">
            <View className="w-8 h-8 bg-green-100 rounded-lg items-center justify-center mr-3">
              <Shield size={16} color="#10B981" />
            </View>
            <Text className="text-gray-800 font-medium " style={{ color: textColor }}>Change Password</Text>
          </View>
        </TouchableOpacity>
      </Link>

      <TouchableOpacity
        className="flex-row items-center justify-between py-3"
        onPress={onShowLogoutModal}
        activeOpacity={0.7}
      >
        <View className="flex-row items-center">
          <View className="w-8 h-8 bg-red-100 rounded-lg items-center justify-center mr-3">
            <LogOut size={16} color="#dc2626" />
          </View>
          <Text className="text-red-600 font-medium">Log Out</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};
