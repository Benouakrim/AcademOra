import express from 'express';
import { authenticateToken } from './auth.js';
import { matchUniversities } from '../services/matchingService.js';
import supabase from '../database/supabase.js';

const router = express.Router();

/**
 * POST /api/matching
 * Protected route to get university matches based on user criteria.
 * Criteria are sent in the request body.
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Accept any object shape for the new complex criteria; default to {}
    const criteria = req.body || {};

    // Fetch user preferences (weights) if available
    let weights = null;
    const userId = req.user?.userId;
    if (userId) {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('weight_tuition, weight_location, weight_ranking, weight_program, weight_language')
        .eq('user_id', userId)
        .maybeSingle();
      if (!error && data) {
        weights = data;
      }
    }

    // Attach weights to criteria for the service layer
    if (weights) {
      criteria._weights = weights;
    }

    const results = await matchUniversities(criteria, 20);
    res.json(results);
  } catch (error) {
    console.error('Matching route error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
