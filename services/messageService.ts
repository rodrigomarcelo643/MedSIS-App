// Message API service with real backend integration
import { Platform } from 'react-native';
import { API_BASE_URL } from '@/constants/Config';
import { User, Message, GetUsersResponse, SendMessageRequest } from '@/@types/screens/messages';
import axios from 'axios';

const API_BASE = `${API_BASE_URL}/api/messages`;

export const messageService = {
  // Get active users
  getActiveUsers: async (
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<GetUsersResponse> => {
    try {
      const url = `${API_BASE}/get_users.php?current_user_id=${userId}`;
      //console.log('🚀 Frontend: Calling getActiveUsers API:', url);
      
      const response = await axios.get(
        `${API_BASE}/get_users.php?current_user_id=${userId}`,
        {
          timeout: 10000,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      
      const data = response.data;
      /*console.log('📊 Frontend: Parsed response data:', {
        hasError: !!data.error,
        error: data.error,
        userCount: data.users?.length || 0,
        totalCount: data.count,
        debug: data.debug
      });
      */
      // Log online status details and ensure proper boolean conversion
      if (data.users) {
        data.users = data.users.map((user: any) => ({
          ...user,
          isOnline: Boolean(user.isOnline)
        }));
        
        const onlineUsers = data.users.filter((u: any) => u.isOnline === true);
        const offlineUsers = data.users.filter((u: any) => u.isOnline === false);
       // console.log('🟢 Online users found:', onlineUsers.length);
       //console.log('🔴 Offline users found:', offlineUsers.length);
        onlineUsers.forEach((u: any) => {
          console.log(`   ${u.name} (${u.user_type}) - Online: ${u.isOnline} (type: ${typeof u.isOnline})`);
        });
      }
      
      if (data.error) throw new Error(data.error);
      const users = data.users || [];
      
      // Log avatar information
      const usersWithAvatars = users.filter((u: User) => u.avatar_url);
      const usersWithoutAvatars = users.filter((u: User) => !u.avatar_url);
      
      /*console.log('🖼️ Frontend: Avatar analysis:', {
        totalUsers: users.length,
        withAvatars: usersWithAvatars.length,
        withoutAvatars: usersWithoutAvatars.length
      });
      */
      
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
  ): Promise<GetUsersResponse> => {
    try {
      const response = await axios.get(
        `${API_BASE}/get_conversations.php?current_user_id=${userId}`,
        {
          timeout: 10000,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      const data = response.data;
      
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
    const response = await axios.get(
      `${API_BASE}/get_messages.php?current_user_id=${userId}&other_user_id=${chatId}`,
      {
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    const data = response.data;
    return data.messages.map((msg: Message) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }));
  },

  // Send a new message
  sendMessage: async (
    message: SendMessageRequest
  ): Promise<Message> => {
    const response = await axios.post(
      `${API_BASE}/send_message.php`,
      {
        sender_id: message.senderId,
        receiver_id: message.receiverId,
        message: message.text,
        type: message.type,
        fileUrl: message.fileUrl,
        fileData: message.fileData,
        fileName: message.fileName,
        recipient_online: message.recipientOnline,
      },
      {
        timeout: 15000,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = response.data;
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
      const response = await axios.get(
        `${API_BASE}/get_conversations.php?current_user_id=${userId}`,
        {
          timeout: 10000,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      const data = response.data;
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
    const response = await axios.get(
      `${API_BASE}/get_users.php?current_user_id=${userId}`,
      {
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    const data = response.data;
    return data.users.filter((user: User) =>
      user.name.toLowerCase().includes(query.toLowerCase())
    );
  },

  // Mark messages as read
  markAsRead: async (userId: string, chatId: string): Promise<void> => {
    await axios.post(
      `${API_BASE}/mark_read.php`,
      {
        current_user_id: userId,
        other_user_id: chatId
      },
      {
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  },

  // Update message statuses when user comes online
  updateMessageStatuses: async (userId: string): Promise<void> => {
    try {
      await axios.post(
        `${API_BASE}/update_message_status.php`,
        {
          user_id: userId
        },
        {
          timeout: 10000,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error: any) {
      // Silently handle 404 errors for missing endpoint
      if (error?.response?.status === 404) {
        console.log('Message status update endpoint not available');
        return;
      }
      console.error('Error updating message statuses:', error);
    }
  },

  // Messages are automatically marked as seen when getChatMessages is called
};
