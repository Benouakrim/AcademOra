import supabase from '../database/supabase.js';

// Helper to normalize text fields
function toTextOrNull(value) {
  return value && value.trim() ? value.trim() : null;
}

// Helper to normalize numeric fields
function toNumberOrNull(val) {
  if (val === undefined || val === null || val === '') return null;
  const n = Number(val);
  return Number.isNaN(n) ? null : n;
}

export async function getAllGroups() {
  try {
    const { data, error } = await supabase
      .from('university_groups')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw error;
  }
}

export async function getGroupById(id) {
  try {
    const { data, error } = await supabase
      .from('university_groups')
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

export async function getGroupBySlug(slug) {
  try {
    const { data, error } = await supabase
      .from('university_groups')
      .select('*')
      .eq('slug', slug)
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

export async function getGroupWithUniversities(groupId) {
  try {
    // Get group
    const { data: group, error: groupError } = await supabase
      .from('university_groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (groupError) {
      if (groupError.code === 'PGRST116') return null;
      throw groupError;
    }

    // Get universities under this group
    const { data: universities, error: universitiesError } = await supabase
      .from('universities')
      .select('*')
      .eq('group_id', groupId)
      .order('name', { ascending: true });

    if (universitiesError) throw universitiesError;

    return {
      ...group,
      universities: universities || [],
    };
  } catch (error) {
    throw error;
  }
}

export async function getGroupWithUniversitiesBySlug(slug) {
  try {
    // Get group
    const { data: group, error: groupError } = await supabase
      .from('university_groups')
      .select('*')
      .eq('slug', slug)
      .single();

    if (groupError) {
      if (groupError.code === 'PGRST116') return null;
      throw groupError;
    }

    if (!group) return null;

    // Get universities under this group
    const { data: universities, error: universitiesError } = await supabase
      .from('universities')
      .select('*')
      .eq('group_id', group.id)
      .order('name', { ascending: true });

    if (universitiesError) throw universitiesError;

    return {
      ...group,
      universities: universities || [],
    };
  } catch (error) {
    throw error;
  }
}

export async function createGroup(payload) {
  try {
    const insert = {
      name: payload.name || null,
      short_name: toTextOrNull(payload.short_name),
      slug: payload.slug || null,
      description: toTextOrNull(payload.description),
      logo_url: toTextOrNull(payload.logo_url),
      hero_image_url: toTextOrNull(payload.hero_image_url),
      website_url: toTextOrNull(payload.website_url),
      established_year: toNumberOrNull(payload.established_year),
      headquarters_country: toTextOrNull(payload.headquarters_country),
      headquarters_city: toTextOrNull(payload.headquarters_city),
      headquarters_address: toTextOrNull(payload.headquarters_address),
      contact_email: toTextOrNull(payload.contact_email),
      contact_phone: toTextOrNull(payload.contact_phone),
    };

    const { data, error } = await supabase
      .from('university_groups')
      .insert([insert])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

export async function updateGroup(id, payload) {
  try {
    const update = {};
    if (payload.name !== undefined) update.name = payload.name;
    if (payload.short_name !== undefined) update.short_name = toTextOrNull(payload.short_name);
    if (payload.slug !== undefined) update.slug = payload.slug;
    if (payload.description !== undefined) update.description = toTextOrNull(payload.description);
    if (payload.logo_url !== undefined) update.logo_url = toTextOrNull(payload.logo_url);
    if (payload.hero_image_url !== undefined) update.hero_image_url = toTextOrNull(payload.hero_image_url);
    if (payload.website_url !== undefined) update.website_url = toTextOrNull(payload.website_url);
    if (payload.established_year !== undefined) update.established_year = toNumberOrNull(payload.established_year);
    if (payload.headquarters_country !== undefined) update.headquarters_country = toTextOrNull(payload.headquarters_country);
    if (payload.headquarters_city !== undefined) update.headquarters_city = toTextOrNull(payload.headquarters_city);
    if (payload.headquarters_address !== undefined) update.headquarters_address = toTextOrNull(payload.headquarters_address);
    if (payload.contact_email !== undefined) update.contact_email = toTextOrNull(payload.contact_email);
    if (payload.contact_phone !== undefined) update.contact_phone = toTextOrNull(payload.contact_phone);

    const { data, error } = await supabase
      .from('university_groups')
      .update(update)
      .eq('id', id)
      .select()
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

export async function deleteGroup(id) {
  try {
    // First, unlink all universities from this group
    await supabase
      .from('universities')
      .update({ group_id: null })
      .eq('group_id', id);

    // Then delete the group
    const { error } = await supabase
      .from('university_groups')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116') return false;
      throw error;
    }
    return true;
  } catch (error) {
    throw error;
  }
}

