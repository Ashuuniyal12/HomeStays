import express from 'express';
import { authenticateToken, authorizeRole } from '../middlewares/auth.middleware';
import { createHallBooking, getHallBookings, checkHallAvailability } from '../controllers/hall.controller';

const router = express.Router();

// Public/Staff access to check availability? Let's restrict to authenticated for now.
router.get('/availability', authenticateToken, checkHallAvailability);

// Only Staff/Owner can view and create bookings
router.get('/bookings', authenticateToken, getHallBookings);
router.post('/bookings', authenticateToken, authorizeRole(['OWNER', 'STAFF']), createHallBooking);

export default router;
