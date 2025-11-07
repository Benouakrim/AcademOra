import supabase from '../database/supabase.js';

const baseSelect = `id, university_id, content_type, title, content, media_url, link_url, priority, status, publish_date, expiry_date, created_by, created_at, updated_at`;

export async function listMicroContentForUniversity(universityId) {
  const { data, error } = await supabase
    .from('micro_content')
    .select(baseSelect)
    .eq('university_id', universityId)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function listAllMicroContent() {
  const { data, error } = await supabase
    .from('micro_content')
    .select(baseSelect)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getMicroContentById(id) {
  const { data, error } = await supabase
    .from('micro_content')
    .select(baseSelect)
    .eq('id', id)
    .single();

  if (error) {
    if (error?.code === 'PGRST116') return null;
    throw error;
  }

  return data || null;
}

export async function createMicroContent(payload) {
  const insertPayload = {
    university_id: payload.university_id,
    content_type: payload.content_type,
    title: payload.title,
    content: payload.content,
    media_url: payload.media_url || null,
    link_url: payload.link_url || null,
    priority: payload.priority ?? 1,
    status: payload.status || 'draft',
    publish_date: payload.publish_date || null,
    expiry_date: payload.expiry_date || null,
    created_by: payload.created_by || null,
  };

  const { data, error } = await supabase
    .from('micro_content')
    .insert([insertPayload])
    .select(baseSelect)
    .single();

  if (error) throw error;
  return data;
}

export async function updateMicroContent(id, payload) {
  const updatePayload = {};
  const allowed = ['content_type', 'title', 'content', 'media_url', 'link_url', 'priority', 'status', 'publish_date', 'expiry_date'];
  for (const key of allowed) {
    if (payload[key] !== undefined) updatePayload[key] = payload[key];
  }

  const { data, error } = await supabase
    .from('micro_content')
    .update(updatePayload)
    .eq('id', id)
    .select(baseSelect)
    .single();

  if (error) {
    if (error?.code === 'PGRST116') return null;
    throw error;
  }

  return data || null;
}

export async function deleteMicroContent(id) {
  const { error } = await supabase
    .from('micro_content')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

