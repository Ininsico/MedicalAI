
import express from 'express';
import {
    getDashboard,
    getPatientLogs,
    getLogDetails,
    getPatientDetails,
    generatePatientReport
} from '../controllers/caregiverController';
import { authenticateToken, authorizeCaregiver, checkCaregiverAccess } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authenticateToken, authorizeCaregiver);

router.get('/dashboard', getDashboard);
router.get('/patients/:patientId/logs', checkCaregiverAccess, getPatientLogs);
router.get('/patients/:patientId/logs/:logId', checkCaregiverAccess, getLogDetails);
router.get('/patients/:patientId', checkCaregiverAccess, getPatientDetails);
router.get('/patients/:patientId/report', checkCaregiverAccess, generatePatientReport);

export default router;
