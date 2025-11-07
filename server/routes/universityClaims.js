import express from 'express';
import { parseUserToken, requireUser } from '../middleware/auth.js';
import { createClaimRequest, getClaimRequestById, getClaimRequestsByUser, getClaimByUserId } from '../data/universityClaims.js';

const router = express.Router();

// All routes require authentication
router.use(parseUserToken);
router.use(requireUser);

// POST /api/university-claims/request - Create a claim request
router.post('/request', async (req, res) => {
  try {
    const {
      university_id,
      university_group_id,
      requester_name,
      requester_phone,
      requester_position,
      requester_department,
      organization_name,
      verification_documents,
    } = req.body;

    if (!university_id && !university_group_id) {
      return res.status(400).json({ error: 'Either university_id or university_group_id is required' });
    }

    if (!requester_name) {
      return res.status(400).json({ error: 'requester_name is required' });
    }

    // Set expiration date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const claimRequest = await createClaimRequest({
      university_id: university_id || null,
      university_group_id: university_group_id || null,
      requester_email: req.user.email,
      requester_name,
      requester_phone,
      requester_position,
      requester_department,
      organization_name,
      verification_documents,
      expires_at: expiresAt.toISOString(),
    });

    res.status(201).json(claimRequest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/university-claims/my-requests - Get current user's claim requests
router.get('/my-requests', async (req, res) => {
  try {
    const requests = await getClaimRequestsByUser(req.user.id);
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/university-claims/my-claims - Get current user's approved claims
router.get('/my-claims', async (req, res) => {
  try {
    const claims = await getClaimByUserId(req.user.id);
    res.json(claims);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/university-claims/request/:id - Get a specific claim request
router.get('/request/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const request = await getClaimRequestById(id);
    if (!request) {
      return res.status(404).json({ error: 'Claim request not found' });
    }
    res.json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

