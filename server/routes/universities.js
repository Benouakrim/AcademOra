import express from 'express';
import { getAllUniversities, getUniversityBySlug } from '../data/universities.js';
import { listMicroContentForUniversity } from '../data/microContent.js';

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

// GET /api/universities/:id/micro-content - micro content for a university
router.get('/:universityId/micro-content', async (req, res) => {
  try {
    const { universityId } = req.params;
    const items = await listMicroContentForUniversity(universityId);
    res.json(items);
  } catch (error) {
    console.error('Micro-content fetch error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch micro-content' });
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

