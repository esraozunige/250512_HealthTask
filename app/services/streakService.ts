import { supabase } from '../../lib/supabase';

export interface StreakUpdate {
  current_streak: number;
  longest_streak: number;
  status: 'Active' | 'NeedsHelp';
  last_streak_loss?: string;
}

export const streakService = {
  async updateStreak(userId: string, success: boolean): Promise<StreakUpdate> {
    try {
      // Get current user data
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('current_streak, longest_streak, status, last_streak_loss')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      let update: StreakUpdate = {
        current_streak: user.current_streak || 0,
        longest_streak: user.longest_streak || 0,
        status: user.status || 'Active',
        last_streak_loss: user.last_streak_loss
      };

      if (success) {
        // Increment streak on success
        update.current_streak += 1;
        if (update.current_streak > update.longest_streak) {
          update.longest_streak = update.current_streak;
        }
      } else {
        // Handle streak loss
        const now = new Date().toISOString();
        update.current_streak = 0;
        update.last_streak_loss = now;

        // Check if user has lost 2+ streaks in 14 days
        if (user.last_streak_loss) {
          const lastLoss = new Date(user.last_streak_loss);
          const daysSinceLastLoss = (new Date().getTime() - lastLoss.getTime()) / (1000 * 60 * 60 * 24);
          
          if (daysSinceLastLoss <= 14) {
            update.status = 'NeedsHelp';
          }
        }
      }

      // Update user record
      const { error: updateError } = await supabase
        .from('users')
        .update(update)
        .eq('id', userId);

      if (updateError) throw updateError;

      return update;
    } catch (error) {
      console.error('Error updating streak:', error);
      throw error;
    }
  },

  async getStreakStatus(userId: string): Promise<StreakUpdate> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('current_streak, longest_streak, status, last_streak_loss')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return {
        current_streak: data.current_streak || 0,
        longest_streak: data.longest_streak || 0,
        status: data.status || 'Active',
        last_streak_loss: data.last_streak_loss
      };
    } catch (error) {
      console.error('Error getting streak status:', error);
      throw error;
    }
  },

  async resetStreakStatus(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          current_streak: 0,
          status: 'Active',
          last_streak_loss: null
        })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error resetting streak status:', error);
      throw error;
    }
  }
}; 