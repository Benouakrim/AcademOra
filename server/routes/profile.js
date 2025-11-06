import express from 'express';
import { authenticateToken } from './auth.js';
import { updateUserProfile, updatePasswordById, getUserProfile } from '../data/users.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/profile - Get current user profile
router.get('/', async (req, res) => {
  try {
    const profile = await getUserProfile(req.user.userId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/profile - Update user profile
router.put('/', async (req, res) => {
  try {
    const { email, full_name, phone, bio, avatar_url, subscription_status, subscription_expires_at } = req.body;
    
    const updates = {};
    if (email !== undefined) updates.email = email;
    if (full_name !== undefined) updates.full_name = full_name;
    if (phone !== undefined) updates.phone = phone;
    if (bio !== undefined) updates.bio = bio;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    if (subscription_status !== undefined) updates.subscription_status = subscription_status;
    if (subscription_expires_at !== undefined) updates.subscription_expires_at = subscription_expires_at;

    const updated = await updateUserProfile(req.user.userId, updates);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/profile/password - Update password
router.put('/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const updated = await updatePasswordById(req.user.userId, currentPassword, newPassword);
    res.json({ message: 'Password updated successfully', user: updated });
  } catch (error) {
    if (error.message === 'Current password is incorrect') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;

