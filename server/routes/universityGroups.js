import express from 'express';
import {
  getAllGroups,
  getGroupById,
  getGroupBySlug,
  getGroupWithUniversities,
  getGroupWithUniversitiesBySlug,
} from '../data/universityGroups.js';

const router = express.Router();

// GET /api/university-groups - Get all groups (public)
router.get('/', async (req, res) => {
  try {
    const groups = await getAllGroups();
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/university-groups/:slug - Get a single group by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const group = await getGroupWithUniversitiesBySlug(slug);
    if (!group) {
      return res.status(404).json({ error: 'University group not found' });
    }
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

