import express from 'express';
import { parseUserToken, requireAdmin } from '../middleware/auth.js';
import {
  getAllUniversities,
  getUniversityById,
  createUniversity,
  updateUniversity,
  deleteUniversity,
} from '../data/universities.js';

const router = express.Router();

// All routes in this file are protected and require admin
router.use(parseUserToken);
router.use(requireAdmin);

// GET /api/admin/universities - Get all universities
router.get('/', async (req, res) => {
  try {
    const universities = await getAllUniversities();
    res.json(universities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/universities/:id - Get a single university by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const university = await getUniversityById(id);
    if (!university) {
      return res.status(404).json({ error: 'University not found' });
    }
    res.json(university);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/universities - Create a new university
router.post('/', async (req, res) => {
  try {
    const university = await createUniversity(req.body);
    res.status(201).json(university);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/admin/universities/:id - Update an existing university
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const university = await updateUniversity(id, req.body);
    if (!university) {
      return res.status(404).json({ error: 'University not found' });
    }
    res.json(university);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/admin/universities/:id - Delete a university
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const success = await deleteUniversity(id);
    if (!success) {
      return res.status(404).json({ error: 'University not found' });
    }
    res.json({ message: 'University deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
