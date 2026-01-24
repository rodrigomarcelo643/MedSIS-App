// Message service types
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

// Service response types
export interface GetUsersResponse {
  users: User[];
  hasMore: boolean;
}

export interface SendMessageRequest extends Omit<Message, "id" | "timestamp" | "isRead"> {
  fileData?: string;
  recipientOnline?: boolean;
}