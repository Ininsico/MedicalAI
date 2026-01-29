
import express from 'express';
import { getNotifications, markRead, markAllRead } from '../controllers/notificationController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getNotifications);
router.put('/:id/read', markRead);
router.put('/read-all', markAllRead);

export default router;
