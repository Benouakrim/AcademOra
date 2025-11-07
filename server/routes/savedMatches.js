import express from 'express';
import supabase from '../database/supabase.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// List saved matches for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    const { data, error } = await supabase
      .from('saved_matches')
      .select('id, university_id, note, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('List saved matches error:', err);
    res.status(500).json({ error: err.message || 'Failed to list saved matches' });
  }
});

// Check if a university is saved
router.get('/check/:universityId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    const universityId = req.params.universityId;
    const { data, error } = await supabase
      .from('saved_matches')
      .select('id')
      .eq('user_id', userId)
      .eq('university_id', universityId)
      .maybeSingle();
    if (error) throw error;
    res.json({ saved: !!data, id: data?.id || null });
  } catch (err) {
    console.error('Check saved match error:', err);
    res.status(500).json({ error: err.message || 'Failed to check saved match' });
  }
});

// Save a university
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    const { university_id, note } = req.body || {};
    if (!university_id) return res.status(400).json({ error: 'university_id is required' });

    const { data, error } = await supabase
      .from('saved_matches')
      .upsert({ user_id: userId, university_id, note: note || null }, { onConflict: 'user_id,university_id' })
      .select('*')
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Save match error:', err);
    res.status(500).json({ error: err.message || 'Failed to save match' });
  }
});

// Unsave a university
router.delete('/:universityId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    const universityId = req.params.universityId;
    const { error } = await supabase
      .from('saved_matches')
      .delete()
      .eq('user_id', userId)
      .eq('university_id', universityId);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('Unsave match error:', err);
    res.status(500).json({ error: err.message || 'Failed to unsave match' });
  }
});

export default router;


