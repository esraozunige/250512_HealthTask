import { supabase } from '../../lib/supabase';
import { streakService } from './streakService';

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string;
  due_date: string;
  completed: boolean;
  completed_at?: string;
}

export const goalService = {
  async completeGoal(goalId: string): Promise<void> {
    try {
      const { data: goal, error: goalError } = await supabase
        .from('goals')
        .select('user_id')
        .eq('id', goalId)
        .single();

      if (goalError) throw goalError;

      // Update goal completion
      const { error: updateError } = await supabase
        .from('goals')
        .update({
          completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('id', goalId);

      if (updateError) throw updateError;

      // Update streak on successful completion
      await streakService.updateStreak(goal.user_id, true);
    } catch (error) {
      console.error('Error completing goal:', error);
      throw error;
    }
  },

  async missGoal(goalId: string): Promise<void> {
    try {
      const { data: goal, error: goalError } = await supabase
        .from('goals')
        .select('user_id')
        .eq('id', goalId)
        .single();

      if (goalError) throw goalError;

      // Update goal as missed
      const { error: updateError } = await supabase
        .from('goals')
        .update({
          completed: false,
          completed_at: null
        })
        .eq('id', goalId);

      if (updateError) throw updateError;

      // Update streak on missed goal
      await streakService.updateStreak(goal.user_id, false);

      // Reveal a random secret when a goal is missed
      const { revealRandomSecret } = require('../lib/secrets');
      await revealRandomSecret(goal.user_id);
    } catch (error) {
      console.error('Error marking goal as missed:', error);
      throw error;
    }
  },

  async getGoals(userId: string): Promise<Goal[]> {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting goals:', error);
      throw error;
    }
  },

  async createGoal(userId: string, title: string, description: string, dueDate: string): Promise<Goal> {
    try {
      const { data, error } = await supabase
        .from('goals')
        .insert({
          user_id: userId,
          title,
          description,
          due_date: dueDate,
          completed: false
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  }
}; 