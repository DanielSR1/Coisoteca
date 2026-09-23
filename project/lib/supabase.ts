import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});

export type Category = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  created_at: string;
};

export type Entry = {
  id: string;
  category_id: string;
  title: string;
  rating: number;
  comment: string | null;
  photo_url: string | null;
  photo_orientation: 'horizontal' | 'vertical';
  created_at: string;
  updated_at: string;
};

export type CategoryWithCount = Category & {
  entry_count: number;
  avg_rating: number | null;
};
