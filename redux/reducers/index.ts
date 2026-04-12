import { RootState, ActionType } from "../types";
import { announcementReducer } from "./announcementReducer";
import { messageReducer } from "./messageReducer";
import { evaluationReducer } from "./evaluationReducer";
import { calendarReducer } from "./calendarReducer";
import { learningMaterialReducer } from "./learningMaterialReducer";
import { uiReducer } from "./uiReducer";

export const rootReducer = (state: RootState, action: ActionType): RootState => ({
  announcements: announcementReducer(state.announcements, action),
  messages: messageReducer(state.messages, action),
  evaluations: evaluationReducer(state.evaluations, action),
  calendar: calendarReducer(state.calendar, action),
  learningMaterials: learningMaterialReducer(state.learningMaterials, action),
  ui: uiReducer(state.ui, action),
});

export const initialRootState: RootState = {
  announcements: {
    items: [],
    loading: false,
    error: null,
    lastFetched: null,
  },
  messages: {
    conversations: [],
    activeUsers: [],
    loading: false,
    activeLoading: false,
    error: null,
  },
  evaluations: {
    data: null,
    permissions: null,
    gradeImages: [],
    loading: false,
    error: null,
  },
  calendar: {
    events: [],
    loading: false,
    error: null,
  },
  learningMaterials: {
    materials: [],
    loading: false,
    error: null,
  },
  ui: {
    theme: 'system',
  },
};
