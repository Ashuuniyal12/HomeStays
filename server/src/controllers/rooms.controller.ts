import { Request, Response } from 'express';
// Trigger restart after prisma generate 
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../prisma';

export const getRooms = async (req: AuthRequest, res: Response) => {
    try {
        const { mine, startDate, endDate } = req.query;
        let where: any = {};

        if (mine === 'true' && req.user) {
            where.ownerId = req.user.id;
        }

        let include: any = {
            bookings: {
                where: { status: 'ACTIVE' } // Default to active? Or all?
            }
        };

        // If date range provided, filter bookings?
        // Prisma include filtering is simple. For Gantt, we might need all bookings or overlapping ones.
        // For now, let's just fetch all bookings for the room and filter in frontend or improve query later.

        const rooms = await prisma.room.findMany({
            where,
            orderBy: { number: 'asc' },
            include: { bookings: true }
        });
        res.json(rooms);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch rooms' });
    }
};

export const createRoom = async (req: AuthRequest, res: Response) => {
    const { number, type, description, occupancy, price } = req.body;

    if (!number || !type || !occupancy || !price) {
        return res.status(400).json({ error: 'Missing required fields', details: 'Number, Type, Occupancy and Price are required' });
    }

    const occInt = parseInt(occupancy);
    const priceFloat = parseFloat(price);

    if (isNaN(occInt) || isNaN(priceFloat)) {
        return res.status(400).json({ error: 'Invalid number format', details: 'Occupancy must be integer and Price must be number' });
    }

    try {
        const ownerId = req.user?.id;
        const room = await prisma.room.create({
            data: {
                number, type, description, occupancy: occInt, price: priceFloat,
                status: 'AVAILABLE',
                ownerId // Save the creator
            } as any
        });
        res.json(room);
    } catch (err: any) {
        console.error('Create Room Error:', err);
        res.status(400).json({ error: 'Room creation failed', details: err.message });
    }
};

export const updateRoomStatus = async (req: Request, res: Response) => {
    const { status } = req.body;
    try {
        const room = await prisma.room.update({
            where: { id: parseInt(req.params.id) },
            data: { status }
        });
        res.json(room);
    } catch (err) {
        res.status(400).json({ error: 'Update failed' });
    }
};

export const updateRoom = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { number, type, description, occupancy, price, status, hasBalcony, bathroomCount, isAC } = req.body;

    try {
        const existing = await prisma.room.findUnique({ where: { id: parseInt(id) } });
        if (!existing) return res.status(404).json({ error: 'Room not found' });

        if ((existing as any).ownerId && (existing as any).ownerId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to edit this room' });
        }

        const room = await prisma.room.update({
            where: { id: parseInt(id) },
            data: {
                number, type, description, status,
                occupancy: parseInt(occupancy),
                price: parseFloat(price),
                hasBalcony: hasBalcony !== undefined ? Boolean(hasBalcony) : undefined,
                bathroomCount: bathroomCount ? parseInt(bathroomCount) : undefined,
                isAC: isAC !== undefined ? Boolean(isAC) : undefined
            } as any
        });
        res.json(room);
    } catch (err) {
        res.status(500).json({ error: 'Update failed' });
    }
};

export const deleteRoom = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
        const existing = await prisma.room.findUnique({ where: { id: parseInt(id) } });
        if (!existing) return res.status(404).json({ error: 'Room not found' });

        if ((existing as any).ownerId && (existing as any).ownerId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized to delete this room' });
        }

        await prisma.room.delete({ where: { id: parseInt(id) } });
        res.json({ message: 'Room deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Delete failed' });
    }
};
