import express from 'express';
import { authenticateToken } from './auth.js';
import {
  getAllStaticPages,
  getStaticPageBySlug,
  upsertStaticPage,
  deleteStaticPage,
} from '../data/staticPages.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all static pages
router.get('/', async (req, res) => {
  try {
    const pages = await getAllStaticPages();
    res.json(pages);
  } catch (error) {
    console.error('Error fetching static pages:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get static page by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const page = await getStaticPageBySlug(slug);

    if (!page) {
      return res.status(404).json({ error: 'Page not found' });
    }

    res.json(page);
  } catch (error) {
    console.error('Error fetching static page:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create or update static page
router.put('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, content, meta_title, meta_description, status, visibility_areas, sort_order } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const page = await upsertStaticPage({
      slug,
      title,
      content,
      meta_title,
      meta_description,
      status,
      visibility_areas,
      sort_order,
    });

    res.json(page);
  } catch (error) {
    console.error('Error saving static page:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete static page
router.delete('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    await deleteStaticPage(slug);
    res.json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Error deleting static page:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

