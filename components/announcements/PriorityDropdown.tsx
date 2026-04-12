import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Check } from 'lucide-react-native';

interface PriorityOption {
  value: string;
  label: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  options: PriorityOption[];
  selectedPriority: string;
  onSelect: (value: string) => void;
}

export const PriorityDropdown: React.FC<Props> = ({ visible, onClose, options, selectedPriority, onSelect }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        className="flex-1 bg-black/50"
        activeOpacity={1}
        onPress={onClose}
      >
        <View className="absolute top-20 right-4 w-48 bg-white rounded-lg shadow-lg overflow-hidden">
          {options.map((priority) => (
            <TouchableOpacity
              key={priority.value}
              className={`flex-row items-center px-4 py-3 ${
                selectedPriority === priority.value ? 'bg-maroon-100' : 'bg-white'
              }`}
              onPress={() => {
                onSelect(priority.value);
                onClose();
              }}
            >
              {selectedPriority === priority.value ? (
                <Check size={16} color="#800000" />
              ) : (
                <View className="w-4 h-4" />
              )}
              <Text className={`ml-2 ${selectedPriority === priority.value ? ' font-semibold' : 'text-gray-700'}`}>
                {priority.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};
