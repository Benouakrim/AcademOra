import { supabase } from '../database/supabase.js';

/**
 * Data access layer for saved university comparisons
 */

/**
 * Create a new saved comparison
 */
export async function createSavedComparison({ userId, name, description, universityIds }) {
  if (!userId || !name || !universityIds || universityIds.length === 0) {
    throw new Error('userId, name, and universityIds are required');
  }

  if (universityIds.length > 5) {
    throw new Error('Maximum 5 universities can be saved in a comparison');
  }

  const { data, error } = await supabase
    .from('saved_comparisons')
    .insert([
      {
        user_id: userId,
        name,
        description,
        university_ids: universityIds,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating saved comparison:', error);
    throw error;
  }

  return data;
}

/**
 * Get all saved comparisons for a user
 */
export async function getSavedComparisonsByUserId(userId, options = {}) {
  const { 
    limit = 50, 
    offset = 0,
    sortBy = 'created_at',
    sortOrder = 'desc',
    favoritesOnly = false 
  } = options;

  let query = supabase
    .from('saved_comparisons')
    .select('*')
    .eq('user_id', userId);

  if (favoritesOnly) {
    query = query.eq('is_favorite', true);
  }

  query = query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching saved comparisons:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get a specific saved comparison by ID
 */
export async function getSavedComparisonById(id, userId) {
  const { data, error } = await supabase
    .from('saved_comparisons')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching saved comparison:', error);
    throw error;
  }

  return data;
}

/**
 * Update a saved comparison
 */
export async function updateSavedComparison(id, userId, updates) {
  const allowedUpdates = {
    name: updates.name,
    description: updates.description,
    university_ids: updates.universityIds,
    is_favorite: updates.isFavorite,
  };

  // Remove undefined values
  Object.keys(allowedUpdates).forEach(key => {
    if (allowedUpdates[key] === undefined) {
      delete allowedUpdates[key];
    }
  });

  if (allowedUpdates.university_ids && allowedUpdates.university_ids.length > 5) {
    throw new Error('Maximum 5 universities can be saved in a comparison');
  }

  const { data, error } = await supabase
    .from('saved_comparisons')
    .update(allowedUpdates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating saved comparison:', error);
    throw error;
  }

  return data;
}

/**
 * Update last viewed timestamp
 */
export async function markComparisonAsViewed(id, userId) {
  const { data, error } = await supabase
    .from('saved_comparisons')
    .update({ last_viewed_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating comparison view timestamp:', error);
    throw error;
  }

  return data;
}

/**
 * Delete a saved comparison
 */
export async function deleteSavedComparison(id, userId) {
  const { error } = await supabase
    .from('saved_comparisons')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting saved comparison:', error);
    throw error;
  }

  return true;
}

/**
 * Toggle favorite status
 */
export async function toggleComparisonFavorite(id, userId) {
  // First get current status
  const current = await getSavedComparisonById(id, userId);
  if (!current) {
    throw new Error('Comparison not found');
  }

  const { data, error } = await supabase
    .from('saved_comparisons')
    .update({ is_favorite: !current.is_favorite })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error toggling favorite status:', error);
    throw error;
  }

  return data;
}

/**
 * Get count of saved comparisons for a user
 */
export async function getSavedComparisonsCount(userId) {
  const { count, error } = await supabase
    .from('saved_comparisons')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) {
    console.error('Error counting saved comparisons:', error);
    throw error;
  }

  return count || 0;
}

/**
 * Check if a comparison with the same universities already exists
 */
export async function findDuplicateComparison(userId, universityIds) {
  // Sort IDs to ensure consistent comparison
  const sortedIds = [...universityIds].sort();

  const { data, error } = await supabase
    .from('saved_comparisons')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Error checking for duplicate comparisons:', error);
    throw error;
  }

  // Check if any saved comparison has the same universities
  const duplicate = data?.find(comp => {
    const compIds = [...comp.university_ids].sort();
    return JSON.stringify(compIds) === JSON.stringify(sortedIds);
  });

  return duplicate || null;
}
