import { supabase } from '../../lib/supabase';

type InvitationRole = 'patient' | 'player';

interface CreateInvitationParams {
  inviterId: string;
  inviteeEmail?: string; // Now optional
  role: InvitationRole;
  groupId?: string; // Required for player invitations
}

/**
 * Generates a unique invitation code with role prefix
 * @param role The role of the invitee ('patient' or 'player')
 * @returns A unique 8-character alphanumeric code
 */
const generateInvitationCode = (role: InvitationRole): string => {
  const prefix = role === 'patient' ? 'D' : 'P';
  // Generate a random 6-character alphanumeric string
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomStr = '';
  for (let i = 0; i < 6; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}${randomStr}`;
};

/**
 * Checks if an invitation code is already in use
 * @param code The invitation code to check
 * @returns Promise<boolean> True if code exists, false otherwise
 */
const isCodeExists = async (code: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('invitations')
    .select('id')
    .eq('code', code)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    throw new Error('Failed to check invitation code');
  }
  
  return !!data;
};

/**
 * Creates a new invitation record in the database
 * @param params Invitation parameters including inviter ID, invitee email, role, and optional group ID
 * @returns Promise<{code: string, id: string}> The generated invitation code and record ID
 * @throws Error if validation fails or database operation fails
 */
export const createInvitation = async (params: CreateInvitationParams): Promise<{code: string, id: string}> => {
  const { inviterId, inviteeEmail, role, groupId } = params;

  // Validate required parameters
  if (!inviterId || !role) {
    throw new Error('Missing required parameters');
  }

  // Only require email for player invitations
  if (role === 'player') {
    if (!inviteeEmail) {
      throw new Error('Player invitation requires an email');
    }
    // Validate email format for player
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(inviteeEmail)) {
    throw new Error('Invalid email format');
    }
  }

  // Validate group ID for player invitations
  if (role === 'player' && !groupId) {
    throw new Error('Group ID is required for player invitations');
  }

  // Generate unique code with retries
  let code = '';
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 5;

  while (!isUnique && attempts < maxAttempts) {
    code = generateInvitationCode(role);
    isUnique = !(await isCodeExists(code));
    attempts++;
  }

  if (!isUnique) {
    throw new Error('Failed to generate unique invitation code');
  }

  // Insert invitation record
  const { data, error } = await supabase
    .from('invitations')
    .insert([
      {
        email: inviteeEmail || null, // Store null if not provided
        code,
        role,
        inviter_id: inviterId,
        group_id: groupId,
        status: 'pending',
        created_at: new Date().toISOString(),
      },
    ])
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to create invitation: ${error.message}`);
  }

  if (!data) {
    throw new Error('Failed to create invitation: No data returned');
  }

  return {
    code,
    id: data.id,
  };
};

/**
 * Verifies an invitation code and returns the invitation details
 * @param code The invitation code to verify
 * @param role The expected role of the invitation
 * @returns Promise<{id: string, email: string, groupId?: string, inviter_id: string}> The invitation details
 * @throws Error if invitation is invalid or expired
 */
export const verifyInvitation = async (
  code: string,
  role: InvitationRole
): Promise<{id: string, email: string, groupId?: string, inviter_id: string}> => {
  // Validate code format
  const codeRegex = new RegExp(`^[${role === 'patient' ? 'D' : 'P'}][A-Z0-9]{6}$`);
  if (!codeRegex.test(code)) {
    throw new Error('Invalid invitation code format');
  }

  const { data, error } = await supabase
    .from('invitations')
    .select('id, email, group_id, inviter_id')
    .eq('code', code)
    .eq('role', role)
    .eq('status', 'pending')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Invalid or expired invitation code');
    }
    throw new Error(`Failed to verify invitation: ${error.message}`);
  }

  if (!data) {
    throw new Error('Invalid invitation');
  }

  return {
    id: data.id,
    email: data.email,
    groupId: data.group_id,
    inviter_id: data.inviter_id,
  };
};

/**
 * Updates the status of an invitation
 * @param invitationId The ID of the invitation to update
 * @param status The new status ('accepted' or 'rejected')
 * @returns Promise<void>
 * @throws Error if database operation fails
 */
export const updateInvitationStatus = async (
  invitationId: string,
  status: 'accepted' | 'rejected'
): Promise<void> => {
  const { error } = await supabase
    .from('invitations')
    .update({ status })
    .eq('id', invitationId);

  if (error) {
    throw new Error(`Failed to update invitation status: ${error.message}`);
  }
};

/**
 * Gets all pending invitations for a user
 * @param userId The ID of the user to get invitations for
 * @returns Promise<Array<{id: string, email: string, code: string, role: string, created_at: string}>> Array of pending invitations
 * @throws Error if database operation fails
 */
export const getPendingInvitations = async (
  userId: string
): Promise<Array<{id: string, email: string, code: string, role: string, created_at: string}>> => {
  const { data, error } = await supabase
    .from('invitations')
    .select('id, email, code, role, created_at')
    .eq('inviter_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get pending invitations: ${error.message}`);
  }

  return data || [];
}; 

export async function insertPendingPlayerUser(email: string) {
  // Check if user already exists
  const { data: existing, error: fetchError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (!existing) {
    // Insert new pending player
    const { error: insertError } = await supabase.from('users').insert([
      {
        email,
        role: 'player',
        status: 'pending', // Make sure your users table has a status column
      },
    ]);
    if (insertError) throw insertError;
  }
} 