import express from 'express';
import { generatePatientSummary } from '../controllers/aiController';

const router = express.Router();

router.post('/summary', generatePatientSummary);

export default router;
