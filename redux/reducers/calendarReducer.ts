import { CalendarState, ActionType } from "../types";

const initialState: CalendarState = {
  events: [],
  loading: false,
  error: null,
};

export const calendarReducer = (state = initialState, action: ActionType): CalendarState => {
  switch (action.type) {
    case 'SET_CALENDAR_EVENTS':
      return {
        ...state,
        events: action.payload,
        loading: false,
      };
    case 'SET_CALENDAR_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_CALENDAR_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    default:
      return state;
  }
};
