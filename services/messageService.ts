// Message API service with real backend integration
import { Platform } from 'react-native';
import { API_BASE_URL } from '@/constants/Config';

export interface User {
  id: string;
  name: string;
  avatar_url?: string;
  isOnline: boolean;
  lastMessage?: string;
  lastMessageTime?: string;
  lastMessageTimestamp?: string;
  messageStatus?: string;
  unreadCount: number;
  user_type?: string;
  unique_key?: string;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  timestamp: Date;
  type: "text" | "image" | "file";
  fileUrl?: string;
  fileName?: string;
  isSeen: boolean;
  isCurrentUser?: boolean;
  isEdited?: boolean;
}


const API_BASE = `${API_BASE_URL}/api/messages`;

export const messageService = {
  // Get active users
  getActiveUsers: async (
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ users: User[]; hasMore: boolean }> => {
    try {
      const url = `${API_BASE}/get_users.php?current_user_id=${userId}`;
      console.log('🚀 Frontend: Calling getActiveUsers API:', url);
      
      const response = await fetch(url);
      console.log('📡 Frontend: Response status:', response.status, response.statusText);
      
      const text = await response.text();
      console.log('📄 Frontend: Raw response text:', text.substring(0, 500) + (text.length > 500 ? '...' : ''));
      
      const data = JSON.parse(text);
      console.log('📊 Frontend: Parsed response data:', {
        hasError: !!data.error,
        error: data.error,
        userCount: data.users?.length || 0,
        totalCount: data.count,
        debug: data.debug
      });
      
      // Log online status details and ensure proper boolean conversion
      if (data.users) {
        data.users = data.users.map((user: any) => ({
          ...user,
          isOnline: Boolean(user.isOnline)
        }));
        
        const onlineUsers = data.users.filter((u: any) => u.isOnline === true);
        const offlineUsers = data.users.filter((u: any) => u.isOnline === false);
        console.log('🟢 Online users found:', onlineUsers.length);
        console.log('🔴 Offline users found:', offlineUsers.length);
        onlineUsers.forEach((u: any) => {
          console.log(`   ${u.name} (${u.user_type}) - Online: ${u.isOnline} (type: ${typeof u.isOnline})`);
        });
      }
      
      if (data.error) throw new Error(data.error);
      const users = data.users || [];
      
      // Log avatar information
      const usersWithAvatars = users.filter((u: User) => u.avatar_url);
      const usersWithoutAvatars = users.filter((u: User) => !u.avatar_url);
      
      console.log('🖼️ Frontend: Avatar analysis:', {
        totalUsers: users.length,
        withAvatars: usersWithAvatars.length,
        withoutAvatars: usersWithoutAvatars.length
      });
      
      users.forEach((user: User, index: number) => {
        console.log(`👤 Frontend: User #${index + 1}:`, {
          id: user.id,
          name: user.name,
          userType: user.user_type,
          uniqueKey: user.unique_key,
          hasAvatar: !!user.avatar_url,
          avatarLength: user.avatar_url?.length || 0,
          avatarPrefix: user.avatar_url?.substring(0, 50) || 'none'
        });
      });
      
      return { users, hasMore: false };
    } catch (error) {
      console.error('❌ Frontend Error in getActiveUsers:', error);
      return { users: [], hasMore: false };
    }
  },
  
 /**
 *  // Get all conversations for current user with pagination
 */
  getConversations: async (
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ users: User[]; hasMore: boolean }> => {
    try {
      const response = await fetch(
        `${API_BASE}/get_conversations.php?current_user_id=${userId}`
      );
      const text = await response.text();
      const data = JSON.parse(text);
      
      if (data.error) throw new Error(data.error);
      let users = data.users || [];
      
      // Ensure proper boolean conversion for isOnline
      users = users.map((user: any) => ({
        ...user,
        isOnline: Boolean(user.isOnline)
      }));
      
      return { users, hasMore: false };
    } catch (error) {
      console.error('❌ Error in getConversations:', error);
      return { users: [], hasMore: false };
    }
  },

  // Get messages for a specific chat
  getChatMessages: async (userId: string, chatId: string): Promise<Message[]> => {
    const response = await fetch(
      `${API_BASE}/get_messages.php?current_user_id=${userId}&other_user_id=${chatId}`
    );
    const data = await response.json();
    return data.messages.map((msg: Message) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));
  },

  // Send a new message
  sendMessage: async (
    message: Omit<Message, "id" | "timestamp" | "isRead"> & { fileData?: string }
  ): Promise<Message> => {
    const response = await fetch(`${API_BASE}/send_message.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender_id: message.senderId,
        receiver_id: message.receiverId,
        message: message.text,
        type: message.type,
        fileUrl: message.fileUrl,
        fileData: message.fileData,
        fileName: message.fileName,
      }),
    });
    const data = await response.json();
    if (!data.success || !data.message) {
      throw new Error(data.error || 'Failed to send message');
    }
    return {
      ...data.message,
      timestamp: new Date(data.message.timestamp),
    };
  },

  // Get unread message count
  getUnreadCount: async (userId: string): Promise<number> => {
    try {
      const response = await fetch(
        `${API_BASE}/get_conversations.php?current_user_id=${userId}`
      );
      const data = await response.json();
      if (data.error) return 0;
      return data.users.reduce(
        (total: number, user: User) => total + user.unreadCount,
        0
      );
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  },

  // Search users
  searchUsers: async (userId: string, query: string): Promise<User[]> => {
    if (!query.trim()) return [];
    const response = await fetch(
      `${API_BASE}/get_users.php?current_user_id=${userId}`
    );
    const data = await response.json();
    return data.users.filter((user: User) =>
      user.name.toLowerCase().includes(query.toLowerCase())
    );
  },

  // Mark messages as read
  markAsRead: async (userId: string, chatId: string): Promise<void> => {
    await fetch(`${API_BASE}/mark_read.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        current_user_id: userId,
        other_user_id: chatId
      })
    });
  },

  // Messages are automatically marked as seen when getChatMessages is called
};
