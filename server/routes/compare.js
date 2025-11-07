import express from 'express';
import { parseUserToken } from '../middleware/auth.js';
import { checkFeatureAccess, logUsage } from '../middleware/accessControl.js';
import { getAllUniversities } from '../data/universities.js';

const router = express.Router();

router.get(
  '/',
  parseUserToken,
  checkFeatureAccess('compare-universities'),
  logUsage('compare-universities'),
  async (req, res) => {
    try {
      const universities = await getAllUniversities();
      res.json(universities);
    } catch (error) {
      console.error('Error fetching compare universities:', error);
      res.status(500).json({ error: 'Failed to fetch university comparison data.' });
    }
  }
);

export default router;

