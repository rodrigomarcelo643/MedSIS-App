export interface LearningMaterial {
  id: number;
  title: string;
  description: string | null;
  file_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
  subject: string;
  year_level: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}