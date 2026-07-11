export const NMAT_PASSING_RATE = 40;

export interface NmatScore {
  student_id: string;
  raw_score: number;
  percentile_rank: number;
  date_taken: string;
  exam_series: string;
}

export interface NmatValidationResult {
  score: NmatScore | null;
  isPassing: boolean;
  passingRate: number;
  status: 'passed' | 'failed' | 'pending';
}

export interface NmatValidationState {
  data: NmatValidationResult | null;
  loading: boolean;
  error: string | null;
}
