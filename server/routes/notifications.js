import express from 'express';
import { authenticateToken } from './auth.js';
import {
  listNotificationsByUser,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '../data/notifications.js';

const router = express.Router();

// List notifications for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const items = await listNotificationsByUser(userId);
    res.json(items);
  } catch (err) {
    console.error('List notifications error:', err);
    res.status(500).json({ error: err?.message || 'Failed to list notifications' });
  }
});

// Unread count
router.get('/unread/count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const count = await getUnreadCount(userId);
    res.json({ count });
  } catch (err) {
    console.error('Unread count error:', err);
    res.status(500).json({ error: err?.message || 'Failed to get unread count' });
  }
});

// Mark one as read
router.post('/:id/read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const id = req.params.id;
    const notification = await markNotificationRead(userId, id);
    res.json(notification);
  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).json({ error: err?.message || 'Failed to mark as read' });
  }
});

// Mark all as read
router.post('/read-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    await markAllNotificationsRead(userId);
    res.json({ success: true });
  } catch (err) {
    console.error('Mark all read error:', err);
    res.status(500).json({ error: err?.message || 'Failed to mark all as read' });
  }
});

export default router;


