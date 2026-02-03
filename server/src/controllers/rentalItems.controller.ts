import { Request, Response } from 'express';
import prisma from '../prisma';

// CREATE ITEM
// CREATE ITEM
export const createItem = async (req: Request, res: Response) => {
    const { name, price, totalQty, category } = req.body;

    if (!name || !price || !totalQty || !category) {
        return res.status(400).json({ error: 'Name, Price, Category and Total Qty are required' });
    }

    try {
        const item = await prisma.rentalItem.create({ data: req.body });
        res.json(item);
    } catch (err) {
        console.error("Create Item Error:", err);
        res.status(500).json({ error: 'Failed to create item' });
    }
};

// GET ALL ITEMS
export const getAllItems = async (req: Request, res: Response) => {
    try {
        const items = await prisma.rentalItem.findMany({ orderBy: { name: 'asc' } });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch items' });
    }
};

// UPDATE ITEM
export const updateItem = async (req: Request, res: Response) => {
    try {
        const item = await prisma.rentalItem.update({
            where: { id: parseInt(req.params.id) },
            data: req.body
        });
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update item' });
    }
};

// DELETE ITEM
export const deleteItem = async (req: Request, res: Response) => {
    try {
        // Soft delete or check for existing orders? 
        // For now, strict existing orders check
        const inUse = await prisma.rentalOrderItem.findFirst({
            where: { rentalItemId: parseInt(req.params.id) }
        });

        if (inUse) {
            // Soft delete by marking unavailable
            await prisma.rentalItem.update({
                where: { id: parseInt(req.params.id) },
                data: { available: false }
            });
            return res.json({ msg: 'Item marked unavailable (has history)' });
        }

        await prisma.rentalItem.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ msg: 'Item deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete item' });
    }
};

// CHECK AVAILABILITY
export const checkAvailability = async (req: Request, res: Response) => {
    const { start, end, eventDate: eDateParam, returnDate: rDateParam } = req.query; // ISO Date Strings

    // Normalize inputs
    const startInput = eDateParam || start;
    const endInput = rDateParam || end;

    if (!startInput) return res.status(400).json({ error: 'Event Date is required' });

    const startDate = new Date(String(startInput));
    const endDate = endInput ? new Date(String(endInput)) : new Date(startDate); // Default to same day if no return date

    // Ensure valid dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({ error: 'Invalid Date Format' });
    }

    try {
        const allItems = await prisma.rentalItem.findMany({ where: { available: true } });

        // Find BOOKED or OUT orders that overlap with this range
        // Overlap logic: (StartA <= EndB) and (EndA >= StartB)
        const overlappingOrders = await prisma.rentalOrder.findMany({
            where: {
                status: { in: ['BOOKED', 'OUT'] },
                AND: [
                    { eventDate: { lte: endDate } },
                    { returnDate: { gte: startDate } }
                ]
            },
            include: { items: true }
        });

        // Calculate used qty per item
        const usageMap: Record<number, number> = {};
        overlappingOrders.forEach((order: any) => {
            order.items.forEach((orderItem: any) => {
                usageMap[orderItem.rentalItemId] = (usageMap[orderItem.rentalItemId] || 0) + orderItem.quantity;
            });
        });

        // Compute available qty
        const availability = allItems.map((item: any) => ({
            ...item,
            availableQty: Math.max(0, item.totalQty - (usageMap[item.id] || 0))
        }));

        res.json(availability);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Availability check failed' });
    }
};
