export interface UserSettings {
  theme: 'light' | 'dark';
  fontSize: number;  // 14-24
  extractMode: 'rule' | 'ai';
  showHighlight: boolean;
  highlightOnly: boolean;
  apiKey?: string;
}

export interface Article {
  id: string;
  url: string;
  title: string;
  content: string[];
  highlights: number[];
  readAt: number;
  readProgress: number;
}

export interface ExtractRequest {
  url: string;
  mode: 'rule' | 'ai';
  apiKey?: string;
}

export interface ExtractResponse {
  success: boolean;
  content?: string[];
  highlights?: number[];
  title?: string;
  error?: string;
}
