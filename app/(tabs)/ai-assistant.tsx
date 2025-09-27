import { useAuth } from '@/contexts/AuthContext';
import {
  BookOpen,
  Brain,
  Calendar,
  ClipboardCheck,
  Send,
  Upload,
  X,
  Sparkles,
  Stethoscope,
  GraduationCap,
  Microscope
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  View
} from "react-native";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isTyping?: boolean;
  context?: any;
}

interface QuickLink {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  action: string;
  context: string;
}

export default function AIAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hi ${user?.first_name}! I'm your MedSIS AI Assistant. How can I help you with your medical studies, evaluations, calendar, learning materials, or requirements today?`,
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentContext, setCurrentContext] = useState('general');
  const [inputHeight, setInputHeight] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const inputScrollRef = useRef<ScrollView>(null);

  // Initialize services
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Quick links data with AI Mentor for medical students
  const quickLinks: QuickLink[] = [
    {
      id: '1',
      title: 'AI Mentor',
      description: 'Personalized medical study guidance',
      icon: Sparkles,
      color: '#7C3AED',
      action: 'mentor',
      context: 'mentor'
    },
    {
      id: '2',
      title: 'Clinical Rotations',
      description: 'Info about clinical placements',
      icon: Stethoscope,
      color: '#2563EB',
      action: 'rotations',
      context: 'rotations'
    },
    {
      id: '3',
      title: 'Study Resources',
      description: 'Medical textbooks & references',
      icon: BookOpen,
      color: '#059669',
      action: 'resources',
      context: 'resources'
    },
    {
      id: '4',
      title: 'Exam Preparation',
      description: 'Study plans & practice questions',
      icon: GraduationCap,
      color: '#DC2626',
      action: 'exams',
      context: 'exams'
    },
    {
      id: '5',
      title: 'Research Guidance',
      description: 'Thesis & research assistance',
      icon: Microscope,
      color: '#7C3AED',
      action: 'research',
      context: 'research'
    },
 
    {
      id: '6',
      title: 'School Calendar',
      description: 'Check important events and dates',
      icon: Calendar,
      color: '#D97706',
      action: 'calendar',
      context: 'calendar'
    },
    {
      id: '7',
      title: 'Requirements Upload',
      description: 'See required documents to upload',
      icon: Upload,
      color: '#F59E0B',
      action: 'requirements',
      context: 'requirements'
    }
  ];

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Scroll input when it reaches maximum height
  useEffect(() => {
    if (inputHeight > 100 && inputScrollRef.current) {
      inputScrollRef.current.scrollToEnd({ animated: true });
    }
  }, [inputHeight, inputText]);

  const stopGeneration = () => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setIsTyping(false);
    setIsLoading(false);
    
    // Update the last message to remove typing indicator
    setMessages(prev => {
      const lastMessage = prev[prev.length - 1];
      if (lastMessage && lastMessage.sender === 'bot' && lastMessage.isTyping) {
        return prev.map(msg => 
          msg.id === lastMessage.id 
            ? { ...msg, isTyping: false }
            : msg
        );
      }
      return prev;
    });
  };

  const simulateTyping = (fullText: string, messageId: string) => {
    let currentIndex = 0;
    const typingSpeed = .5; // Faster typing speed
    
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
    
    setIsTyping(true);
    
    return new Promise<void>((resolve) => {
      typingIntervalRef.current = setInterval(() => {
        if (currentIndex <= fullText.length) {
          setMessages(prev => prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, text: fullText.substring(0, currentIndex), isTyping: currentIndex < fullText.length }
              : msg
          ));
          currentIndex++;
        } else {
          if (typingIntervalRef.current) {
            clearInterval(typingIntervalRef.current);
            typingIntervalRef.current = null;
          }
          setMessages(prev => prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, isTyping: false }
              : msg
          ));
          setIsTyping(false);
          resolve();
        }
      }, typingSpeed);
    });
  };

  const getAIResponse = async (message: string, context: string = 'general') => {
    if (!user) {
      return {
        text: "I need to know who you are to help. Please log in again.",
        context: null
      };
    }

    try {
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      const response = await fetch('https://msis.eduisync.io/api/ai/ai_integration.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          query: message,
          context: context
        }),
        signal: signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Json Response
      const data = await response.json();
      
      if (data.success) {
        return {
          text: data.response,
          context: data.context || context
        };
      } else {
        return {
          text: data.message || "I'm having trouble connecting to the system right now. Please try again later.",
          context: null
        };
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request aborted');
        return {
          text: "",
          context: null
        };
      }
      console.error('Error calling AI API:', error);
      return {
        text: "I'm experiencing technical difficulties. Please check your connection and try again.",
        context: null
      };
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setInputHeight(0);
    setIsLoading(true);

    try {

      // send and get response
      const response = await getAIResponse(inputText, currentContext);
      
      if (!response.text) return;
      
      const botMessageId = (Date.now() + 1).toString();
      
      const botMessage: Message = {
        id: botMessageId,
        text: "",
        sender: 'bot',
        timestamp: new Date(),
        isTyping: true,
        context: response.context
      };
      
      setMessages(prev => [...prev, botMessage]);
      await simulateTyping(response.text, botMessageId);
    } catch (error) {
      console.error('Error getting AI response:', error);
      Alert.alert("Error", "Failed to get response from AI assistant");
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Link Response
  const handleQuickLink = async (action: string, context: string) => {
    if (isLoading) return;
    
    setCurrentContext(context);
    
    const messagesMap: Record<string, string> = {
      mentor: "I need guidance on my medical studies and career path. Can you provide personalized mentorship?",
      rotations: "Tell me about clinical rotations scheduling and requirements.",
      resources: "What medical textbooks and study resources do you recommend?",
      exams: "Help me create a study plan for my upcoming medical exams.",
      research: "I need assistance with my medical research project or thesis.",
      evaluation: "Show me my evaluation status and what requirements I need to complete.",
      calendar: "What events are on my calendar?",
      requirements: "What requirements do I need to complete?"
    };

    const messageText = messagesMap[action] || "I need help with this area.";
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await getAIResponse(messageText, context);
      
      if (!response.text) return;
      
      const botMessageId = (Date.now() + 1).toString();
      
      const botMessage: Message = {
        id: botMessageId,
        text: "",
        sender: 'bot',
        timestamp: new Date(),
        isTyping: true,
        context: response.context
      };
      
      setMessages(prev => [...prev, botMessage]);
      await simulateTyping(response.text, botMessageId);
    } catch (error) {
      console.error('Error getting AI response:', error);
      Alert.alert("Error", "Failed to get response from AI assistant");
    } finally {
      setIsLoading(false);
    }
  };

  const getUserInitials = () => {
    if (!user) return "U";
    return `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`.toUpperCase() || "U";
  };

  const handleInputContentSizeChange = (event: any) => {
    const height = event.nativeEvent.contentSize.height;
    // Limit height to 120 pixels max
    setInputHeight(Math.min(height, 120));
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View className={`flex-row mb-5 ${item.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
      <View className={`flex-row max-w-[85%] ${item.sender === 'user' ? 'flex-row-reverse' : ''}`}>
        <View className={`w-10 h-10 rounded-full items-center justify-center mx-2 ${
          item.sender === 'user' ? 'bg-[#8C2323]' : 'bg-[#2563EB]'
        }`}>
          {item.sender === 'user' ? (
            <Text className="text-white font-bold text-xs">{getUserInitials()}</Text>
          ) : (
            <Text className="text-white font-bold text-xs">AI</Text>
          )}
        </View>
        <View className={`rounded-2xl px-4 py-3 ${
          item.sender === 'user' 
            ? 'bg-[#8C2323] rounded-tr-sm' 
            : 'bg-gray-100 rounded-tl-sm'
        }`}>
          <Text className={`text-base ${
            item.sender === 'user' ? 'text-white' : 'text-gray-800'
          }`}>
            {item.text}
          </Text>
          <Text className={`text-xs mt-1 ${
            item.sender === 'user' ? 'text-[#FFB3B3]' : 'text-gray-500'
          }`}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderQuickLinks = () => (
    <View className="mb-6">
      <Text className="text-lg font-semibold text-gray-800 mb-4 px-4">
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
              onPress={() => handleQuickLink(link.action, link.context)}
              disabled={isLoading}
            >
              <View className="w-12 h-12 rounded-xl items-center justify-center mb-3" style={{ backgroundColor: link.color }}>
                <IconComponent size={22} color="#fff" />
              </View>
              <Text className="font-semibold text-gray-900 text-sm mb-1">
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

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 py-4 border-b border-gray-200">
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-full items-center justify-center mr-3">
            <Image
                source={require("../../assets/images/chatbot.png")}
                className="w-10 h-10"
            />
          </View>
          <View>
            <Text className="text-xl font-bold text-gray-900">
              <Text className="text-[#af1616] font-extrabold">Med</Text>
              <Text className="text-[#16a34a] font-extrabold">SIS</Text>
              {' '}AI
            </Text>
            <Text className="text-sm text-gray-500">Medical Student Support</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          className="flex-1 px-4 pt-4"
          ListHeaderComponent={renderQuickLinks()}
          ListFooterComponent={isLoading ? (
            <View className="flex-row justify-start mb-4">
              <View className="flex-row max-w-[85%]">
                <View className="w-10 h-10 rounded-full bg-[#2563EB] items-center justify-center mx-2">
                  <Text className="text-white font-bold text-xs">AI</Text>
                </View>
                <View className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex-row items-center">
                  <ActivityIndicator size="small" color="#2563EB" className="mr-2" />
                  <Text className="text-gray-500 text-sm">Thinking...</Text>
                  {isTyping && (
                    <TouchableOpacity 
                      onPress={stopGeneration}
                      className="ml-3 bg-gray-200 rounded-full p-1"
                    >
                      <X size={14} color="#666" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ) : null}
        />

        {/* Input Area */}
        <View className="bg-white border-t border-gray-200 px-4 py-3">
          <View className="bg-gray-100 rounded-[15px] overflow-hidden">
            <ScrollView 
              ref={inputScrollRef}
              nestedScrollEnabled={true}
              style={{ maxHeight: 120 }}
            >
              <TextInput
                className="text-gray-800 text-base px-4 py-2"
                placeholder="Ask MedSIS AI..."
                placeholderTextColor="#9CA3AF"
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
                editable={!isLoading}
                onContentSizeChange={handleInputContentSizeChange}
                style={{ 
                  height: Math.max(40, inputHeight),
                  minHeight: 40
                }}
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
                    !inputText.trim() ? 'bg-gray-300' : 'bg-[#8C2323]'
                  }`}
                >
                  <Send size={20} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <Text className="text-xs text-gray-500 text-center mt-2">
           
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}