import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, KeyboardTypeOptions } from 'react-native';
import { User, Mars, Venus, Globe, ChevronDown, ChevronUp } from 'lucide-react-native';
import { SectionProps, NationalityInputProps, EditData, InfoItemProps } from '@/@types/tabs';

// Reusable Section Component
export const Section: React.FC<SectionProps> = ({ title, icon: Icon, children, isExpanded, onToggle, cardColor, textColor }) => (
  <View style={{ backgroundColor: cardColor, borderRadius: 12, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 }}>
    <TouchableOpacity
      className="flex-row items-center justify-between mb-4"
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        <View className="w-10 h-10 bg-blue-100 rounded-lg items-center justify-center mr-3">
          <Icon size={20} color="#8C2323" />
        </View>
        <Text style={{ fontSize: 18, fontWeight: '600', color: textColor }}>{title}</Text>
      </View>
      {isExpanded ? (
        <ChevronUp size={20} color="#6b7280" />
      ) : (
        <ChevronDown size={20} color="#6b7280" />
      )}
    </TouchableOpacity>

    {isExpanded && children}
  </View>
);

// Info Item Component
export const InfoItem: React.FC<InfoItemProps> = ({ icon: Icon, label, value, theme, borderColor, mutedColor, textColor }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: borderColor }}>
    <View className="flex-row items-center flex-1">
      <View style={{ width: 32, height: 32, backgroundColor: '#f3f4f6', borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
        <Icon size={16} color="#8C2323" />
      </View>
      <View className="flex-1">
        <Text style={{ color: mutedColor, fontSize: 13, marginBottom: 4 }}>{label}</Text>
        <Text style={{ color: textColor, fontWeight: '500', fontSize: 13 }} numberOfLines={2}>
          {value || "Not provided"}
        </Text>
      </View>
    </View>
  </View>
);

// Editable Field Component
export const EditableField = ({ 
  icon: Icon, 
  label, 
  value, 
  field, 
  isEditing, 
  theme, 
  borderColor, 
  mutedColor, 
  textColor, 
  inputRef, 
  keyboardType = 'default', 
  autoCapitalize = 'none',
  onValueChange
}: {
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
  value?: string;
  field?: keyof EditData;
  isEditing: boolean;
  theme: string;
  borderColor: string;
  mutedColor: string;
  textColor: string;
  inputRef?: React.RefObject<TextInput | null>;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  onValueChange: (field: keyof EditData, text: string) => void;
}) => {
  const [localValue, setLocalValue] = useState(value || '');
  
  useEffect(() => {
    if (!isEditing) {
      setLocalValue(value || '');
    }
  }, [value, isEditing]);

  const handleChange = (text: string) => {
    setLocalValue(text);
    if (field) {
      onValueChange(field, text);
    }
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: borderColor }}>
      <View className="flex-row items-center flex-1">
        <View style={{ width: 32, height: 32, backgroundColor: '#f3f4f6', borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <Icon size={16} color="#8C2323" />
        </View>
        <View className="flex-1">
          <Text style={{ color: mutedColor, fontSize: 14, marginBottom: 4 }}>{label}</Text>
          {isEditing ? (
            <TextInput
              ref={inputRef}
              style={{ color: textColor, fontWeight: '500', fontSize: 16, backgroundColor: theme === 'dark' ? '#374151' : '#ffffff', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: borderColor }}
              value={localValue}
              onChangeText={handleChange}
              placeholder={`Enter ${label.toLowerCase()}`}
              placeholderTextColor={mutedColor}
              autoCapitalize={autoCapitalize}
              autoCorrect={false}
              keyboardType={keyboardType}
              returnKeyType={field === 'contact_number' ? 'done' : 'next'}
              blurOnSubmit={field === 'contact_number'}
            />
          ) : (
            <Text style={{ color: textColor, fontWeight: '500', fontSize: 16 }} numberOfLines={2}>
              {value || "Not provided"}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

// Gender Input Component
export const GenderInput = ({ value, label, isEditing, theme, borderColor, mutedColor, textColor, cardColor, onGenderChange }: {
  value?: string;
  label: string;
  isEditing: boolean;
  theme: string;
  borderColor: string;
  mutedColor: string;
  textColor: string;
  cardColor: string;
  onGenderChange: (gender: string) => void;
}) => {
  const [selectedGender, setSelectedGender] = useState(value || '');
  
  useEffect(() => {
    if (!isEditing) {
      setSelectedGender(value || '');
    }
  }, [value, isEditing]);

  const handleGenderChange = (gender: string) => {
    setSelectedGender(gender);
    onGenderChange(gender);
  };

  const getGenderIcon = (gender?: string) => {
    if (gender === "Male") return <Mars size={16} color="#3B82F6" />;
    if (gender === "Female") return <Venus size={16} color="#EC4899" />;
    return <User size={16} color="#8C2323" />;
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: borderColor }}>
      <View className="flex-row items-center flex-1">
        <View style={{ width: 32, height: 32, backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6', borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          {getGenderIcon(value)}
        </View>
        <View className="flex-1">
          <Text style={{ color: mutedColor, fontSize: 14, marginBottom: 4 }}>{label}</Text>
          {isEditing ? (
            <View style={{ backgroundColor: cardColor, borderRadius: 8, borderWidth: 1, borderColor: borderColor, overflow: 'hidden' }}>
              <TouchableOpacity
                className="flex-row justify-between items-center p-3"
                onPress={() => handleGenderChange("Male")}
              >
                <View className="flex-row items-center">
                  <Mars size={16} color="#3B82F6" className="mr-2" />
                  <Text style={{ color: textColor, marginLeft: 8 }}>Male</Text>
                </View>
                <View className="w-5 h-5 rounded-full border-2 border-gray-300 items-center justify-center">
                  {selectedGender === "Male" && (
                    <View className="w-3 h-3 rounded-full bg-[#8C2323]" />
                  )}
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-row justify-between items-center p-3 border-t border-gray-100"
                onPress={() => handleGenderChange("Female")}
              >
                <View className="flex-row items-center">
                  <Venus size={16} color="#EC4899" className="mr-2" />
                  <Text style={{ color: textColor, marginLeft: 8 }}>Female</Text>
                </View>
                <View className="w-5 h-5 rounded-full border-2 border-gray-300 items-center justify-center">
                  {selectedGender === "Female" && (
                    <View className="w-3 h-3 rounded-full bg-[#8C2323]" />
                  )}
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={{ color: textColor, fontWeight: '500', fontSize: 16 }}>
              {value || "Not provided"}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

// Nationality Input Component
export const NationalityInput: React.FC<NationalityInputProps> = ({ 
  value, 
  label, 
  isEditing, 
  theme, 
  borderColor, 
  mutedColor, 
  textColor, 
  cardColor, 
  nationalityType, 
  onNationalityTypeChange, 
  customNationalityRef,
  foreignerSpecify,
  onValueChange
}) => {
  const [localNationalityType, setLocalNationalityType] = useState(nationalityType);
  
  useEffect(() => {
    if (!isEditing) {
      setLocalNationalityType(nationalityType);
    }
  }, [nationalityType, isEditing]);

  const handleLocalNationalityTypeChange = (type: string) => {
    setLocalNationalityType(type || "Filipino");
    onNationalityTypeChange?.(type);
  };

  return (
    <View className="flex-row items-center justify-between py-3 border-b border-gray-100">
      <View className="flex-row items-center flex-1">
        <View className="w-8 h-8 bg-gray-100 rounded-lg items-center justify-center mr-3">
          {value === "Filipino" ? (
            <Text className="text-lg">🇵🇭</Text>
          ) : value === "Foreigner" ? (
            <Text className="text-lg">🌍</Text>
          ) : (
            <Globe size={16} color="#8C2323" />
          )}
        </View>
        <View className="flex-1">
          <Text style={{ color: mutedColor, fontSize: 14, marginBottom: 4 }}>{label}</Text>
          {isEditing ? (
            <View>
              <View style={{ backgroundColor: cardColor, borderRadius: 8, borderWidth: 1, borderColor: borderColor, overflow: 'hidden', marginBottom: 8 }}>
                <TouchableOpacity
                  className="flex-row justify-between items-center p-3"
                  onPress={() => handleLocalNationalityTypeChange("Filipino")}
                >
                  <View className="flex-row items-center">
                    <Text className="text-2xl mr-2">🇵🇭</Text>
                    <Text style={{ color: textColor }}>Filipino</Text>
                  </View>
                  <View className="w-5 h-5 rounded-full border-2 border-gray-300 items-center justify-center">
                    {localNationalityType === "Filipino" && (
                      <View className="w-3 h-3 rounded-full bg-[#8C2323]" />
                    )}
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-row justify-between items-center p-3 border-t border-gray-100"
                  onPress={() => handleLocalNationalityTypeChange("Foreigner")}
                >
                  <View className="flex-row items-center">
                    <Text className="text-2xl mr-2">🌍</Text>
                    <Text style={{ color: textColor }}>Foreigner</Text>
                  </View>
                  <View className="w-5 h-5 rounded-full border-2 border-gray-300 items-center justify-center">
                    {localNationalityType === "Foreigner" && (
                      <View className="w-3 h-3 rounded-full bg-[#8C2323]" />
                    )}
                  </View>
                </TouchableOpacity>
              </View>
              
              {localNationalityType === "Foreigner" && (
                <EditableField
                  icon={Globe}
                  label="Specify Nationality"
                  isEditing={isEditing || false}
                  theme={theme || 'light'}
                  borderColor={borderColor || '#e5e7eb'}
                  mutedColor={mutedColor || '#6b7280'}
                  textColor={textColor || '#000000'}
                  value={ foreignerSpecify || "" }
                  field="foreigner_specify"
                  inputRef={customNationalityRef}
                  autoCapitalize="words"
                  onValueChange={onValueChange || (() => {})}
                />
              )}
            </View>
          ) : (
            <Text
              style={{ color: textColor, fontWeight: '500', fontSize: 16 }}
              numberOfLines={2}
            >
              {value || "Not provided"}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};
