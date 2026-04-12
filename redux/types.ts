import { Announcement } from "@/@types/screens/announcements";
import { User as MessageUser } from "@/@types/screens/messages";
import { EvaluationResponse, GradeUploadPermission, GradeImage } from "@/@types/tabs";
import { CalendarEvent } from "@/@types/screens/calendar";

export interface RootState {
  announcements: AnnouncementState;
  messages: MessageState;
  evaluations: EvaluationState;
  calendar: CalendarState;
  learningMaterials: LearningMaterialState;
  ui: UIState;
}

export interface AnnouncementState {
  items: Announcement[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

export interface MessageState {
  conversations: MessageUser[];
  activeUsers: MessageUser[];
  loading: boolean;
  activeLoading: boolean;
  error: string | null;
}

export interface EvaluationState {
  data: EvaluationResponse | null;
  permissions: GradeUploadPermission | null;
  gradeImages: GradeImage[];
  loading: boolean;
  error: string | null;
}

export interface CalendarState {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
}

export interface LearningMaterialState {
  materials: any[]; // Using any for brevity now, but should use proper types if available
  loading: boolean;
  error: string | null;
}

export interface UIState {
  theme: 'light' | 'dark' | 'system';
}

export type ActionType =
  | { type: 'SET_ANNOUNCEMENTS'; payload: Announcement[] }
  | { type: 'SET_ANNOUNCEMENTS_LOADING'; payload: boolean }
  | { type: 'SET_ANNOUNCEMENTS_ERROR'; payload: string | null }
  | { type: 'SET_CONVERSATIONS'; payload: MessageUser[] }
  | { type: 'SET_ACTIVE_USERS'; payload: MessageUser[] }
  | { type: 'SET_MESSAGES_LOADING'; payload: boolean }
  | { type: 'SET_ACTIVE_LOADING'; payload: boolean }
  | { type: 'SET_MESSAGES_ERROR'; payload: string | null }
  | { type: 'SET_EVALUATION_DATA'; payload: EvaluationResponse }
  | { type: 'SET_EVALUATION_PERMISSIONS'; payload: GradeUploadPermission }
  | { type: 'SET_GRADE_IMAGES'; payload: GradeImage[] }
  | { type: 'SET_EVALUATIONS_LOADING'; payload: boolean }
  | { type: 'SET_EVALUATIONS_ERROR'; payload: string | null }
  | { type: 'SET_CALENDAR_EVENTS'; payload: CalendarEvent[] }
  | { type: 'SET_CALENDAR_LOADING'; payload: boolean }
  | { type: 'SET_CALENDAR_ERROR'; payload: string | null }
  | { type: 'SET_LEARNING_MATERIALS'; payload: any[] }
  | { type: 'SET_LEARNING_MATERIALS_LOADING'; payload: boolean }
  | { type: 'SET_LEARNING_MATERIALS_ERROR'; payload: string | null }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'system' };
