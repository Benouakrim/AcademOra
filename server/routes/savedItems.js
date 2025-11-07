import express from 'express';
import { parseUserToken, requireUser } from '../middleware/auth.js';
import { getSavedItems, saveItem, unsaveItem, isItemSaved, getSavedItemsCount } from '../data/savedItems.js';
import { checkFeatureAccess, logUsage } from '../middleware/accessControl.js';

const router = express.Router();

// All routes require authentication
router.use(parseUserToken);
router.use(requireUser);

// GET /api/saved-items - Get all saved items for current user
router.get('/', async (req, res) => {
  try {
    const { type } = req.query; // Optional: filter by item_type
    const items = await getSavedItems(req.user.id, type || null);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/saved-items/count - Get count of saved items
router.get('/count', async (req, res) => {
  try {
    const count = await getSavedItemsCount(req.user.id);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/saved-items/check/:type/:id - Check if item is saved
router.get('/check/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const saved = await isItemSaved(req.user.id, type, id);
    res.json({ saved });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/saved-items - Save an item
router.post(
  '/',
  checkFeatureAccess('save-item'),
  logUsage('save-item'),
  async (req, res) => {
  try {
    const { item_type, item_id, item_data } = req.body;

    if (!item_type || !item_id) {
      return res.status(400).json({ error: 'item_type and item_id are required' });
    }

    const validTypes = ['article', 'resource', 'university', 'university_group'];
    if (!validTypes.includes(item_type)) {
      return res.status(400).json({ error: `item_type must be one of: ${validTypes.join(', ')}` });
    }
    const saved = await saveItem(req.user.id, item_type, item_id, item_data || null);
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
  }
);

// DELETE /api/saved-items/:type/:id - Unsave an item
router.delete('/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    await unsaveItem(req.user.id, type, id);
    res.json({ message: 'Item unsaved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

