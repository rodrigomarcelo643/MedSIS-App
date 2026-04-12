import { AnnouncementState, ActionType } from "../types";

const initialState: AnnouncementState = {
  items: [],
  loading: false,
  error: null,
  lastFetched: null,
};

export const announcementReducer = (state = initialState, action: ActionType): AnnouncementState => {
  switch (action.type) {
    case 'SET_ANNOUNCEMENTS':
      return {
        ...state,
        items: action.payload,
        lastFetched: Date.now(),
        loading: false,
      };
    case 'SET_ANNOUNCEMENTS_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ANNOUNCEMENTS_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    default:
      return state;
  }
};
