import React from 'react';
import { View, Image } from 'react-native';

export const AuthBackground = () => (
  <>
    {/* Grid Background */}
    <View className="absolute inset-0">
      <View className="flex-1 bg-white">
        {Array.from({ length: 20 }).map((_, i) => (
          <View
            key={`v-${i}`}
            className="absolute top-0 bottom-0 border-l border-gray-100"
            style={{ left: i * 40 }}
          />
        ))}
        {Array.from({ length: 40 }).map((_, i) => (
          <View
            key={`h-${i}`}
            className="absolute left-0 right-0 border-t border-gray-100"
            style={{ top: i * 40 }}
          />
        ))}
      </View>
    </View>

    {/* Watermark Logo */}
    <View className="absolute ml-4 inset-0">
      <Image
        source={require("../../assets/images/medicine_logo.png")}
        className="w-[98%] h-[98%] opacity-94"
        resizeMode="contain"
        accessibilityLabel="Medicine logo watermark"
      />
    </View>
  </>
);
