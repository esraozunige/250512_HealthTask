import { supabase } from '../../lib/supabase';

// Add a secret (for patient/player onboarding)
export const addSecret = async (content: string) => {
  const user = await supabase.auth.user();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase.from('secrets').insert({
    user_id: user.id,
    content,
    revealed: false,
  });
  if (error) throw error;
  return data;
};

// Get all secrets for the current user
export const getMySecrets = async () => {
  const user = await supabase.auth.user();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('secrets')
    .select('*')
    .eq('user_id', user.id);
  if (error) throw error;
  return data;
};

// Reveal a random secret for a user (when a goal is missed)
export const revealRandomSecret = async (userId: string) => {
  // Get unrevealed secrets
  const { data: secrets, error } = await supabase
    .from('secrets')
    .select('*')
    .eq('user_id', userId)
    .eq('revealed', false);
  if (error) throw error;
  if (!secrets || secrets.length === 0) throw new Error('No secrets to reveal');
  // Pick a random secret
  const randomIndex = Math.floor(Math.random() * secrets.length);
  const secretToReveal = secrets[randomIndex];
  // Mark as revealed
  const { error: updateError } = await supabase
    .from('secrets')
    .update({ revealed: true, revealed_at: new Date().toISOString() })
    .eq('id', secretToReveal.id);
  if (updateError) throw updateError;
  return secretToReveal;
};

// Get all revealed secrets for a group (for group members except doctors)
export const getRevealedSecretsForGroup = async (groupId: string) => {
  const user = await supabase.auth.user();
  if (!user) throw new Error('Not authenticated');
  // Check if user is a group member and not a doctor
  const { data: member, error: memberError } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .single();
  if (memberError) throw memberError;
  if (!member || member.role === 'doctor') throw new Error('Not authorized');
  // Get all revealed secrets for group members (except doctors)
  // First, get all user_ids in the group who are not doctors
  const { data: groupMembers, error: groupError } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', groupId)
    .neq('role', 'doctor');
  if (groupError) throw groupError;
  const userIds = groupMembers.map((m: any) => m.user_id);
  if (!userIds.length) return [];
  // Get revealed secrets for those users
  const { data, error } = await supabase
    .from('secrets')
    .select('id, user_id, content, revealed, revealed_at')
    .eq('revealed', true)
    .in('user_id', userIds);
  if (error) throw error;
  return data;
}; 