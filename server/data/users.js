import supabase from '../database/supabase.js';
import bcrypt from 'bcrypt';

function generateBaseUsername(email) {
  try {
    const base = String(email).split('@')[0] || 'user'
    return base.toLowerCase().replace(/[^a-z0-9\-]+/g, '-')
  } catch { return 'user' }
}

async function ensureUniqueUsername(candidate) {
  let username = candidate
  for (let i = 0; i < 3; i++) {
    const { data, error } = await supabase.from('users').select('id').eq('username', username).maybeSingle()
    if (!error && !data) return username
    username = `${candidate}-${Math.random().toString(36).slice(2, 6)}`
  }
  return `${candidate}-${Date.now().toString().slice(-4)}`
}

export async function createUser(email, password, role = 'user') {
  try {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique username
    const base = generateBaseUsername(email)
    const username = await ensureUniqueUsername(base)

    // Insert user into Supabase
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          password: hashedPassword,
          role: role || 'user', // Default to 'user' role
          username,
        },
      ])
      .select('id, email, role, created_at, username')
      .single();

    if (error) {
      // Handle unique constraint violation (duplicate email)
      if (error.code === '23505') {
        throw new Error('User already exists');
      }
      throw error;
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export async function listUsers() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role, created_at, username, full_name, avatar_url, last_seen')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw error;
  }
}

export async function findUserByEmail(email) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      // If no rows found, return null
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

export async function findUserById(id) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role, created_at')
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

export async function verifyPassword(user, password) {
  return await bcrypt.compare(password, user.password);
}

export async function updatePasswordByEmail(email, newPassword) {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const { data, error } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('email', email)
      .select('id, email, role, created_at')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

export async function updatePasswordById(userId, currentPassword, newPassword) {
  try {
    const user = await findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get full user data including password
    const { data: fullUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    // Verify current password
    const isValid = await verifyPassword(fullUser, currentPassword);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const { data, error } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', userId)
      .select('id, email, role, created_at, subscription_status, full_name, phone, bio, avatar_url')
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

export async function updateUserProfile(userId, updates) {
  try {
    const updateData = {};
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.full_name !== undefined) updateData.full_name = updates.full_name || null;
    if (updates.username !== undefined) updateData.username = updates.username || null;
    if (updates.title !== undefined) updateData.title = updates.title || null;
    if (updates.headline !== undefined) updateData.headline = updates.headline || null;
    if (updates.location !== undefined) updateData.location = updates.location || null;
    if (updates.phone !== undefined) updateData.phone = updates.phone || null;
    if (updates.bio !== undefined) updateData.bio = updates.bio || null;
    if (updates.avatar_url !== undefined) updateData.avatar_url = updates.avatar_url || null;
    if (updates.website_url !== undefined) updateData.website_url = updates.website_url || null;
    if (updates.linkedin_url !== undefined) updateData.linkedin_url = updates.linkedin_url || null;
    if (updates.github_url !== undefined) updateData.github_url = updates.github_url || null;
    if (updates.twitter_url !== undefined) updateData.twitter_url = updates.twitter_url || null;
    if (updates.portfolio_url !== undefined) updateData.portfolio_url = updates.portfolio_url || null;
    if (updates.subscription_status !== undefined) updateData.subscription_status = updates.subscription_status;
    if (updates.subscription_expires_at !== undefined) updateData.subscription_expires_at = updates.subscription_expires_at || null;
    // privacy
    if (updates.is_profile_public !== undefined) updateData.is_profile_public = !!updates.is_profile_public;
    if (updates.show_email !== undefined) updateData.show_email = !!updates.show_email;
    if (updates.show_saved !== undefined) updateData.show_saved = !!updates.show_saved;
    if (updates.show_reviews !== undefined) updateData.show_reviews = !!updates.show_reviews;
    if (updates.show_socials !== undefined) updateData.show_socials = !!updates.show_socials;
    if (updates.show_activity !== undefined) updateData.show_activity = !!updates.show_activity;

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select('id, email, role, created_at, subscription_status, subscription_expires_at, full_name, username, title, headline, location, phone, bio, avatar_url, website_url, linkedin_url, github_url, twitter_url, portfolio_url, is_profile_public, show_email, show_saved, show_reviews, show_socials, show_activity')
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('Email already exists');
      }
      throw error;
    }
    return data;
  } catch (error) {
    throw error;
  }
}

export async function getUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role, created_at, subscription_status, subscription_expires_at, full_name, username, title, headline, location, phone, bio, avatar_url, website_url, linkedin_url, github_url, twitter_url, portfolio_url, is_profile_public, show_email, show_saved, show_reviews, show_socials, show_activity')
      .eq('id', userId)
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