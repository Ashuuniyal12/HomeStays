import { Router } from 'express';
import { getRooms, createRoom, updateRoomStatus, updateRoom, deleteRoom } from '../controllers/rooms.controller';
import { authenticateToken, authorizeRole } from '../middlewares/auth.middleware';

const router = Router();

// Public? Or protected? Assuming public for view, protected for modify
router.get('/', authenticateToken, getRooms); // Authenticated to see 'mine' or all
router.post('/', authenticateToken, authorizeRole(['OWNER']), createRoom);
router.patch('/:id/status', authenticateToken, updateRoomStatus);
router.put('/:id', authenticateToken, authorizeRole(['OWNER']), updateRoom);
router.delete('/:id', authenticateToken, authorizeRole(['OWNER']), deleteRoom);

export default router;
