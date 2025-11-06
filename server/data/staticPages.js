import supabase from '../database/supabase.js';

// Get static page by slug
export async function getStaticPageBySlug(slug) {
  try {
    const { data, error } = await supabase
      .from('static_pages')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      // Provide more helpful error messages
      if (error.message && error.message.includes('relation') || error.code === '42P01') {
        throw new Error('Static pages table does not exist. Please run the migration from server/database/migrations/05_create_static_pages.sql');
      }
      throw error;
    }

    return data || null;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(error.message || 'Failed to fetch static page from database');
  }
}

// Get all static pages (for admin)
export async function getAllStaticPages() {
  try {
    const { data, error } = await supabase
      .from('static_pages')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      // Provide more helpful error messages
      if (error.message && error.message.includes('relation') || error.code === '42P01') {
        throw new Error('Static pages table does not exist. Please run the migration from server/database/migrations/05_create_static_pages.sql');
      }
      if (error.message && error.message.includes('column')) {
        throw new Error('Static pages table is missing required columns. Please run the migration from server/database/migrations/05_create_static_pages.sql');
      }
      throw error;
    }
    return data || [];
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(error.message || 'Failed to fetch static pages from database');
  }
}

// Create or update static page
export async function upsertStaticPage(pageData) {
  try {
    const { 
      slug, 
      title, 
      content, 
      meta_title, 
      meta_description, 
      status = 'draft',
      visibility_areas = [],
      sort_order = 0
    } = pageData;

    // Check if page exists (catch error if table doesn't exist)
    let existing;
    try {
      existing = await getStaticPageBySlug(slug);
    } catch (err) {
      // If table doesn't exist, rethrow the error
      throw err;
    }

    if (existing) {
      // Update existing page
      const { data, error } = await supabase
        .from('static_pages')
        .update({
          title,
          content,
          meta_title,
          meta_description,
          status,
          visibility_areas: Array.isArray(visibility_areas) ? visibility_areas : [],
          sort_order,
          updated_at: new Date().toISOString(),
        })
        .eq('slug', slug)
        .select()
        .single();

      if (error) {
        if (error.message && error.message.includes('column')) {
          throw new Error('Static pages table is missing required columns (status, visibility_areas, sort_order). Please run the migration from server/database/migrations/05_create_static_pages.sql');
        }
        throw error;
      }
      return data;
    } else {
      // Create new page
      const { data, error } = await supabase
        .from('static_pages')
        .insert({
          slug,
          title,
          content,
          meta_title,
          meta_description,
          status,
          visibility_areas: Array.isArray(visibility_areas) ? visibility_areas : [],
          sort_order,
        })
        .select()
        .single();

      if (error) {
        if (error.message && error.message.includes('relation') || error.code === '42P01') {
          throw new Error('Static pages table does not exist. Please run the migration from server/database/migrations/05_create_static_pages.sql');
        }
        if (error.message && error.message.includes('column')) {
          throw new Error('Static pages table is missing required columns. Please run the migration from server/database/migrations/05_create_static_pages.sql');
        }
        throw error;
      }
      return data;
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(error.message || 'Failed to save static page to database');
  }
}

// Get pages for navbar (published pages with navbar visibility)
export async function getNavbarPages() {
  try {
    const { data, error } = await supabase
      .from('static_pages')
      .select('id, slug, title, visibility_areas, sort_order')
      .eq('status', 'published')
      .order('sort_order', { ascending: true })
      .order('title', { ascending: true });

    if (error) {
      if (error.message && error.message.includes('relation') || error.code === '42P01') {
        throw new Error('Static pages table does not exist. Please run the migration from server/database/migrations/05_create_static_pages.sql');
      }
      throw error;
    }

    // Filter pages that have 'navbar' in visibility_areas
    const navbarPages = (data || []).filter(page => {
      const areas = page.visibility_areas || [];
      return Array.isArray(areas) && areas.includes('navbar');
    });

    return navbarPages;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(error.message || 'Failed to fetch navbar pages from database');
  }
}

// Delete static page
export async function deleteStaticPage(slug) {
  try {
    const { error } = await supabase
      .from('static_pages')
      .delete()
      .eq('slug', slug);

    if (error) {
      if (error.message && error.message.includes('relation') || error.code === '42P01') {
        throw new Error('Static pages table does not exist. Please run the migration from server/database/migrations/05_create_static_pages.sql');
      }
      throw error;
    }
    return true;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(error.message || 'Failed to delete static page from database');
  }
}

