import express from 'express';
import { authenticateToken, authorizeRole } from '../middlewares/auth.middleware';
import { createHallBooking, getHallBookings, checkHallAvailability, getHallGuests, updateHallBookingPayment, updateHallBookingNotes } from '../controllers/hall.controller';

const router = express.Router();

// Public/Staff access to check availability? Let's restrict to authenticated for now.
router.get('/availability', authenticateToken, checkHallAvailability);

// Only Staff/Owner can view and create bookings
router.get('/bookings', authenticateToken, getHallBookings);
router.post('/bookings', authenticateToken, authorizeRole(['OWNER', 'STAFF']), createHallBooking);
router.put('/bookings/:id/payment', authenticateToken, authorizeRole(['OWNER', 'STAFF']), updateHallBookingPayment);
router.put('/bookings/:id/notes', authenticateToken, authorizeRole(['OWNER', 'STAFF']), updateHallBookingNotes);
router.get('/guests', authenticateToken, getHallGuests);

export default router;
