import express from 'express';
import { parseUserToken, requireUser } from '../middleware/auth.js';
import { getFinancialProfile, upsertFinancialProfile } from '../data/userFinancialProfiles.js';

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

export default router;


