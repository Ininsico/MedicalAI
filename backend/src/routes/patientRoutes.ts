
import express from 'express';
import { createDailyLog, getDailyLogs, getCaregivers, updateDailyLog } from '../controllers/patientController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/:patientId/logs', authenticateToken, createDailyLog);
router.put('/:patientId/logs/:logId', authenticateToken, updateDailyLog);
router.get('/:patientId/logs', authenticateToken, getDailyLogs);
router.get('/:patientId/caregivers', authenticateToken, getCaregivers);

export default router;
