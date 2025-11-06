import express from 'express';
import { authenticateToken, requireAdmin } from './auth.js';
import { listUsers } from '../data/users.js';
import {
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
} from '../data/articles.js';
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../data/categories.js';
import {
  listTaxonomies,
  getTaxonomyByKey,
  createTaxonomy,
  updateTaxonomy,
  deleteTaxonomy,
  listTerms,
  createTerm,
  updateTerm,
  deleteTerm,
} from '../data/taxonomies.js';

const router = express.Router();

// All admin routes require authentication AND admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Get all articles (including unpublished)
router.get('/articles', async (req, res) => {
  try {
    const articles = await getAllArticles();
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users (admin view)
router.get('/users', async (req, res) => {
  try {
    const users = await listUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get article by ID
router.get('/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const article = await getArticleById(id);

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new article
router.post('/articles', async (req, res) => {
  try {
    const {
      title,
      slug,
      content,
      excerpt,
      category,
      published = false,
      featured_image,
    } = req.body;

    if (!title || !slug || !content || !excerpt || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const article = await createArticle({
      title,
      slug,
      content,
      excerpt,
      category,
      published,
      featured_image,
      author_id: req.user.userId,
    });

    res.status(201).json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update article
router.put('/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      content,
      excerpt,
      category,
      published,
      featured_image,
    } = req.body;

    const article = await updateArticle(id, {
      title,
      slug,
      content,
      excerpt,
      category,
      published,
      featured_image,
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete article
router.delete('/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteArticle(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Categories routes

// Get all categories (optionally filtered by type)
router.get('/categories', async (req, res) => {
  try {
    const { type } = req.query;
    const categories = await getAllCategories(type || null);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get category by ID
router.get('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const category = await getCategoryById(id);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new category
router.post('/categories', async (req, res) => {
  try {
    const { name, slug, type, description, icon, color, sort_order } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ error: 'Missing required fields: name and slug are required' });
    }

    const category = await createCategory({
      name,
      slug,
      type: type || 'blog',
      description,
      icon,
      color,
      sort_order: sort_order || 0,
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update category
router.put('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, type, description, icon, color, sort_order } = req.body;

    const category = await updateCategory(id, {
      name,
      slug,
      type,
      description,
      icon,
      color,
      sort_order,
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete category
router.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteCategory(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------- Taxonomies & Terms --------------------

// List taxonomies
router.get('/taxonomies', async (req, res) => {
  try {
    const rows = await listTaxonomies();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create taxonomy
router.post('/taxonomies', async (req, res) => {
  try {
    const { key, name, description, sort_order } = req.body;
    if (!key || !name) return res.status(400).json({ error: 'key and name are required' });
    const row = await createTaxonomy({ key, name, description, sort_order });
    res.status(201).json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update taxonomy
router.put('/taxonomies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const row = await updateTaxonomy(id, req.body || {});
    res.json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete taxonomy
router.delete('/taxonomies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await deleteTaxonomy(id);
    res.json({ message: 'Taxonomy deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List terms (optionally filtered by taxonomy key)
router.get('/taxonomy-terms', async (req, res) => {
  try {
    const { taxonomy } = req.query;
    const rows = await listTerms(taxonomy || null);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create term
router.post('/taxonomy-terms', async (req, res) => {
  try {
    const { taxonomy_id, name, slug, description, color, sort_order } = req.body;
    if (!taxonomy_id || !name || !slug) return res.status(400).json({ error: 'taxonomy_id, name, slug are required' });
    const row = await createTerm({ taxonomy_id, name, slug, description, color, sort_order });
    res.status(201).json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update term
router.put('/taxonomy-terms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const row = await updateTerm(id, req.body || {});
    res.json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete term
router.delete('/taxonomy-terms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await deleteTerm(id);
    res.json({ message: 'Term deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

