// Message API service with dummy data
export interface User {
  id: string;
  name: string;
  avatar_url?: string;
  isOnline: boolean;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  timestamp: Date;
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
  isRead: boolean;
}

// Dummy data storage
let dummyUsers: User[] = [
  {
    id: '1',
    name: 'Dr. Maria Santos',
    isOnline: true,
    lastMessage: 'Your lab results are ready',
    lastMessageTime: '2m ago',
    unreadCount: 2,
  },
  {
    id: '2',
    name: 'John Dela Cruz',
    avatar_url: 'https://via.placeholder.com/40',
    isOnline: false,
    lastMessage: 'Thanks for the notes!',
    lastMessageTime: '1h ago',
    unreadCount: 0,
  },
  {
    id: '3',
    name: 'Sarah Johnson',
    avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    isOnline: true,
    lastMessage: 'Can we study together?',
    lastMessageTime: '3h ago',
    unreadCount: 1,
  },
  {
    id: '4',
    name: 'Prof. Rodriguez',
    isOnline: false,
    lastMessage: 'Assignment due tomorrow',
    lastMessageTime: '1d ago',
    unreadCount: 0,
  },
  {
    id: '5',
    name: 'Dr. Kim Lee',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    isOnline: true,
    lastMessage: 'Schedule changed',
    lastMessageTime: '2d ago',
    unreadCount: 0,
  },
  {
    id: '6',
    name: 'Anna Martinez',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    isOnline: true,
    lastMessage: 'Group study tonight?',
    lastMessageTime: '3d ago',
    unreadCount: 3,
  },
  {
    id: '7',
    name: 'Mike Chen',
    isOnline: false,
    lastMessage: 'Thanks for helping',
    lastMessageTime: '4d ago',
    unreadCount: 0,
  },
  {
    id: '8',
    name: 'Dr. Brown',
    isOnline: true,
    lastMessage: 'Office hours updated',
    lastMessageTime: '5d ago',
    unreadCount: 1,
  },
  {
    id: '9',
    name: 'Lisa Wang',
    isOnline: true,
    lastMessage: 'Lab report due',
    lastMessageTime: '6d ago',
    unreadCount: 0,
  },
  {
    id: '10',
    name: 'Prof. Davis',
    isOnline: false,
    lastMessage: 'Exam postponed',
    lastMessageTime: '1w ago',
    unreadCount: 0,
  },
  {
    id: '11',
    name: 'Tom Wilson',
    isOnline: true,
    lastMessage: 'Study materials shared',
    lastMessageTime: '1w ago',
    unreadCount: 2,
  },
  {
    id: '12',
    name: 'Dr. Garcia',
    isOnline: false,
    lastMessage: 'Consultation available',
    lastMessageTime: '2w ago',
    unreadCount: 0,
  },
];

let activeUsers: User[] = dummyUsers.filter(user => user.isOnline);

let dummyMessages: { [chatId: string]: Message[] } = {
  '1': [
    {
      id: '1',
      text: 'Hi! Your lab results are ready for review.',
      senderId: '1',
      receiverId: 'current',
      timestamp: new Date(Date.now() - 3600000),
      type: 'text',
      isRead: false,
    },
    {
      id: '2',
      text: 'Thank you! When can I pick them up?',
      senderId: 'current',
      receiverId: '1',
      timestamp: new Date(Date.now() - 3000000),
      type: 'text',
      isRead: true,
    },
  ],
  '2': [
    {
      id: '3',
      text: 'Hey, can you share your anatomy notes?',
      senderId: 'current',
      receiverId: '2',
      timestamp: new Date(Date.now() - 7200000),
      type: 'text',
      isRead: true,
    },
    {
      id: '4',
      text: 'Sure! Here they are.',
      senderId: '2',
      receiverId: 'current',
      timestamp: new Date(Date.now() - 3600000),
      type: 'text',
      isRead: true,
    },
  ],
};

export const messageService = {
  // Get active users
  getActiveUsers: async (page: number = 1, limit: number = 10): Promise<{ users: User[], hasMore: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const users = activeUsers.slice(startIndex, endIndex);
    const hasMore = endIndex < activeUsers.length;
    return { users, hasMore };
  },

  // Get all conversations for current user with pagination
  getConversations: async (page: number = 1, limit: number = 10): Promise<{ users: User[], hasMore: boolean }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const users = dummyUsers.slice(startIndex, endIndex);
    const hasMore = endIndex < dummyUsers.length;
    return { users, hasMore };
  },

  // Get messages for a specific chat
  getChatMessages: async (chatId: string): Promise<Message[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return dummyMessages[chatId] || [];
  },

  // Send a new message
  sendMessage: async (message: Omit<Message, 'id' | 'timestamp' | 'isRead'>): Promise<Message> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date(),
      isRead: false,
    };

    // Add to dummy storage
    const chatId = message.receiverId;
    if (!dummyMessages[chatId]) {
      dummyMessages[chatId] = [];
    }
    dummyMessages[chatId].push(newMessage);

    // Update user's last message
    const userIndex = dummyUsers.findIndex(u => u.id === chatId);
    if (userIndex !== -1) {
      dummyUsers[userIndex].lastMessage = message.text;
      dummyUsers[userIndex].lastMessageTime = 'now';
    }

    return newMessage;
  },

  // Get unread message count
  getUnreadCount: async (): Promise<number> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return dummyUsers.reduce((total, user) => total + user.unreadCount, 0);
  },

  // Search users
  searchUsers: async (query: string): Promise<User[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    if (!query.trim()) return [];
    
    return dummyUsers.filter(user => 
      user.name.toLowerCase().includes(query.toLowerCase())
    );
  },

  // Mark messages as read
  markAsRead: async (chatId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    if (dummyMessages[chatId]) {
      dummyMessages[chatId].forEach(msg => {
        if (msg.receiverId === 'current') {
          msg.isRead = true;
        }
      });
    }

    // Update unread count
    const userIndex = dummyUsers.findIndex(u => u.id === chatId);
    if (userIndex !== -1) {
      dummyUsers[userIndex].unreadCount = 0;
    }
  },
};