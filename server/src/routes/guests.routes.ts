import { Router } from 'express';
import { getGuests, getGuestById } from '../controllers/guests.controller';
import { authenticateToken, authorizeRole } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateToken, authorizeRole(['ADMIN', 'OWNER']), getGuests);
router.get('/:id', authenticateToken, authorizeRole(['ADMIN', 'OWNER']), getGuestById);

export default router;
