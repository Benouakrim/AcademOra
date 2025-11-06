import express from 'express';
import { authenticateToken, requireAdmin } from './auth.js';
import {
  getAllClaimRequests,
  getClaimRequestById,
  updateClaimRequestStatus,
  updateClaimStatus,
} from '../data/universityClaims.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/admin/university-claims - Get all claim requests
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const requests = await getAllClaimRequests(status || null);
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/university-claims/:id - Get a specific claim request
router.get('/:id', async (req, res) => {
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

// PUT /api/admin/university-claims/:id/status - Update claim request status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }

    const validStatuses = ['pending', 'under_review', 'approved', 'rejected', 'revoked'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
    }

    const updated = await updateClaimRequestStatus(id, status, req.user.userId, admin_notes || null);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/admin/university-claims/claim/:id/status - Update claim status (suspend/revoke)
router.put('/claim/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }

    const validStatuses = ['active', 'suspended', 'revoked'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
    }

    const updated = await updateClaimStatus(id, status);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

