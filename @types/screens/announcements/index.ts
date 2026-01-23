export interface Announcement {
  id: number;
  title: string;
  description: string;
  category: 'general' | 'research' | 'clinical' | 'pharmacology' | 'cardiology' | 'event' | 'urgent';
  priority: 'low' | 'medium' | 'high';
  year_level: 'all' | '1' | '2' | '3' | '4';
  author: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}