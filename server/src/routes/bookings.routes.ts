import { Router } from 'express';
import { createBooking, getActiveBookings, getPastBookings, getMyBooking, checkout, getBill, getEarnings, searchGuest } from '../controllers/bookings.controller';
import { authenticateToken, authorizeRole } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticateToken, authorizeRole(['OWNER', 'STAFF']), createBooking);
router.get('/active', authenticateToken, authorizeRole(['OWNER', 'STAFF']), getActiveBookings);
router.get('/history', authenticateToken, authorizeRole(['OWNER', 'STAFF']), getPastBookings);
router.get('/earnings', authenticateToken, authorizeRole(['OWNER']), getEarnings); // Owner only
router.get('/my-booking', authenticateToken, getMyBooking);
router.post('/:id/checkout', authenticateToken, authorizeRole(['OWNER', 'STAFF']), checkout);
// New Route
router.get('/search-guest', authenticateToken, authorizeRole(['OWNER', 'STAFF']), searchGuest);
router.get('/:id/bill', authenticateToken, getBill); // Guest or Staff can view bill

export default router;
