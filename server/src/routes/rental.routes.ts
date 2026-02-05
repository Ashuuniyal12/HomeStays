import { Router } from 'express';
import * as items from '../controllers/rentalItems.controller';
import * as customers from '../controllers/rentalCustomers.controller';
import * as orders from '../controllers/rentalOrders.controller';

const router = Router();

// --- RENTAL ITEMS ---
router.post('/items', items.createItem);
router.get('/items', items.getAllItems);
router.put('/items/:id', items.updateItem);
router.delete('/items/:id', items.deleteItem);
router.get('/items/availability', items.checkAvailability); // ?eventDate=X&returnDate=Y

// --- RENTAL CUSTOMERS ---
router.post('/customers', customers.createCustomer);
router.get('/customers', customers.getAllCustomers);
router.get('/customers/search', customers.searchCustomers); // ?q=...

// --- RENTAL ORDERS ---
router.post('/orders', orders.createOrder);
router.get('/orders', orders.getOrders); // ?status=...
router.get('/orders/stats', orders.getStats);
router.get('/orders/:id', orders.getOrderDetails);
router.put('/orders/:id/status', orders.updateStatus);
router.put('/orders/:id/payment', orders.updatePayment);

export default router;
