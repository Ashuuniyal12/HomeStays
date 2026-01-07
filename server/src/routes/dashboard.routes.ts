import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';
import { authenticateToken, authorizeRole } from '../middlewares/auth.middleware';

const router = Router();

router.get('/stats', authenticateToken, authorizeRole(['OWNER', 'STAFF']), getDashboardStats);

export default router;
