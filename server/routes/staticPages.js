import express from 'express';
import { getStaticPageBySlug, getNavbarPages } from '../data/staticPages.js';

const router = express.Router();

// Get all pages for navbar (public - only published pages with navbar visibility)
// IMPORTANT: This route must come BEFORE /:slug to avoid route conflicts
router.get('/navbar/list', async (req, res) => {
  try {
    const pages = await getNavbarPages();
    res.json(pages);
  } catch (error) {
    console.error('Error fetching navbar pages:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get static page by slug (public - only published pages)
// This route must come AFTER /navbar/list to avoid matching "navbar" as a slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Skip if it's the navbar list route
    if (slug === 'navbar') {
      return res.status(404).json({ error: 'Page not found' });
    }
    
    const page = await getStaticPageBySlug(slug);

    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    // Only return published pages for public access
    if (page.status !== 'published') {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json(page);
  } catch (error) {
    console.error('Error fetching static page:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

