import express from 'express';
import { getArticles, getArticleBySlug } from '../data/articles.js';

const router = express.Router();

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
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const article = await getArticleBySlug(slug);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

