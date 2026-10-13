export type AppCategory =
  | 'All'
  | 'Games'
  | 'Productivity'
  | 'Tools'
  | 'Social'
  | 'Entertainment'
  | 'Finance'
  | 'Photography'
  | 'Health & Fitness';

export interface VirusTotalReport {
  status: 'clean' | 'verified';
  detections: number; // e.g. 0
  totalVendors: number; // e.g. 72
  scanDate: string;
  sha256: string;
  badges: string[]; // ['No Adware', 'No Spyware', 'Clean Signature', 'Google Play Protect Compatible']
}

export interface AppReview {
  id: string;
  appId?: string;
  userName: string;
  userAvatar: string;
  rating: number; // 1 to 5
  date: string;
  comment: string;
  device?: string; // e.g. Samsung Galaxy S24, Pixel 8
  helpfulCount?: number;
}

export interface AppDemandRequest {
  id: string;
  userName: string;
  email: string;
  contactMethod: 'Email' | 'WhatsApp' | 'Telegram';
  contactHandle: string;
  appTitle: string;
  platform: 'Android' | 'iOS' | 'Cross-Platform' | 'Web App';
  category: AppCategory;
  requirements: string;
  budget?: string;
  timeline?: string;
  status: 'Pending' | 'In Review' | 'Approved' | 'In Development' | 'Completed' | 'Rejected';
  submittedAt: string;
  adminNotes?: string;
}

export interface AppModel {
  id: string;
  app_name: string;
  package_name: string; // SlugField, unique
  developer_name: string;
  category: AppCategory;
  app_icon: string;
  banner_image?: string;
  description: string;
  version: string;
  apk_file: string;
  file_size: string;
  downloads_count: number;
  rating: number;
  reviews_count?: number;
  created_at: string;
  updated_at: string;
  whats_new?: string;
  screenshots?: string[];
  featured?: boolean;
  is_published?: boolean;
  min_android_version?: string;
  content_rating?: string;
  safety?: VirusTotalReport;
  reviews?: AppReview[];
}

export interface DjangoFile {
  name: string;
  path: string;
  language: 'python' | 'html' | 'txt' | 'markdown';
  description: string;
  content: string;
}
