import express from 'express';
import supabase from '../database/supabase.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// List notifications for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { data, error } = await supabase
      .from('notifications')
      .select('id, type, payload, is_read, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error('List notifications error:', err);
    res.status(500).json({ error: err.message || 'Failed to list notifications' });
  }
});

// Unread count
router.get('/unread/count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    if (error) throw error;
    res.json({ count: count || 0 });
  } catch (err) {
    console.error('Unread count error:', err);
    res.status(500).json({ error: err.message || 'Failed to get unread count' });
  }
});

// Mark one as read
router.post('/:id/read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const id = req.params.id;
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', userId)
      .select('id, is_read')
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).json({ error: err.message || 'Failed to mark as read' });
  }
});

// Mark all as read
router.post('/read-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('Mark all read error:', err);
    res.status(500).json({ error: err.message || 'Failed to mark all as read' });
  }
});

export default router;


