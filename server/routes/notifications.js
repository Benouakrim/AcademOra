import express from 'express';
import { parseUserToken, requireUser } from '../middleware/auth.js';
import {
  listNotificationsByUser,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '../data/notifications.js';

const router = express.Router();

router.use(parseUserToken);
router.use(requireUser);

// List notifications for current user
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id;
    const items = await listNotificationsByUser(userId);
    res.json(items);
  } catch (err) {
    console.error('List notifications error:', err);
    res.status(500).json({ error: err?.message || 'Failed to list notifications' });
  }
});

// Unread count
router.get('/unread/count', async (req, res) => {
  try {
    const userId = req.user?.id;
    const count = await getUnreadCount(userId);
    res.json({ count });
  } catch (err) {
    console.error('Unread count error:', err);
    res.status(500).json({ error: err?.message || 'Failed to get unread count' });
  }
});

// Mark one as read
router.post('/:id/read', async (req, res) => {
  try {
    const userId = req.user?.id;
    const id = req.params.id;
    const notification = await markNotificationRead(userId, id);
    res.json(notification);
  } catch (err) {
    console.error('Mark read error:', err);
    res.status(500).json({ error: err?.message || 'Failed to mark as read' });
  }
});

// Mark all as read
router.post('/read-all', async (req, res) => {
  try {
    const userId = req.user?.id;
    await markAllNotificationsRead(userId);
    res.json({ success: true });
  } catch (err) {
    console.error('Mark all read error:', err);
    res.status(500).json({ error: err?.message || 'Failed to mark all as read' });
  }
});

export default router;


