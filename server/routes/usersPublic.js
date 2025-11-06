import express from 'express';
import supabase from '../database/supabase.js';

const router = express.Router();

// Get public profile by username (or id fallback)
router.get('/:username', async (req, res) => {
  try {
    const key = req.params.username;
    const query = supabase
      .from('users')
      .select('id, email, role, created_at, full_name, username, title, headline, location, bio, avatar_url, website_url, linkedin_url, github_url, twitter_url, portfolio_url, is_profile_public, show_email, show_saved, show_reviews, show_socials, show_activity')
      .limit(1);

    const { data, error } = await query.eq('username', key).single();
    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'User not found' });
      throw error;
    }

    if (!data.is_profile_public) {
      // Return minimal public info if profile is private
      return res.json({
        id: data.id,
        username: data.username,
        full_name: data.full_name,
        avatar_url: data.avatar_url,
        is_profile_public: false,
      });
    }

    // Apply privacy flags
    if (!data.show_email) delete data.email;
    if (!data.show_socials) {
      delete data.website_url; delete data.linkedin_url; delete data.github_url; delete data.twitter_url; delete data.portfolio_url;
    }

    // Attach badges
    const { data: badges } = await supabase
      .from('user_badges')
      .select('awarded_at, badges:badge_id (slug, name, icon)')
      .eq('user_id', data.id);

    // Attach recent reviews if visible
    let reviews = [];
    if (data.show_reviews) {
      const r = await supabase
        .from('reviews')
        .select('id, university_id, rating, comment, created_at')
        .eq('user_id', data.id)
        .order('created_at', { ascending: false })
        .limit(5);
      reviews = r.data || [];
    }

    // Attach profile sections if activity visible
    let experiences = [], education = [], projects = [], certifications = [];
    if (data.show_activity) {
      const [ex, ed, pr, ce] = await Promise.all([
        supabase.from('experiences').select('id, title, company, location, start_date, end_date, current, description, created_at').eq('user_id', data.id).order('start_date', { ascending: false }).limit(10),
        supabase.from('education_entries').select('id, school, degree, field, start_year, end_year, description, created_at').eq('user_id', data.id).order('start_year', { ascending: false }).limit(10),
        supabase.from('projects').select('id, name, role, url, description, created_at').eq('user_id', data.id).order('created_at', { ascending: false }).limit(10),
        supabase.from('certifications').select('id, name, issuer, issue_date, credential_id, credential_url, created_at').eq('user_id', data.id).order('issue_date', { ascending: false }).limit(10),
      ]);
      experiences = ex.data || [];
      education = ed.data || [];
      projects = pr.data || [];
      certifications = ce.data || [];
    }

    res.json({ ...data, badges: badges || [], recent_reviews: reviews, experiences, education, projects, certifications });
  } catch (err) {
    console.error('Public profile error:', err);
    res.status(500).json({ error: err.message || 'Failed to load profile' });
  }
});

export default router;


