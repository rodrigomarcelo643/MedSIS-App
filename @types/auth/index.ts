export interface User {
  id: string;
  student_id: string;
  middle_name: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  program?: string;
  gender?: string;
  nationality?: string;
  foreigner_specify?: string;
  year_level_id?: string;
  year_level_name?: string;
  account_status?: string;
  enrollment_status: string;
  evaluation_status: string;
  academic_year: string;
  avatar?: string;
  avatar_url?: string;
  avatar_data?: string; 
  contact_number?: string;
  joinDate?: string;
  policy_accepted?: number;
  password?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  clearUser: () => void;
  updateUserPolicyStatus: (accepted: boolean) => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<boolean | undefined>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}