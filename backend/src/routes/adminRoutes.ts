
import express from 'express';
import {
    createPatient,
    getAllPatients,
    getPatientById,
    updatePatient,
    deletePatient,
    assignCaregiver,
    getAllAssignments,
    removeAssignment,
    getAllCaregivers,
    createCaregiver
} from '../controllers/adminController';
import { getSystemHealth, getAuditLogs, setupDatabase } from '../controllers/systemController';
import { authenticateToken, authorizeAdmin } from '../middleware/authMiddleware';

const router = express.Router();

// Apply admin auth middleware to all routes
router.use(authenticateToken, authorizeAdmin);

// Patient Management
router.post('/patients', createPatient);
router.get('/patients', getAllPatients);
router.get('/patients/:id', getPatientById);
router.put('/patients/:id', updatePatient);
router.delete('/patients/:id', deletePatient);

// Caregiver Assignments & Management
router.post('/assign-caregiver', assignCaregiver);
router.get('/assignments', getAllAssignments);
router.delete('/assignments/:id', removeAssignment);
router.get('/caregivers', getAllCaregivers);
router.post('/caregivers', createCaregiver);

// System Management
router.get('/system/health', getSystemHealth);
router.get('/audit-logs', getAuditLogs);
router.post('/setup-database', setupDatabase);

export default router;
