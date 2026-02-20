import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Message } from '@/@types/screens/messages';

const STORAGE_KEYS = {
  CONVERSATIONS: 'cached_conversations',
  MESSAGES: 'cached_messages_',
  ACTIVE_USERS: 'cached_active_users',
};

export const messageStorage = {
  // Cache conversations
  saveConversations: async (userId: string, conversations: User[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(
        `${STORAGE_KEYS.CONVERSATIONS}_${userId}`,
        JSON.stringify(conversations)
      );
    } catch (error) {
      console.error('Error saving conversations:', error);
    }
  },

  // Get cached conversations
  getConversations: async (userId: string): Promise<User[] | null> => {
    try {
      const data = await AsyncStorage.getItem(`${STORAGE_KEYS.CONVERSATIONS}_${userId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting conversations:', error);
      return null;
    }
  },

  // Cache messages for a specific chat
  saveMessages: async (userId: string, chatId: string, messages: Message[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(
        `${STORAGE_KEYS.MESSAGES}${userId}_${chatId}`,
        JSON.stringify(messages)
      );
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  },

  // Get cached messages
  getMessages: async (userId: string, chatId: string): Promise<Message[] | null> => {
    try {
      const data = await AsyncStorage.getItem(`${STORAGE_KEYS.MESSAGES}${userId}_${chatId}`);
      if (!data) return null;
      const messages = JSON.parse(data);
      return messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    } catch (error) {
      console.error('Error getting messages:', error);
      return null;
    }
  },

  // Cache active users
  saveActiveUsers: async (userId: string, users: User[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(
        `${STORAGE_KEYS.ACTIVE_USERS}_${userId}`,
        JSON.stringify(users)
      );
    } catch (error) {
      console.error('Error saving active users:', error);
    }
  },

  // Get cached active users
  getActiveUsers: async (userId: string): Promise<User[] | null> => {
    try {
      const data = await AsyncStorage.getItem(`${STORAGE_KEYS.ACTIVE_USERS}_${userId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting active users:', error);
      return null;
    }
  },

  // Clear all cached data for a user
  clearUserCache: async (userId: string): Promise<void> => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const userKeys = keys.filter(key => key.includes(userId));
      await AsyncStorage.multiRemove(userKeys);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  },
};
