import { UserSettings } from './types.js';

export const COLORS = {
  primary: '#10B981',  // Emerald green
  light: {
    background: '#FFFFFF',
    text: '#1F2937',
    border: '#E5E7EB',
    highlight: '#10B98120'
  },
  dark: {
    background: '#1F2937',
    text: '#F9FAFB',
    border: '#374151',
    highlight: '#10B98130'
  }
};

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'light',
  fontSize: 16,
  extractMode: 'rule',
  showHighlight: true,
  highlightOnly: false
};

export const STORAGE_KEY = 'adhd-reader-settings';
export const DB_NAME = 'ADHDReaderDB';
export const DB_VERSION = 1;
export const STORE_NAME = 'articles';
