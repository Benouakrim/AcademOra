import express from 'express';
import { authenticateToken } from './auth.js';
import { getSavedItems, saveItem, unsaveItem, isItemSaved, getSavedItemsCount } from '../data/savedItems.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/saved-items - Get all saved items for current user
router.get('/', async (req, res) => {
  try {
    const { type } = req.query; // Optional: filter by item_type
    const items = await getSavedItems(req.user.userId, type || null);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/saved-items/count - Get count of saved items
router.get('/count', async (req, res) => {
  try {
    const count = await getSavedItemsCount(req.user.userId);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/saved-items/check/:type/:id - Check if item is saved
router.get('/check/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const saved = await isItemSaved(req.user.userId, type, id);
    res.json({ saved });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/saved-items - Save an item
router.post('/', async (req, res) => {
  try {
    const { item_type, item_id, item_data } = req.body;

    if (!item_type || !item_id) {
      return res.status(400).json({ error: 'item_type and item_id are required' });
    }

    const validTypes = ['article', 'resource', 'university', 'university_group'];
    if (!validTypes.includes(item_type)) {
      return res.status(400).json({ error: `item_type must be one of: ${validTypes.join(', ')}` });
    }

    const saved = await saveItem(req.user.userId, item_type, item_id, item_data || null);
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/saved-items/:type/:id - Unsave an item
router.delete('/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    await unsaveItem(req.user.userId, type, id);
    res.json({ message: 'Item unsaved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

