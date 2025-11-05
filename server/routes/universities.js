import express from 'express';
import { getAllUniversities, getUniversityBySlug } from '../data/universities.js';

const router = express.Router();

// GET /api/universities - Get all universities (public)
router.get('/', async (req, res) => {
  try {
    const universities = await getAllUniversities();
    res.json(universities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/universities/:slug - Get a single university by slug (public)
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const university = await getUniversityBySlug(slug);
    if (!university) {
      return res.status(404).json({ error: 'University not found' });
    }
    res.json(university);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

