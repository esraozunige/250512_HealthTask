import { supabase } from '../../lib/supabase';

interface CreateGroupParams {
  doctorId: string;
  patientId?: string;
}

/**
 * Creates a new group with the specified doctor
 * @param params Group creation parameters including doctor ID and optional patient ID
 * @returns Promise<{id: string}> The created group ID
 * @throws Error if validation fails or database operation fails
 */
export const createGroup = async (params: CreateGroupParams): Promise<{id: string}> => {
  const { doctorId, patientId } = params;

  // Validate required parameters
  if (!doctorId) {
    throw new Error('Doctor ID is required');
  }

  // Insert group record
  const { data, error } = await supabase
    .from('groups')
    .insert([
      {
        doctor_id: doctorId,
        patient_id: patientId,
      },
    ])
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to create group: ${error.message}`);
  }

  if (!data) {
    throw new Error('Failed to create group: No data returned');
  }

  return {
    id: data.id,
  };
};

/**
 * Adds a member to an existing group
 * @param groupId The ID of the group to add the member to
 * @param userId The ID of the user to add
 * @param role The role of the user in the group ('doctor', 'patient', or 'player')
 * @returns Promise<void>
 * @throws Error if validation fails or database operation fails
 */
export const addGroupMember = async (
  groupId: string,
  userId: string,
  role: 'doctor' | 'patient' | 'player'
): Promise<void> => {
  // Validate required parameters
  if (!groupId || !userId || !role) {
    throw new Error('Group ID, user ID, and role are required');
  }

  // Insert group member record
  const { error } = await supabase
    .from('group_members')
    .insert([
      {
        group_id: groupId,
        user_id: userId,
        role,
      },
    ]);

  if (error) {
    throw new Error(`Failed to add group member: ${error.message}`);
  }
};

/**
 * Gets all groups for a user
 * @param userId The ID of the user to get groups for
 * @returns Promise<Array<{id: string, name: string, role: string}>> Array of groups the user is a member of
 * @throws Error if database operation fails
 */
export const getUserGroups = async (
  userId: string
): Promise<Array<{id: string, name: string, role: string}>> => {
  const { data, error } = await supabase
    .from('group_members')
    .select(`
      group_id,
      role,
      groups (
        id,
        doctor_id,
        patient_id
      )
    `)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to get user groups: ${error.message}`);
  }

  return data.map(member => ({
    id: member.groups.id,
    name: `Group ${member.groups.id.slice(0, 8)}`,
    role: member.role,
  }));
}; 