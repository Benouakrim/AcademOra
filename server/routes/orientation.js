import express from 'express';
import {
  getResources,
  getResourcesByCategory,
  getResourceBySlug,
} from '../data/orientation.js';
import { parseUserToken } from '../middleware/auth.js';
import { checkFeatureAccess, logUsage } from '../middleware/accessControl.js';

const router = express.Router();

const ensurePremiumAccess = checkFeatureAccess('view-premium-content');
const logPremiumUsage = logUsage('view-premium-content');

// Get all resources
router.get('/', async (req, res) => {
  try {
    const resources = await getResources();
    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get resources by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const resources = await getResourcesByCategory(category);
    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get resource by slug and category
router.get(
  '/:category/:slug',
  parseUserToken,
  async (req, res, next) => {
    try {
      const { category, slug } = req.params;
      const resource = await getResourceBySlug(category, slug);

      if (!resource) {
        return res.status(404).json({ error: 'Resource not found' });
      }

      const isPremium = Boolean(resource.is_premium ?? resource.premium);
      req.resource = { ...resource, is_premium: isPremium };

      if (!isPremium) {
        return next();
      }

      ensurePremiumAccess(req, res, (err) => {
        if (err) {
          return next(err);
        }
        logPremiumUsage(req, res, next);
      });
    } catch (error) {
      console.error('Error fetching orientation resource:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to fetch orientation resource.' });
      }
    }
  },
  (req, res) => {
    if (!req.resource) {
      return res.status(500).json({ error: 'Resource payload missing.' });
    }
    res.json(req.resource);
  }
);

export default router;

