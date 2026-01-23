export interface MediaItem {
  id: string;
  type: 'image' | 'file' | 'link';
  url: string;
  name?: string;
  timestamp: Date;
  fileName?: string;
}

export interface LinkItem {
  id: string;
  url: string;
  text: string;
  timestamp: Date;
}