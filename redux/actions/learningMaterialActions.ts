import { ActionType } from "../types";
import { LearningMaterial } from "@/@types/screens/learning-materials";

export const setLearningMaterials = (materials: LearningMaterial[]): ActionType => ({
  type: 'SET_LEARNING_MATERIALS',
  payload: materials,
});

export const setLearningMaterialsLoading = (loading: boolean): ActionType => ({
  type: 'SET_LEARNING_MATERIALS_LOADING',
  payload: loading,
});

export const setLearningMaterialsError = (error: string | null): ActionType => ({
  type: 'SET_LEARNING_MATERIALS_ERROR',
  payload: error,
});
