import { ActionType } from "../types";
import { Announcement } from "@/@types/screens/announcements";

export const setAnnouncements = (announcements: Announcement[]): ActionType => ({
  type: 'SET_ANNOUNCEMENTS',
  payload: announcements,
});

export const setAnnouncementsLoading = (loading: boolean): ActionType => ({
  type: 'SET_ANNOUNCEMENTS_LOADING',
  payload: loading,
});

export const setAnnouncementsError = (error: string | null): ActionType => ({
  type: 'SET_ANNOUNCEMENTS_ERROR',
  payload: error,
});
