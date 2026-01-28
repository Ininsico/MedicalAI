import express from 'express';
import { getProfile, updateProfile } from '../controllers/profileController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getProfile);
router.put('/', updateProfile);

export default router;
