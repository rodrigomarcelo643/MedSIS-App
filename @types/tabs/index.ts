// AI Assistant types
export interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  isTyping?: boolean;
  context?: any;
}

export interface QuickLink {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  action: string;
  context: string;
}

// Evaluations types
export interface Evaluation {
  curriculum_course_id: number;
  student_grade_id: number | null;
  student_id: string | null;
  grade: string | null;
  remarks: string | null;
  evaluator_name: string | null;
  evaluator_signature: string | null;
  evaluator_signature_data: string | null;
  date_evaluated: string | null;
  code: string;
  title: string;
  year_level: string;
  term: string;
  units: number;
}

export interface EvaluationSummary {
  total_courses: number;
  passed_courses: number;
  failed_courses: number;
  in_progress_courses: number;
  pending_courses: number;
  completion_percentage: number;
}

export interface EvaluationResponse {
  student: {
    id: string;
    student_id: string;
    first_name: string;
    last_name: string;
    academic_year: string;
    program: string;
    evaluation_status: string;
  };
  has_matching_curriculum: boolean;
  curriculum_academic_year: string;
  evaluations: Evaluation[];
  summary: EvaluationSummary;
  error?: string;
}

// Folder types
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  uri: string;
  type: 'image' | 'pdf' | 'word' | 'document';
  mimeType: string;
  uploaded_at?: string;
  status?: string;
  feedback?: string;
}

export interface Requirement {
  id: string;
  name: string;
  completed: boolean;
  file_count: number;
  uploadedFiles: UploadedFile[];
}

export interface FileInfo {
  name: string;
  size: number;
  uri: string;
  type: 'image' | 'pdf' | 'word' | 'document';
  mimeType: string;
}

export type FilterType = 'all' | 'completed' | 'not-completed';

// Home types
export interface SkeletonLoaderProps {
  width: number | string;
  height: number | string;
  borderRadius?: number;
  style?: any;
  children?: React.ReactNode;
}

export interface QuickLinkCardProps {
  title: string;
  description: string;
  onPress: () => void;
  color: string;
  bgImage: any;
}

export interface WelcomeHeaderProps {
  user: any;
  onProfilePress: () => void;
}

export interface HomeQuickLink {
  id: number;
  title: string;
  description: string;
  color: string;
  count: number;
  bgImage: any;
  onPress: () => void;
  icon: React.ReactNode;
}

// Profile types
export interface UserData {
  id: string;
  user_id?: string;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  gender?: string;
  nationality?: string;
  foreigner_specify?: string;
  contact_number?: string;
  program?: string;
  year_level_id?: number;
  year_level_name?: string;
  academic_year?: string;
  avatar?: string;
  avatar_url?: string;
  avatar_data?: string;
}

export interface ProfileUser {
  user_id: number;
}

export interface EditData {
  first_name: string;
  last_name: string;
  gender: string;
  nationality: string;
  foreigner_specify: string;
  contact_number: string;
}

export interface ExpandedSections {
  personal: boolean;
  academic: boolean;
  contact: boolean;
}

export interface UpdateModal {
  visible: boolean;
  success: boolean;
  message: string;
}

export interface InfoItemProps {
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
  value?: string;
  editable?: boolean;
  field?: keyof EditData;
  inputRef?: React.RefObject<any>;
  keyboardType?: any;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
}

export interface NationalityInputProps {
  value?: string;
  label: string;
}

export interface SectionProps {
  title: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}