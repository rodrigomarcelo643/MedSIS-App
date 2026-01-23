export interface Notifications {
  id: number;
  type: string;
  title: string;
  message: string;
  time: string;
  read?: boolean;
  avatar?: string;
}