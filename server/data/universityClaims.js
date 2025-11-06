import supabase from '../database/supabase.js';

// Helper to normalize text fields
function toTextOrNull(value) {
  return value && value.trim() ? value.trim() : null;
}

export async function createClaimRequest(payload) {
  try {
    const insert = {
      university_id: payload.university_id || null,
      university_group_id: payload.university_group_id || null,
      requester_email: payload.requester_email || null,
      requester_name: payload.requester_name || null,
      requester_phone: toTextOrNull(payload.requester_phone),
      requester_position: toTextOrNull(payload.requester_position),
      requester_department: toTextOrNull(payload.requester_department),
      organization_name: toTextOrNull(payload.organization_name),
      verification_documents: payload.verification_documents || null,
      status: 'pending',
      expires_at: payload.expires_at || null,
    };

    // Validate that either university_id or university_group_id is provided
    if (!insert.university_id && !insert.university_group_id) {
      throw new Error('Either university_id or university_group_id is required');
    }

    const { data, error } = await supabase
      .from('university_claim_requests')
      .insert([insert])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

export async function getClaimRequestById(id) {
  try {
    const { data, error } = await supabase
      .from('university_claim_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data || null;
  } catch (error) {
    throw error;
  }
}

export async function getClaimRequestsByUser(userId) {
  try {
    // Get requests by requester email (we'll need to get user email first)
    // For now, we'll get all requests - in production, you'd filter by user email
    const { data, error } = await supabase
      .from('university_claim_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw error;
  }
}

export async function getAllClaimRequests(status = null) {
  try {
    let query = supabase
      .from('university_claim_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw error;
  }
}

export async function updateClaimRequestStatus(id, status, adminUserId, adminNotes = null) {
  try {
    const update = {
      status,
      reviewed_by: adminUserId,
      reviewed_at: new Date().toISOString(),
    };

    if (adminNotes !== null) {
      update.admin_notes = adminNotes;
    }

    const { data, error } = await supabase
      .from('university_claim_requests')
      .update(update)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // If approved, create the claim
    if (status === 'approved' && data) {
      await createClaim(data);
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export async function createClaim(claimRequest) {
  try {
    // First, check if a claim already exists
    const existingClaim = await getClaimByUniversityOrGroup(
      claimRequest.university_id,
      claimRequest.university_group_id
    );

    if (existingClaim) {
      throw new Error('This university/group is already claimed');
    }

    // Get user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', claimRequest.requester_email)
      .single();

    if (userError || !user) {
      throw new Error('User not found for claim request');
    }

    const insert = {
      university_id: claimRequest.university_id || null,
      university_group_id: claimRequest.university_group_id || null,
      claim_request_id: claimRequest.id,
      claimed_by: user.id,
      status: 'active',
    };

    const { data, error } = await supabase
      .from('university_claims')
      .insert([insert])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

export async function getClaimByUniversityOrGroup(universityId, universityGroupId) {
  try {
    let query = supabase
      .from('university_claims')
      .select('*')
      .eq('status', 'active');

    if (universityId) {
      query = query.eq('university_id', universityId);
    } else if (universityGroupId) {
      query = query.eq('university_group_id', universityGroupId);
    } else {
      return null;
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data || null;
  } catch (error) {
    throw error;
  }
}

export async function getClaimByUserId(userId) {
  try {
    const { data, error } = await supabase
      .from('university_claims')
      .select('*')
      .eq('claimed_by', userId)
      .eq('status', 'active');

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw error;
  }
}

export async function updateClaimStatus(id, status) {
  try {
    const { data, error } = await supabase
      .from('university_claims')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

