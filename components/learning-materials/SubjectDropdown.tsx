import React from 'react';
import { Modal, TouchableOpacity, View, Text } from 'react-native';
import { Check } from 'lucide-react-native';

interface SubjectDropdownProps {
  showSubjectDropdown: boolean;
  setShowSubjectDropdown: (show: boolean) => void;
  selectedSubject: string;
  setSelectedSubject: (subject: string) => void;
  availableSubjects: { value: string; label: string }[];
}

export const SubjectDropdown: React.FC<SubjectDropdownProps> = ({
  showSubjectDropdown,
  setShowSubjectDropdown,
  selectedSubject,
  setSelectedSubject,
  availableSubjects,
}) => {
  return (
    <Modal
      visible={showSubjectDropdown}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowSubjectDropdown(false)}
    >
      <TouchableOpacity 
        className="flex-1 bg-black/50"
        activeOpacity={1}
        onPress={() => setShowSubjectDropdown(false)}
      >
        <View className="absolute top-20 right-4 w-48 bg-white rounded-lg shadow-lg overflow-hidden">
          {availableSubjects.map((subject) => (
            <TouchableOpacity
              key={subject.value}
              className={`flex-row items-center px-4 py-3 ${
                selectedSubject === subject.value ? 'bg-[#af1616]-100' : 'bg-white'
              }`}
              onPress={() => {
                setSelectedSubject(subject.value);
                setShowSubjectDropdown(false);
              }}
            >
              {selectedSubject === subject.value ? (
                <Check size={16} color="#800000" />
              ) : (
                <View className="w-4 h-4" />
              )}
              <Text className={`ml-2 ${selectedSubject === subject.value ? 'text-[#af1616]-800 font-semibold' : 'text-gray-700'}`}>
                {subject.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
