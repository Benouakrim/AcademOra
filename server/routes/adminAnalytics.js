import express from 'express';
import supabase from '../database/supabase.js';
import { parseUserToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(parseUserToken);
router.use(requireAdmin);

router.get('/overview', async (req, res) => {
  try {
    const [usersCountRes, unisCountRes, reviewsCountRes, savedCountRes] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('universities').select('id', { count: 'exact', head: true }),
      supabase.from('reviews').select('id', { count: 'exact', head: true }),
      supabase.from('saved_matches').select('id', { count: 'exact', head: true }),
    ]);

    res.json({
      users: usersCountRes.count || 0,
      universities: unisCountRes.count || 0,
      reviews: reviewsCountRes.count || 0,
      saved_matches: savedCountRes.count || 0,
    });
  } catch (err) {
    console.error('Analytics overview error:', err);
    res.status(500).json({ error: err.message || 'Failed to get overview' });
  }
});

router.get('/registrations/last7', async (req, res) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 7);
    const { data, error } = await supabase
      .from('users')
      .select('created_at')
      .gte('created_at', since.toISOString());
    if (error) throw error;

    const buckets = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().slice(0, 10);
      return { date: key, count: 0 };
    });

    for (const row of data || []) {
      const key = String(row.created_at).slice(0, 10);
      const bucket = buckets.find((b) => b.date === key);
      if (bucket) bucket.count++;
    }
    res.json(buckets);
  } catch (err) {
    console.error('Registrations error:', err);
    res.status(500).json({ error: err.message || 'Failed to get registrations' });
  }
});

export default router;


