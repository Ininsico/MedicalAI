
import express from 'express';
import {
    getDashboard,
    getPatientLogs,
    getLogDetails,
    getPatientDetails,
    generatePatientReport,
    sendInvitation,
    getPatientInvitations,
    cancelInvitation,
    verifyInvitationToken,
    acceptInvitation
} from '../controllers/caregiverController';
import { authenticateToken, authorizeCaregiver, authorizePatient, checkCaregiverAccess } from '../middleware/authMiddleware';

const router = express.Router();

// Public routes (no auth required)
router.get('/verify-invitation/:token', verifyInvitationToken);
router.post('/accept-invitation', acceptInvitation);

// Patient-only routes (for managing caregiver invitations)
router.use('/invite', authenticateToken, authorizePatient);
router.post('/invite', sendInvitation);
router.get('/invitations', authenticateToken, authorizePatient, getPatientInvitations);
router.delete('/invitations/:invitationId', authenticateToken, authorizePatient, cancelInvitation);

// Caregiver-only routes
router.use(authenticateToken, authorizeCaregiver);
router.get('/dashboard', getDashboard);
router.get('/patients/:patientId/logs', checkCaregiverAccess, getPatientLogs);
router.get('/patients/:patientId/logs/:logId', checkCaregiverAccess, getLogDetails);
router.get('/patients/:patientId', checkCaregiverAccess, getPatientDetails);
router.get('/patients/:patientId/report', checkCaregiverAccess, generatePatientReport);

export default router;
