import { ImageAnalysisResult } from '@/services/imageAnalysisService';

/**
 * Check if image is blurry based on analysis result
 */
export const isImageBlurry = (result: ImageAnalysisResult): boolean => {
  return result.result?.is_blurry === true;
};

/**
 * Get blur score from analysis result
 */
export const getBlurScore = (result: ImageAnalysisResult): number => {
  return result.result?.blur_score || 0;
};

/**
 * Get quality score from analysis result
 */
export const getQualityScore = (result: ImageAnalysisResult): number => {
  return result.result?.quality_score || 0;
};

/**
 * Get all issues from analysis result
 */
export const getImageIssues = (result: ImageAnalysisResult): string[] => {
  return result.result?.issues || [];
};

/**
 * Check if image quality is acceptable (not blurry and meets threshold)
 */
export const isImageQualityAcceptable = (
  result: ImageAnalysisResult,
  minQualityScore: number = 70
): boolean => {
  if (isImageBlurry(result)) return false;
  return getQualityScore(result) >= minQualityScore;
};

/**
 * Format analysis result for display
 */
export const formatAnalysisResult = (result: ImageAnalysisResult): string => {
  if (!result.success) return result.message || 'Analysis failed';
  
  const issues = getImageIssues(result);
  if (issues.length > 0) {
    return `Issues found: ${issues.join(', ')}`;
  }
  
  if (isImageBlurry(result)) {
    return `Image is blurry (score: ${getBlurScore(result).toFixed(2)})`;
  }
  
  return `Quality: ${getQualityScore(result).toFixed(2)}%`;
};

/**
 * Get quality status color
 */
export const getQualityStatusColor = (result: ImageAnalysisResult): 'green' | 'yellow' | 'red' => {
  const score = getQualityScore(result);
  if (score >= 80) return 'green';
  if (score >= 60) return 'yellow';
  return 'red';
};
