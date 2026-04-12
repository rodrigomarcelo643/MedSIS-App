import { ActionType } from "../types";
import { CalendarEvent } from "@/@types/screens/calendar";

export const setCalendarEvents = (events: CalendarEvent[]): ActionType => ({
  type: 'SET_CALENDAR_EVENTS',
  payload: events,
});

export const setCalendarLoading = (loading: boolean): ActionType => ({
  type: 'SET_CALENDAR_LOADING',
  payload: loading,
});

export const setCalendarError = (error: string | null): ActionType => ({
  type: 'SET_CALENDAR_ERROR',
  payload: error,
});
