import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: string;
          created_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string;
          frequency: string;
          due_hour: string;
          proof_type: string;
          assigned_by: string;
          assigned_to: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          frequency: string;
          due_hour: string;
          proof_type: string;
          assigned_by: string;
          assigned_to: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          frequency?: string;
          due_hour?: string;
          proof_type?: string;
          assigned_by?: string;
          assigned_to?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
} 