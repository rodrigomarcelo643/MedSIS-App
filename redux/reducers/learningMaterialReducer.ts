import { LearningMaterialState, ActionType } from "../types";

const initialState: LearningMaterialState = {
  materials: [],
  loading: false,
  error: null,
};

export const learningMaterialReducer = (state = initialState, action: ActionType): LearningMaterialState => {
  switch (action.type) {
    case 'SET_LEARNING_MATERIALS':
      return {
        ...state,
        materials: action.payload,
        loading: false,
      };
    case 'SET_LEARNING_MATERIALS_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_LEARNING_MATERIALS_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    default:
      return state;
  }
};
