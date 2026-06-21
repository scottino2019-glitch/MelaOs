export interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  category: 'Lavoro' | 'Personale' | 'Idee' | 'Altro';
  isFavorite?: boolean;
}

export interface VideoItem {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  duration: string;
  category: string;
  description: string;
}

export interface SystemSettings {
  userName: string;
  wallpaper: string;
  darkMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  airplaneMode: boolean;
  wifiEnabled: boolean;
  bluetoothEnabled: boolean;
  flashlight: boolean;
  volume: number;
  brightness: number;
  batteryLevel: number;
  isCharging: boolean;
}

export interface AppConfig {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  badge?: number;
  isDockApp: boolean;
}

export interface AppState {
  openApps: string[]; // List of app ids that are currently active/in memory
  activeApp: string | null; // App id currently focused
  isLocked: boolean;
  isControlCenterOpen: boolean;
  notifications: AppNotification[];
}

export interface AppNotification {
  id: string;
  appId: string;
  appName: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
}
