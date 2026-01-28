import express from 'express';
import { getLogs, createLog } from '../controllers/logController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getLogs);
router.post('/', createLog);

export default router;
