import express from 'express';
import { parseUserToken, requireUser } from '../middleware/auth.js';
import { getFinancialProfile, upsertFinancialProfile } from '../data/userFinancialProfiles.js';
import { getUniversityById } from '../data/universities.js';
import { predictFinancialAid, predictFinancialAidBatch } from '../services/financialAidPredictor.js';

const router = express.Router();

router.use(parseUserToken);
router.use(requireUser);

router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id;

    const profile = await getFinancialProfile(userId);
    const result = profile || {
      user_id: userId,
      gpa: null,
      sat_score: null,
      act_score: null,
      family_income: null,
      international_student: null,
      in_state: null,
      first_generation: null,
      special_talents: [],
      created_at: null,
      updated_at: null,
    };

    res.json({
      ...result,
      is_complete: Boolean(
        result.gpa !== null &&
        result.family_income !== null &&
        result.international_student !== null &&
        result.in_state !== null
      ),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const userId = req.user?.id;

    const updated = await upsertFinancialProfile(userId, req.body || {});

    res.json({
      ...updated,
      is_complete: Boolean(
        updated.gpa !== null &&
        updated.family_income !== null &&
        updated.international_student !== null &&
        updated.in_state !== null
      ),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/profile/financial/predict
// Predict financial aid for a single university
router.post('/predict', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { university_id, university_data } = req.body;

    // Get user's financial profile
    const userProfile = await getFinancialProfile(userId);
    
    if (!userProfile) {
      return res.status(400).json({ 
        error: 'Financial profile not found. Please complete your profile first.' 
      });
    }

    // Get university data - either from request body or database
    let university;
    if (university_data) {
      university = university_data;
    } else if (university_id) {
      university = await getUniversityById(university_id);
      if (!university) {
        return res.status(404).json({ error: 'University not found' });
      }
    } else {
      return res.status(400).json({ 
        error: 'Either university_id or university_data must be provided' 
      });
    }

    // Run prediction
    const prediction = predictFinancialAid(university, userProfile);

    res.json({
      success: true,
      university_id: university.id,
      university_name: university.name,
      prediction,
      user_profile_used: {
        gpa: userProfile.gpa,
        sat_score: userProfile.sat_score,
        act_score: userProfile.act_score,
        family_income: userProfile.family_income ? '[redacted]' : null,
        international_student: userProfile.international_student,
        in_state: userProfile.in_state,
        first_generation: userProfile.first_generation,
      },
    });
  } catch (error) {
    console.error('Financial aid prediction error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/profile/financial/predict-batch
// Predict financial aid for multiple universities
router.post('/predict-batch', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { university_ids } = req.body;

    if (!university_ids || !Array.isArray(university_ids) || university_ids.length === 0) {
      return res.status(400).json({ 
        error: 'university_ids array is required and must not be empty' 
      });
    }

    // Limit batch size to prevent abuse
    if (university_ids.length > 20) {
      return res.status(400).json({ 
        error: 'Maximum 20 universities per batch request' 
      });
    }

    // Get user's financial profile
    const userProfile = await getFinancialProfile(userId);
    
    if (!userProfile) {
      return res.status(400).json({ 
        error: 'Financial profile not found. Please complete your profile first.' 
      });
    }

    // Fetch all universities
    const universities = await Promise.all(
      university_ids.map(id => getUniversityById(id))
    );

    // Filter out any nulls (universities not found)
    const validUniversities = universities.filter(u => u !== null);

    if (validUniversities.length === 0) {
      return res.status(404).json({ error: 'No valid universities found' });
    }

    // Run batch prediction
    const predictions = predictFinancialAidBatch(validUniversities, userProfile);

    res.json({
      success: true,
      predictions,
      count: predictions.length,
    });
  } catch (error) {
    console.error('Batch financial aid prediction error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;


