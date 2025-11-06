import express from 'express';
import supabase from '../database/supabase.js';
import { authenticateToken } from './auth.js';

const router = express.Router();
router.use(authenticateToken);

function tableFor(kind){
  if (kind === 'experiences') return 'experiences';
  if (kind === 'education') return 'education_entries';
  if (kind === 'projects') return 'projects';
  if (kind === 'certifications') return 'certifications';
  return null;
}

// List
router.get('/:kind', async (req, res) => {
  const table = tableFor(req.params.kind);
  if (!table) return res.status(400).json({ error: 'Invalid kind' });
  try {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create
router.post('/:kind', async (req, res) => {
  const table = tableFor(req.params.kind);
  if (!table) return res.status(400).json({ error: 'Invalid kind' });
  try {
    const payload = { ...req.body, user_id: req.user.id };
    const { data, error } = await supabase
      .from(table)
      .insert([payload])
      .select('*')
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update
router.put('/:kind/:id', async (req, res) => {
  const table = tableFor(req.params.kind);
  if (!table) return res.status(400).json({ error: 'Invalid kind' });
  try {
    const { data, error } = await supabase
      .from(table)
      .update(req.body)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select('*')
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete
router.delete('/:kind/:id', async (req, res) => {
  const table = tableFor(req.params.kind);
  if (!table) return res.status(400).json({ error: 'Invalid kind' });
  try {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;


