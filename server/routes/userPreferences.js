import express from 'express';
import supabase from '../database/supabase.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get current user's preferences
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    res.json(data || null);
  } catch (err) {
    console.error('Get preferences error:', err);
    res.status(500).json({ error: err.message || 'Failed to get preferences' });
  }
});

// Upsert user preferences
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    const prefs = {
      user_id: userId,
      weight_tuition: req.body?.weight_tuition ?? 0.5,
      weight_location: req.body?.weight_location ?? 0.5,
      weight_ranking: req.body?.weight_ranking ?? 0.5,
      weight_program: req.body?.weight_program ?? 0.5,
      weight_language: req.body?.weight_language ?? 0.5,
    };

    const { data, error } = await supabase
      .from('user_preferences')
      .upsert(prefs, { onConflict: 'user_id' })
      .select('*')
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Upsert preferences error:', err);
    res.status(500).json({ error: err.message || 'Failed to save preferences' });
  }
});

export default router;


