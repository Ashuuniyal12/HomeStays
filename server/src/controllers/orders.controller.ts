import { Request, Response } from 'express';
import prisma from '../prisma';
import { io } from '../index';

export const createOrder = async (req: Request, res: Response) => {
    const { bookingId, items } = req.body; // items: [{ menuItemId, quantity }]

    try {
        // Calculate total
        let total = 0;
        const orderItemsData = [];

        for (const item of items) {
            const menuItem = await prisma.menuItem.findUnique({ where: { id: item.menuItemId } });
            if (menuItem) {
                total += menuItem.price * item.quantity;
                orderItemsData.push({
                    menuItemId: item.menuItemId,
                    quantity: item.quantity,
                    price: menuItem.price
                });
            }
        }

        const order = await prisma.order.create({
            data: {
                bookingId,
                status: 'PENDING',
                total,
                items: {
                    create: orderItemsData
                }
            },
            include: { items: { include: { menuItem: true } }, booking: { include: { room: true } } }
        });

        // Notify Kitchen/Admin
        io.emit('order:new', order);

        // Notify Guest (for real-time dashboard update)
        io.emit(`order:${bookingId}`, order);

        res.json(order);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Order failed' });
    }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
    const { status } = req.body;
    try {
        const order = await prisma.order.update({
            where: { id: req.params.id },
            data: { status },
            include: {
                items: { include: { menuItem: true } },
                booking: { include: { room: true } }
            }
        });

        // Notify Guest
        io.emit(`order:${order.bookingId}`, order);

        res.json(order);
    } catch (err) {
        res.status(400).json({ error: 'Update failed' });
    }
};

export const getKitchenOrders = async (req: Request, res: Response) => {
    try {
        const orders = await prisma.order.findMany({
            where: { status: { not: 'DELIVERED' } },
            include: {
                items: { include: { menuItem: true } },
                booking: { include: { room: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Fetch failed' });
    }
};

export const getMyOrders = async (req: Request, res: Response) => {
    const { bookingId } = req.query;
    if (!bookingId) return res.status(400).json({ error: 'Booking ID required' });

    try {
        const orders = await prisma.order.findMany({
            where: { bookingId: String(bookingId) },
            include: {
                items: { include: { menuItem: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Fetch failed' });
    }
};
