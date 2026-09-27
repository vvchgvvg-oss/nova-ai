export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
}

export type AIModelType = 'deepseek' | 'gemini' | 'llama' | 'gemini-free';

export interface YoutubeTrack {
  status?: string;
  title?: string;
  video_id?: string;
  duration?: string;
  thumbnail?: string;
  download_url?: string;
  developer?: string;
  audio?: string;    // Sometimes directly here
  cover?: string;    // Image cover
  url?: string;      // Direct link
}

export interface MovieResponse {
  status: string;
  movie_name: string;
  qualities: string[];
  download?: string;
  developer?: {
    name: string;
    contact: string;
  };
}

export interface InstagramResponse {
  title?: string;
  download_url?: string;
  url?: string;
  media?: string | string[];
  videos?: string[];
  images?: string[];
  status?: string;
}

export interface Surah {
  id: number;
  name: string;
  englishName: string;
  englishNameTranslation?: string;
  revelationType?: string;
  numberOfAyahs: number;
}

export interface Reciter {
  id: number;
  name: string;
  letter?: string;
}

export interface QuranAudioResponse {
  status: string;
  surah: {
    id: number;
    name: string;
    englishName: string;
  };
  reciter: {
    id: number;
    name: string;
  };
  audio_url: string;
}

export interface QuranStats {
  surahs_count: number;
  reciters_count: number;
  total_verses?: number;
  size?: string;
}

export interface TelegramBot {
  name: string;
  username: string;
  description: string;
  category: 'vps' | 'crash' | 'scam' | 'ai' | 'tool';
}

export interface DeveloperWebsite {
  title: string;
  url: string;
  description: string;
}

export interface UserSession {
  username: string;
  role: 'admin' | 'guest';
  displayName: string;
}

