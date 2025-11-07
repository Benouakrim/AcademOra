import express from 'express';
import { parseUserToken, requireAdmin } from '../middleware/auth.js';
import {
  getAllGroups,
  getGroupById,
  getGroupBySlug,
  createGroup,
  updateGroup,
  deleteGroup,
} from '../data/universityGroups.js';

const router = express.Router();

// All routes in this file are protected and require admin
router.use(parseUserToken);
router.use(requireAdmin);

// GET /api/admin/university-groups - Get all groups
router.get('/', async (req, res) => {
  try {
    const groups = await getAllGroups();
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/university-groups/:id - Get a single group by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const group = await getGroupById(id);
    if (!group) {
      return res.status(404).json({ error: 'University group not found' });
    }
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/university-groups - Create a new group
router.post('/', async (req, res) => {
  try {
    const group = await createGroup(req.body);
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/admin/university-groups/:id - Update an existing group
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const group = await updateGroup(id, req.body);
    if (!group) {
      return res.status(404).json({ error: 'University group not found' });
    }
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/admin/university-groups/:id - Delete a group
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const success = await deleteGroup(id);
    if (!success) {
      return res.status(404).json({ error: 'University group not found' });
    }
    res.json({ message: 'University group deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

