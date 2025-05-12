import { supabase } from '../../lib/supabase';

export interface UserStreak {
  current_streak: number;
  longest_streak: number;
  status: 'Active' | 'NeedsHelp';
  last_streak_reset: string | null;
}

export class UserStreakService {
  async getUserStreak(userId: string): Promise<UserStreak | null> {
    const { data, error } = await supabase
      .from('users')
      .select('current_streak, longest_streak, status, last_streak_reset')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user streak:', error);
      return null;
    }

    return data;
  }

  async updateUserStreak(userId: string, updates: Partial<UserStreak>): Promise<UserStreak | null> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select('current_streak, longest_streak, status, last_streak_reset')
      .single();

    if (error) {
      console.error('Error updating user streak:', error);
      return null;
    }

    return data;
  }

  async getNeedsHelpUsers(): Promise<string[]> {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('status', 'NeedsHelp');

    if (error) {
      console.error('Error fetching needs help users:', error);
      return [];
    }

    return data.map(user => user.id);
  }

  async checkAndUpdateNeedsHelpStatus(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .rpc('check_needs_help_status', { user_id: userId });

    if (error) {
      console.error('Error checking needs help status:', error);
      return false;
    }

    return data;
  }
} 