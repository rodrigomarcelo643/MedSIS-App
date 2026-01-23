export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  event: string; 
  end: Date;
  color: string;
  description: string;
  course: string;
  location: string;
  year_level: string;
}

export interface ApiEvent {
  id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  color?: string;
  description?: string;
  year_level?: string;
}

export type ViewMode = "month" | "week" | "day";
export type NavigationDirection = "prev" | "next";

export interface WeekRange {
  start: Date;
  end: Date;
  dates: Date[];
}