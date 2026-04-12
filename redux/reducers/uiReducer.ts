import { UIState, ActionType } from "../types";

const initialState: UIState = {
  theme: 'system',
};

export const uiReducer = (state = initialState, action: ActionType): UIState => {
  switch (action.type) {
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      };
    default:
      return state;
  }
};
