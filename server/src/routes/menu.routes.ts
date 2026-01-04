import { Router } from 'express';
import { getMenu, createMenuItem, updateMenuItem, deleteMenuItem } from '../controllers/menu.controller';
import { authenticateToken, authorizeRole } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getMenu); // Public
router.post('/', authenticateToken, authorizeRole(['OWNER', 'STAFF']), createMenuItem);
router.patch('/:id', authenticateToken, authorizeRole(['OWNER', 'STAFF']), updateMenuItem);
router.delete('/:id', authenticateToken, authorizeRole(['OWNER']), deleteMenuItem);

export default router;
