import { Router } from 'express';
import { getDashboardStats, getReports } from '../controllers/dashboard.controller';
import { authenticateToken, authorizeRole } from '../middlewares/auth.middleware';

const router = Router();

router.get('/stats', authenticateToken, authorizeRole(['OWNER', 'STAFF']), getDashboardStats);
router.get('/reports', authenticateToken, authorizeRole(['OWNER']), getReports);

export default router;
