import supabase from '../database/supabase.js';

// Get all categories (optionally filtered by type)
export async function getAllCategories(type = null) {
  try {
    let query = supabase
      .from('categories')
      .select('*');

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw error;
  }
}

// Get category by ID
export async function getCategoryById(id) {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data || null;
  } catch (error) {
    throw error;
  }
}

// Get category by slug (optionally filtered by type)
export async function getCategoryBySlug(slug, type = null) {
  try {
    let query = supabase
      .from('categories')
      .select('*')
      .eq('slug', slug);

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data || null;
  } catch (error) {
    throw error;
  }
}

// Create new category
export async function createCategory(categoryData) {
  try {
    const insertData = {
      name: categoryData.name,
      slug: categoryData.slug,
      type: categoryData.type || 'blog',
      description: categoryData.description || null,
      icon: categoryData.icon || null,
      color: categoryData.color || null,
      sort_order: categoryData.sort_order || 0,
    };

    const { data, error } = await supabase
      .from('categories')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      // Handle unique constraint violation (duplicate name or slug within type)
      if (error.code === '23505') {
        if (error.message.includes('name')) {
          throw new Error(`Category with this name already exists for type "${categoryData.type || 'blog'}"`);
        }
        if (error.message.includes('slug')) {
          throw new Error(`Category with this slug already exists for type "${categoryData.type || 'blog'}"`);
        }
        throw new Error(`Category with this name or slug already exists for type "${categoryData.type || 'blog'}"`);
      }
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
}

// Update category
export async function updateCategory(id, categoryData) {
  try {
    const updateData = {};
    
    if (categoryData.name !== undefined) updateData.name = categoryData.name;
    if (categoryData.slug !== undefined) updateData.slug = categoryData.slug;
    if (categoryData.type !== undefined) updateData.type = categoryData.type;
    if (categoryData.description !== undefined) updateData.description = categoryData.description;
    if (categoryData.icon !== undefined) updateData.icon = categoryData.icon;
    if (categoryData.color !== undefined) updateData.color = categoryData.color;
    if (categoryData.sort_order !== undefined) updateData.sort_order = categoryData.sort_order;

    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      if (error.code === '23505') {
        if (error.message.includes('name')) {
          throw new Error(`Category with this name already exists for type "${categoryData.type || 'blog'}"`);
        }
        if (error.message.includes('slug')) {
          throw new Error(`Category with this slug already exists for type "${categoryData.type || 'blog'}"`);
        }
        throw new Error(`Category with this name or slug already exists for type "${categoryData.type || 'blog'}"`);
      }
      throw error;
    }

    return data || null;
  } catch (error) {
    throw error;
  }
}

// Delete category
export async function deleteCategory(id) {
  try {
    // Check if category is being used by any articles
    const { data: articles, error: checkError } = await supabase
      .from('articles')
      .select('id')
      .eq('category_id', id)
      .limit(1);

    if (checkError) throw checkError;

    if (articles && articles.length > 0) {
      throw new Error('Cannot delete category: it is being used by one or more articles');
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    throw error;
  }
}

