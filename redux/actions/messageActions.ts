import { ActionType } from "../types";
import { User as MessageUser } from "@/@types/screens/messages";

export const setConversations = (conversations: MessageUser[]): ActionType => ({
  type: 'SET_CONVERSATIONS',
  payload: conversations,
});

export const setActiveUsers = (users: MessageUser[]): ActionType => ({
  type: 'SET_ACTIVE_USERS',
  payload: users,
});

export const setMessagesLoading = (loading: boolean): ActionType => ({
  type: 'SET_MESSAGES_LOADING',
  payload: loading,
});

export const setActiveLoading = (loading: boolean): ActionType => ({
  type: 'SET_ACTIVE_LOADING',
  payload: loading,
});

export const setMessagesError = (error: string | null): ActionType => ({
  type: 'SET_MESSAGES_ERROR',
  payload: error,
});
