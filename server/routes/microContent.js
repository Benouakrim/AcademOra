import express from 'express';
import { parseUserToken, requireAdmin } from '../middleware/auth.js';
import {
  listAllMicroContent,
  getMicroContentById,
  createMicroContent,
  updateMicroContent,
  deleteMicroContent,
} from '../data/microContent.js';

const router = express.Router();

router.use(parseUserToken);
router.use(requireAdmin);

// List all micro-content (admin)
router.get('/admin/micro-content', async (req, res) => {
  try {
    const items = await listAllMicroContent();
    res.json(items);
  } catch (err) {
    console.error('List micro-content error:', err);
    res.status(500).json({ error: err?.message || 'Failed to list micro-content' });
  }
});

// Fetch single micro-content item
router.get('/micro-content/:id', async (req, res) => {
  try {
    const item = await getMicroContentById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Micro-content not found' });
    }
    res.json(item);
  } catch (err) {
    console.error('Get micro-content error:', err);
    res.status(500).json({ error: err?.message || 'Failed to fetch micro-content' });
  }
});

// Create micro-content
router.post('/micro-content', async (req, res) => {
  try {
    const payload = req.body || {};
    if (!payload.university_id || !payload.content_type || !payload.title || !payload.content) {
      return res.status(400).json({ error: 'Missing required fields: university_id, content_type, title, content' });
    }
    payload.created_by = req.user?.id;
    const item = await createMicroContent(payload);
    res.status(201).json(item);
  } catch (err) {
    console.error('Create micro-content error:', err);
    res.status(500).json({ error: err?.message || 'Failed to create micro-content' });
  }
});

// Update micro-content
router.put('/micro-content/:id', async (req, res) => {
  try {
    const item = await updateMicroContent(req.params.id, req.body || {});
    if (!item) {
      return res.status(404).json({ error: 'Micro-content not found' });
    }
    res.json(item);
  } catch (err) {
    console.error('Update micro-content error:', err);
    res.status(500).json({ error: err?.message || 'Failed to update micro-content' });
  }
});

// Delete micro-content
router.delete('/micro-content/:id', async (req, res) => {
  try {
    await deleteMicroContent(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete micro-content error:', err);
    res.status(500).json({ error: err?.message || 'Failed to delete micro-content' });
  }
});

export default router;

