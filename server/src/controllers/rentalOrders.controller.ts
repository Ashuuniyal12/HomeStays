import { Request, Response } from 'express';
import prisma from '../prisma';

interface OrderItemInput {
    id: number;
    quantity: number;
    price: number;
}

interface CreateOrderBody {
    customerId: string;
    eventDate: string;
    returnDate?: string;
    location: string;
    items: OrderItemInput[];
    advanceAmount?: number;
    securityDeposit?: number;
    notes?: string;
}

// CREATE ORDER
export const createOrder = async (req: Request<{}, {}, CreateOrderBody>, res: Response) => {
    const { customerId, eventDate, returnDate, location, items, advanceAmount, securityDeposit, notes } = req.body;
    // items: [{ id: 1, quantity: 5, price: 100 }]

    if (!customerId || !eventDate || !location || !items || items.length === 0) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const startDate = new Date(eventDate);
        const endDate = returnDate ? new Date(returnDate) : new Date(startDate); // Default return date to same day if missing

        // If return date is missing or same as start, maybe set it to end of day? 
        // For logic simplicity, let's just ensure endDate >= startDate
        if (endDate < startDate) {
            return res.status(400).json({ error: 'Return date cannot be before event date' });
        }

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return res.status(400).json({ error: 'Invalid date format' });
        }

        // 1. Verify Stock Logic (Double-check before committing)
        const overlappingOrders = await prisma.rentalOrder.findMany({
            where: {
                status: { in: ['BOOKED', 'OUT'] },
                AND: [
                    { eventDate: { lt: endDate } },
                    { returnDate: { gt: startDate } }
                ]
            },
            include: { items: true }
        });

        const usageMap: Record<number, number> = {};
        overlappingOrders.forEach((o: any) => {
            o.items.forEach((oi: any) => {
                usageMap[oi.rentalItemId] = (usageMap[oi.rentalItemId] || 0) + oi.quantity;
            });
        });

        // 2. Check each requested item
        for (const reqItem of items) {
            const dbItem = await prisma.rentalItem.findUnique({ where: { id: reqItem.id } });
            if (!dbItem) {
                return res.status(400).json({ error: `Item ${reqItem.id} not found` });
            }

            const used = usageMap[reqItem.id] || 0;
            const available = dbItem.totalQty - used;

            if (reqItem.quantity > available) {
                return res.status(400).json({
                    error: `Insufficient stock for ${dbItem.name}. Requested: ${reqItem.quantity}, Available: ${available}`
                });
            }
        }

        // 3. Create Order
        const totalAmount = items.reduce((sum: number, i: OrderItemInput) => sum + (i.price * i.quantity), 0);

        const order = await prisma.rentalOrder.create({
            data: {
                customerId,
                eventDate: startDate,
                returnDate: endDate,
                location,
                status: 'BOOKED',
                totalAmount,
                advanceAmount: Number(advanceAmount || 0),
                securityDeposit: Number(securityDeposit || 0),
                notes,
                items: {
                    create: items.map((i: OrderItemInput) => ({
                        rentalItemId: i.id,
                        quantity: i.quantity,
                        price: i.price
                    }))
                }
            },
            include: { items: true }
        });

        res.json(order);

    } catch (err: any) {
        console.error("Create Order Error:", err);
        res.status(500).json({ error: err.message || 'Order creation failed' });
    }
};

// GET ORDERS
export const getOrders = async (req: Request, res: Response) => {
    const { status } = req.query;
    try {
        const where: any = {};
        if (status) where.status = status;

        const orders = await prisma.rentalOrder.findMany({
            where,
            include: { customer: true, items: { include: { item: true } } },
            orderBy: { eventDate: 'desc' },
            take: 50
        });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Fetch failed' });
    }
};

// GET DETAILS
export const getOrderDetails = async (req: Request, res: Response) => {
    try {
        const order = await prisma.rentalOrder.findUnique({
            where: { id: req.params.id },
            include: { customer: true, items: { include: { item: true } } }
        });
        if (!order) return res.status(404).json({ error: 'Not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: 'Fetch failed' });
    }
};

// UPDATE STATUS
export const updateStatus = async (req: Request, res: Response) => {
    const { status } = req.body; // BOOKED -> OUT -> RETURNED -> CANCELLED
    try {
        const order = await prisma.rentalOrder.update({
            where: { id: req.params.id },
            data: { status }
        });
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: 'Update failed' });
    }
};

// UPDATE PAYMENT
export const updatePayment = async (req: Request, res: Response) => {
    const { paidAmount } = req.body;
    if (paidAmount === undefined || paidAmount === null) {
        return res.status(400).json({ error: 'Paid amount is required' });
    }

    try {
        const order = await prisma.rentalOrder.update({
            where: { id: req.params.id },
            data: { paidAmount: parseFloat(paidAmount) }
        });
        res.json(order);
    } catch (err) {
        console.error("Update Payment Error:", err);
        res.status(500).json({ error: 'Payment update failed' });
    }
};


// STATS
export const getStats = async (req: Request, res: Response) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const monthlyRevenue = await prisma.rentalOrder.aggregate({
            where: {
                status: { not: 'CANCELLED' },
                eventDate: { gte: startOfMonth }
            },
            _sum: { totalAmount: true }
        });

        const activeRentals = await prisma.rentalOrder.count({
            where: { status: 'OUT' }
        });

        const dueReturns = await prisma.rentalOrder.findMany({
            where: {
                status: 'OUT',
                returnDate: { lte: now }
            },
            include: { customer: true }
        });

        res.json({
            revenue: monthlyRevenue._sum.totalAmount || 0,
            active: activeRentals,
            due: dueReturns
        });
    } catch (err) {
        res.status(500).json({ error: 'Stats failed' });
    }
};
