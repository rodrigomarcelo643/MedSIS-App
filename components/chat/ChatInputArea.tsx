import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Plus, X, Send } from 'lucide-react-native';

interface ChatInputAreaProps {
  inputText: string;
  setInputText: (text: string) => void;
  editText: string;
  setEditText: (text: string) => void;
  editingMessage: string | null;
  showAttachments: boolean;
  setShowAttachments: (show: boolean) => void;
  onSendMessage: () => void;
  onEditMessage: () => void;
  onCancelEdit: () => void;
  backgroundColor: string;
  cardColor: string;
  mutedColor: string;
  textColor: string;
  hasThreeButtonNav: boolean;
  insetsBottom: number;
  isGestureNav: boolean;
  keyboardVisible: boolean;
}

export const ChatInputArea: React.FC<ChatInputAreaProps> = ({
  inputText,
  setInputText,
  editText,
  setEditText,
  editingMessage,
  showAttachments,
  setShowAttachments,
  onSendMessage,
  onEditMessage,
  onCancelEdit,
  backgroundColor,
  cardColor,
  mutedColor,
  textColor,
  hasThreeButtonNav,
  insetsBottom,
  isGestureNav,
  keyboardVisible,
}) => (
  <View
    className="flex-row items-end px-4 py-3 border-t"
    style={{ 
      backgroundColor, 
      borderTopColor: mutedColor + '30',
      paddingBottom: hasThreeButtonNav ? insetsBottom : isGestureNav ? 8 : 0,
      transform: [{ translateY: keyboardVisible ? -270 : 0 }]
    }}
  >
    <TouchableOpacity
      onPress={() => setShowAttachments(!showAttachments)}
      className="mr-2"
    >
      <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: '#af1616' }}>
        {showAttachments ? (
          <X size={20} color="#fff" />
        ) : (
          <Plus size={20} color="#fff" />
        )}
      </View>
    </TouchableOpacity>
    
    {editingMessage ? (
      <View className="flex-1 flex-row items-center rounded-full px-4 py-0 border" style={{ backgroundColor: cardColor, borderColor: mutedColor + '30' }}>
        <TextInput
          style={{ color: textColor, fontSize: 16, flex: 1, maxHeight: 100 }}
          placeholder="Edit message..."
          placeholderTextColor={mutedColor}
          value={editText}
          onChangeText={setEditText}
          multiline
        />
        <TouchableOpacity onPress={onEditMessage} className="ml-2">
          <Text style={{ color: '#3B82F6' }}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onCancelEdit} className="ml-2">
          <Text style={{ color: mutedColor }}>Cancel</Text>
        </TouchableOpacity>
      </View>
    ) : (
      <View className="flex-1 rounded-[20px] px-4 py-0 border" style={{ backgroundColor: cardColor, borderColor: mutedColor + '30' }}>
        <TextInput
          style={{ color: textColor, fontSize: 16, maxHeight: 100 }}
          placeholder="Type a message..."
          placeholderTextColor={mutedColor}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
      </View>
    )}
    
    {!editingMessage && (
      <TouchableOpacity
        onPress={onSendMessage}
        disabled={!inputText.trim()}
        className="ml-2 p-2 rounded-full"
        style={{ backgroundColor: '#af1616', opacity: inputText.trim() ? 1 : 0.5 }}
      >
        <Send size={20} color="#fff" />
      </TouchableOpacity>
    )}
  </View>
);
