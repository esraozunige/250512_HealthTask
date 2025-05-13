import { supabase } from '../../lib/supabase';

interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'doctor' | 'patient' | 'player';
  joined_at: string;
}

/**
 * Gets all members of a group
 * @param groupId The ID of the group to get members for
 * @returns Promise<Array<GroupMember>> Array of group members
 * @throws Error if database operation fails
 */
export const getGroupMembers = async (groupId: string): Promise<Array<GroupMember>> => {
  const { data, error } = await supabase
    .from('group_members')
    .select('*')
    .eq('group_id', groupId)
    .order('joined_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to get group members: ${error.message}`);
  }

  return data || [];
};

/**
 * Checks if a user is a member of a group
 * @param groupId The ID of the group to check
 * @param userId The ID of the user to check
 * @returns Promise<boolean> True if user is a member, false otherwise
 * @throws Error if database operation fails
 */
export const isGroupMember = async (groupId: string, userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    throw new Error(`Failed to check group membership: ${error.message}`);
  }

  return !!data;
};

/**
 * Gets the role of a user in a group
 * @param groupId The ID of the group to check
 * @param userId The ID of the user to check
 * @returns Promise<string | null> The user's role in the group, or null if not a member
 * @throws Error if database operation fails
 */
export const getUserGroupRole = async (groupId: string, userId: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { // PGRST116 is "no rows returned"
      return null;
    }
    throw new Error(`Failed to get user group role: ${error.message}`);
  }

  return data?.role || null;
};

/**
 * Removes a member from a group
 * @param groupId The ID of the group to remove the member from
 * @param userId The ID of the user to remove
 * @returns Promise<void>
 * @throws Error if database operation fails
 */
export const removeGroupMember = async (groupId: string, userId: string): Promise<void> => {
  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to remove group member: ${error.message}`);
  }
}; 