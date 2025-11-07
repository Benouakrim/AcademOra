import supabase from '../database/supabase.js';

export async function listNotificationsByUser(userId, limit = 50) {
  const { data, error } = await supabase
    .from('notifications')
    .select('id, type, title, message, action_url, metadata, is_read, read_at, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getUnreadCount(userId) {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw error;
  return count || 0;
}

export async function markNotificationRead(userId, id) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
    .select('id, is_read, read_at')
    .single();

  if (error) throw error;
  return data;
}

export async function markAllNotificationsRead(userId) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw error;
  return true;
}

export async function createNotification({ user_id, type, title, message, action_url, metadata, status }) {
  const payload = {
    user_id,
    type,
    title,
    message,
    action_url: action_url || null,
    metadata: metadata || null,
  };

  const { data, error } = await supabase
    .from('notifications')
    .insert([payload])
    .select('id, user_id, type, title, message, action_url, metadata, is_read, created_at')
    .single();

  if (error) throw error;
  return data;
}

