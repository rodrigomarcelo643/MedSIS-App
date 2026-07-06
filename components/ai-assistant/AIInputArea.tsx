import { Send, X } from "lucide-react-native";
import React from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface AIInputAreaProps {
  inputText: string;
  setInputText: (text: string) => void;
  isLoading: boolean;
  inputHeight: number;
  handleInputContentSizeChange: (event: any) => void;
  handleSend: () => void;
  stopGeneration: () => void;
  inputScrollRef: any;
  backgroundColor: string;
  textColor: string;
  mutedColor: string;
  loadColor: string;
  borderColor: string;
}

export const AIInputArea: React.FC<AIInputAreaProps> = ({
  inputText,
  setInputText,
  isLoading,
  inputHeight,
  handleInputContentSizeChange,
  handleSend,
  stopGeneration,
  inputScrollRef,
  backgroundColor,
  textColor,
  mutedColor,
  loadColor,
  borderColor,
}) => (
  <View
    style={{
      backgroundColor,
      borderTopWidth: 1,
      borderTopColor: borderColor,
      paddingHorizontal: 16,
      paddingVertical: 12,
    }}
  >
    <View
      className="bg-gray-100 rounded-[15px] overflow-hidden"
      style={{ backgroundColor: loadColor }}
    >
      <ScrollView
        ref={inputScrollRef}
        nestedScrollEnabled={true}
        style={{ maxHeight: 120 }}
      >
        <TextInput
          style={{
            color: textColor,
            fontSize: 16,
            paddingHorizontal: 16,
            paddingVertical: 8,
            height: Math.max(40, inputHeight),
            minHeight: 40,
          }}
          placeholder="Ask MedSIS AI..."
          placeholderTextColor={mutedColor}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
          editable={!isLoading}
          onContentSizeChange={handleInputContentSizeChange}
        />
      </ScrollView>
      <View className="flex-row justify-end items-center px-2 py-1">
        <Text className="text-xs text-gray-500 mr-2">
          {inputText.length}/500
        </Text>
        {isLoading ? (
          <TouchableOpacity
            onPress={stopGeneration}
            className="p-2 rounded-full bg-gray-500"
          >
            <X size={20} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleSend}
            disabled={!inputText.trim()}
            className={`p-2 rounded-full ${
              !inputText.trim() ? "bg-gray-300" : "bg-[#8C2323]"
            }`}
          >
            <Send size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    </View>
    <Text className="text-xs text-gray-500 text-center mt-2"></Text>
  </View>
);
