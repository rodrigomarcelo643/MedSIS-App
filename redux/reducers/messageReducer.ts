import { MessageState, ActionType } from "../types";

const initialState: MessageState = {
  conversations: [],
  activeUsers: [],
  loading: false,
  activeLoading: false,
  error: null,
};

export const messageReducer = (state = initialState, action: ActionType): MessageState => {
  switch (action.type) {
    case 'SET_CONVERSATIONS':
      return {
        ...state,
        conversations: action.payload,
        loading: false,
      };
    case 'SET_ACTIVE_USERS':
      return {
        ...state,
        activeUsers: action.payload,
        activeLoading: false,
      };
    case 'SET_MESSAGES_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ACTIVE_LOADING':
      return {
        ...state,
        activeLoading: action.payload,
      };
    case 'SET_MESSAGES_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
        activeLoading: false,
      };
    default:
      return state;
  }
};
