import express from 'express';
import { getArticles, getArticleBySlug } from '../data/articles.js';
import { parseUserToken } from '../middleware/auth.js';
import { checkFeatureAccess, logUsage } from '../middleware/accessControl.js';

const router = express.Router();

const ensurePremiumAccess = checkFeatureAccess('view-premium-content');
const logPremiumUsage = logUsage('view-premium-content');

// Simple in-memory cache for list endpoint
let listCache = { data: null, at: 0 };
const LIST_TTL_MS = 60 * 1000;

// Get all published articles (optionally filtered by category)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const now = Date.now();
    const cacheKey = category || 'all';
    
    // Use cache only if no category filter
    if (!category && listCache.data && now - listCache.at < LIST_TTL_MS) {
      return res.json(listCache.data);
    }
    
    const articles = await getArticles(category || null);
    
    // Cache only if no category filter
    if (!category) {
      listCache = { data: articles, at: now };
    }
    
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get article by slug
router.get(
  '/:slug',
  parseUserToken,
  async (req, res, next) => {
    try {
      const { slug } = req.params;
      const article = await getArticleBySlug(slug);

      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      const isPremium = Boolean(article.is_premium ?? article.premium);
      req.article = { ...article, is_premium: isPremium };

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
      console.error('Error fetching article:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to fetch article.' });
      }
    }
  },
  (req, res) => {
    if (!req.article) {
      return res.status(500).json({ error: 'Article payload missing.' });
    }
    res.json(req.article);
  }
);

export default router;

