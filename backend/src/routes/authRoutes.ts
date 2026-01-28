import express from 'express';
import { demoLogin } from '../controllers/authController';

const router = express.Router();

// DEMO MODE: Login without email verification
router.post('/demo-login', demoLogin);

export default router;
