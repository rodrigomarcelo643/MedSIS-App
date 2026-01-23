export interface AcademicCalendar {
  id: number;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string;
  file_path: string | null;
  year_level: string | null;
  created_at: string;
  updated_at: string;
  documents?: AcademicCalendarDocument[];
}

export interface AcademicCalendarDocument {
  id: number;
  academic_calendar_id: number;
  file_name: string;
  file_path: string;
  mime_type: string;
  file_size: number;
  created_at: string;
  updated_at: string;
}

export interface SchoolCalendarResponse {
  success: boolean;
  student: {
    id: string;
    student_id: string;
    first_name: string;
    last_name: string;
    academic_year: string;
    program: string;
    year_level: string;
  };
  academic_calendars: AcademicCalendar[];
  error?: string;
}