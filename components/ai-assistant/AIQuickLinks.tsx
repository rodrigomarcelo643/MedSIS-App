import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { QuickLink } from '@/@types/tabs';

interface AIQuickLinksProps {
  quickLinks: QuickLink[];
  textColor: string;
  cardColor: string;
  isLoading: boolean;
  onPressLink: (action: string, context: string) => void;
}

export const AIQuickLinks: React.FC<AIQuickLinksProps> = ({ 
  quickLinks, 
  textColor, 
  cardColor, 
  isLoading, 
  onPressLink 
}) => (
  <View className="mb-6">
    <Text style={{ fontSize: 18, fontWeight: '600', color: textColor, marginBottom: 16, paddingHorizontal: 16 }}>
      Quick Access for Medical Students
    </Text>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="px-4"
    >
      {quickLinks.map((link) => {
        const IconComponent = link.icon;
        return (
          <TouchableOpacity
            key={link.id}
            className="bg-white rounded-2xl p-4 mr-3 shadow border border-gray-100 w-44"
            onPress={() => onPressLink(link.action, link.context)}
            style={{ backgroundColor: cardColor }}
            disabled={isLoading}
          >
            <View
              className="w-12 h-12 rounded-xl items-center justify-center mb-3"
              style={{ backgroundColor: link.color }}
            >
              <IconComponent size={22} color="#fff" />
            </View>
            <Text className="font-semibold text-gray-900 text-sm mb-1" style={{ color: textColor }}>
              {link.title}
            </Text>
            <Text className="text-xs text-gray-500 leading-snug">
              {link.description}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  </View>
);
