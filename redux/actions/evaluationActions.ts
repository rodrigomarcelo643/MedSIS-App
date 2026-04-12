import { ActionType } from "../types";
import { EvaluationResponse, GradeUploadPermission, GradeImage } from "@/@types/tabs";

export const setEvaluationData = (data: EvaluationResponse): ActionType => ({
  type: 'SET_EVALUATION_DATA',
  payload: data,
});

export const setEvaluationPermissions = (permissions: GradeUploadPermission): ActionType => ({
  type: 'SET_EVALUATION_PERMISSIONS',
  payload: permissions,
});

export const setGradeImages = (images: GradeImage[]): ActionType => ({
  type: 'SET_GRADE_IMAGES',
  payload: images,
});

export const setEvaluationsLoading = (loading: boolean): ActionType => ({
  type: 'SET_EVALUATIONS_LOADING',
  payload: loading,
});

export const setEvaluationsError = (error: string | null): ActionType => ({
  type: 'SET_EVALUATIONS_ERROR',
  payload: error,
});
