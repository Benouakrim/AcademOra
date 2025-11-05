import express from 'express';
import { authenticateToken } from './auth.js';
import { matchUniversities } from '../services/matchingService.js';

const router = express.Router();

/**
 * POST /api/matching
 * Protected route to get university matches based on user criteria.
 * Criteria are sent in the request body.
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const criteria = req.body;

    if (!criteria || typeof criteria !== 'object') {
      return res.status(400).json({ error: 'Invalid criteria object' });
    }

    const results = await matchUniversities(criteria, 20);
    res.json(results);
  } catch (error) {
    console.error('Matching route error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
