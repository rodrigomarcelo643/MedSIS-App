import React from 'react';
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Clock, Download } from 'lucide-react-native';
import { LearningMaterial } from '@/@types/screens/learning-materials';
import { formatFileSize, formatDate, fileTypeIcons } from './utils';

interface MaterialCardProps {
  material: LearningMaterial;
  downloading: number | null;
  handleDownload: (material: LearningMaterial) => void;
  cardColor: string;
  textColor: string;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({
  material,
  downloading,
  handleDownload,
  cardColor,
  textColor,
}) => {
  const IconComponent = fileTypeIcons[material.file_type as keyof typeof fileTypeIcons] || fileTypeIcons.default;
  
  return (
    <View 
      className="bg-white rounded-sm shadow-sm p-4 mb-4 border-l-4 border-[#af1616]"
      style={{ backgroundColor: cardColor }}
    >
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center">
          <View className="flex-row items-center bg-[#af1616]-100 rounded-full px-3 py-1">
            <Image source={require("../../assets/images/pdf.png")} className="w-5 h-5" />
            <Text className="ml-2 text-[#af1616]-800 text-sm font-medium" style={{ color:textColor }}>
              {material.subject}
            </Text>
          </View>
        </View>
        
        <View className="bg-gray-100 rounded-full px-3 py-1">
          <Text className="text-xs font-medium text-gray-600" >
            {formatFileSize(material.file_size)}
          </Text>
        </View>
      </View>
      
      <Text className="text-lg font-semibold text-gray-900 mb-2" style={{ color: textColor }}>{material.title}</Text>
      
      {material.description && (
        <Text className="text-gray-600 mb-3" style={{ color:textColor }} >{material.description}</Text>
      )}
      
      <View className="flex-row justify-between items-center mt-4">
        <View className="flex-row items-center">
          <Clock size={14} color="#6b7280" />
          <Text className="ml-1 text-gray-500 text-sm">{formatDate(material.created_at)}</Text>
        </View>
        
        <TouchableOpacity 
          className={`flex-row items-center px-3 rounded-lg ${
            downloading === material.id ? 'bg-[#af1616]' : 'bg-[#af1616]'
          }`}
          onPress={() => handleDownload(material)}
          disabled={downloading === material.id}
        >
          {downloading === material.id ? (
            <View className="p-1">
              <ActivityIndicator size="small" color="#ffffff"  />
            </View>
          ) : (
            <>
              <Download size={14} color="#ffffff" />
              <Text className="text-white px-2 py-2 text-sm font-medium">Download</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};
