import { EvaluationState, ActionType } from "../types";

const initialState: EvaluationState = {
  data: null,
  permissions: null,
  gradeImages: [],
  loading: false,
  error: null,
};

export const evaluationReducer = (state = initialState, action: ActionType): EvaluationState => {
  switch (action.type) {
    case 'SET_EVALUATION_DATA':
      return {
        ...state,
        data: action.payload,
        loading: false,
      };
    case 'SET_EVALUATION_PERMISSIONS':
      return {
        ...state,
        permissions: action.payload,
      };
    case 'SET_GRADE_IMAGES':
      return {
        ...state,
        gradeImages: action.payload,
      };
    case 'SET_EVALUATIONS_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_EVALUATIONS_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    default:
      return state;
  }
};
