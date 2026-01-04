import { Router } from 'express';
import { createOrder, updateOrderStatus, getKitchenOrders, getMyOrders } from '../controllers/orders.controller';
import { authenticateToken, authorizeRole } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', createOrder); // Guest or Staff
router.patch('/:id/status', authenticateToken, authorizeRole(['OWNER', 'STAFF']), updateOrderStatus);
router.get('/', authenticateToken, authorizeRole(['OWNER', 'STAFF']), getKitchenOrders);
router.get('/my-orders', getMyOrders); // Public or Guest protected (using query param for now)

export default router;
