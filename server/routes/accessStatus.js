import { Router } from 'express';
import { parseUserToken } from '../middleware/auth.js';
import { getFeatureUsageSummary } from '../middleware/accessControl.js';

const router = Router();

router.get('/usage/:featureKey', parseUserToken, async (req, res) => {
  try {
    const summary = await getFeatureUsageSummary({
      user: req.user,
      ip: req.ip,
      featureKey: req.params.featureKey,
    });
    res.json(summary);
  } catch (error) {
    console.error('Failed to fetch feature usage summary:', error);
    res.status(500).json({ error: 'Failed to fetch feature usage summary.' });
  }
});

export default router;

