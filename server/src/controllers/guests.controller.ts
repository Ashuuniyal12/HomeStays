import { Request, Response } from 'express';
import prisma from '../prisma';

export const getGuests = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 15;
        const skip = (page - 1) * limit;

        const [guests, total] = await prisma.$transaction([
            prisma.user.findMany({
                where: { role: 'GUEST' },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    bookings: {
                        take: 1,
                        orderBy: { checkIn: 'desc' },
                        select: { checkIn: true, checkOut: true }
                    }
                }
            }),
            prisma.user.count({ where: { role: 'GUEST' } })
        ]);

        res.json({
            guests,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (err) {
        console.error('Get Guests Error:', err);
        res.status(500).json({ error: 'Failed to fetch guests' });
    }
};

export const getGuestById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const guest = await prisma.user.findUnique({
            where: { id },
            include: {
                bookings: {
                    include: { room: true },
                    orderBy: { checkIn: 'desc' }
                }
            }
        });

        if (!guest || guest.role !== 'GUEST') {
            return res.status(404).json({ error: 'Guest not found' });
        }

        res.json(guest);
    } catch (err) {
        console.error('Get Guest Detail Error:', err);
        res.status(500).json({ error: 'Failed to fetch guest details' });
    }
};
