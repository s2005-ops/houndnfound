export interface LostItem {
  id: string;
  description: string;
  location_found: string;
  collection_location: string;
  image_url?: string | null;
  status: string; // Changed from union type to string for better DB compatibility
  teacher_id?: string | null;
  collected_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Teacher {
  id: string;
  username: string;
  full_name: string;
  email?: string;
  access_level: 'super_admin' | 'admin' | 'user';
  created_at: string;
  updated_at: string;
}