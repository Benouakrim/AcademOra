import supabase from '../database/supabase.js';

export async function getSavedItems(userId, itemType = null) {
  try {
    let query = supabase
      .from('saved_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (itemType) {
      query = query.eq('item_type', itemType);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw error;
  }
}

export async function saveItem(userId, itemType, itemId, itemData = null) {
  try {
    const { data, error } = await supabase
      .from('saved_items')
      .insert([{
        user_id: userId,
        item_type: itemType,
        item_id: itemId,
        item_data: itemData,
      }])
      .select()
      .single();

    if (error) {
      // If duplicate, just return existing
      if (error.code === '23505') {
        return await getSavedItem(userId, itemType, itemId);
      }
      throw error;
    }
    return data;
  } catch (error) {
    throw error;
  }
}

export async function unsaveItem(userId, itemType, itemId) {
  try {
    const { error } = await supabase
      .from('saved_items')
      .delete()
      .eq('user_id', userId)
      .eq('item_type', itemType)
      .eq('item_id', itemId);

    if (error) throw error;
    return true;
  } catch (error) {
    throw error;
  }
}

export async function getSavedItem(userId, itemType, itemId) {
  try {
    const { data, error } = await supabase
      .from('saved_items')
      .select('*')
      .eq('user_id', userId)
      .eq('item_type', itemType)
      .eq('item_id', itemId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  } catch (error) {
    throw error;
  }
}

export async function isItemSaved(userId, itemType, itemId) {
  try {
    const item = await getSavedItem(userId, itemType, itemId);
    return !!item;
  } catch (error) {
    return false;
  }
}

export async function getSavedItemsCount(userId) {
  try {
    const { count, error } = await supabase
      .from('saved_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    throw error;
  }
}

