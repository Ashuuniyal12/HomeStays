import { Request, Response } from 'express';
import prisma from '../prisma';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        // 1. Rooms Stats
        const totalRooms = await prisma.room.count();
        const availableRooms = await prisma.room.count({
            where: { status: 'AVAILABLE' }
        });
        const occupiedRooms = await prisma.room.count({
            where: { status: { in: ['OCCUPIED', 'CLEANING', 'MAINTENANCE'] } }
        });

        // 2. Booking Stats (Check-ins / Check-outs today)
        const checkInsToday = await prisma.booking.count({
            where: {
                checkIn: {
                    gte: startOfDay,
                    lt: endOfDay
                }
            }
        });

        const checkOutsToday = await prisma.booking.count({
            where: {
                checkOut: {
                    gte: startOfDay,
                    lt: endOfDay
                },
                status: 'COMPLETED'
            }
        });

        // 3. Order Stats
        const pendingOrders = await prisma.order.count({
            where: { status: { in: ['PENDING', 'PREPARING'] } }
        });

        const ordersDeliveredToday = await prisma.order.count({
            where: {
                status: 'DELIVERED',
                updatedAt: {
                    gte: startOfDay,
                    lt: endOfDay
                }
            }
        });

        // 4. Revenue Today (Optional but good for dashboard)
        const bookingsCompletedToday = await prisma.booking.findMany({
            where: {
                status: 'COMPLETED',
                updatedAt: {
                    gte: startOfDay,
                    lt: endOfDay
                }
            },
            select: { billAmount: true }
        });
        const revenueToday = bookingsCompletedToday.reduce((sum, b) => sum + b.billAmount, 0);

        res.json({
            rooms: {
                total: totalRooms,
                available: availableRooms,
                occupied: occupiedRooms,
                booked: occupiedRooms // Alias for consistency if needed
            },
            bookings: {
                checkIns: checkInsToday,
                checkOuts: checkOutsToday
            },
            orders: {
                pending: pendingOrders,
                deliveredToday: ordersDeliveredToday
            },
            revenue: {
                today: revenueToday
            }
        });

    } catch (err) {
        console.error('Dashboard stats error:', err);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};
