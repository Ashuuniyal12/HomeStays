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

        // 5. Hall Stats (Added)
        const hallBookingsToday = await prisma.hallBooking.count({
            where: {
                eventDate: {
                    gte: startOfDay,
                    lt: endOfDay
                }
            }
        });

        const upcomingHallEvents = await prisma.hallBooking.count({
            where: {
                eventDate: {
                    gte: new Date()
                },
                status: 'CONFIRMED'
            }
        });

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
            },
            hall: {
                todayEvents: hallBookingsToday,
                upcomingEvents: upcomingHallEvents
            }
        });

    } catch (err) {
        console.error('Dashboard stats error:', err);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};

export const getReports = async (req: Request, res: Response) => {
    try {
        // --- 1. Booking Trends (Max bookings by day of week) ---
        // Fetch all bookings to aggregate in JS (simpler than raw SQL for now)
        const allBookings = await prisma.booking.findMany({
            select: { checkIn: true }
        });

        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const bookingCounts = new Array(7).fill(0);

        allBookings.forEach(booking => {
            const dayIndex = new Date(booking.checkIn).getDay();
            bookingCounts[dayIndex]++;
        });

        const bookingTrends = days.map((day, index) => ({
            day,
            count: bookingCounts[index]
        }));




        // --- 2. Popular Food Items ---
        const topFoodItems = await prisma.orderItem.groupBy({
            by: ['menuItemId'],
            _sum: {
                quantity: true
            },
            orderBy: {
                _sum: {
                    quantity: 'desc'
                }
            },
            take: 5
        });

        // Enrich with item names
        const foodIds = topFoodItems.map(item => item.menuItemId);
        const menuItems = await prisma.menuItem.findMany({
            where: { id: { in: foodIds } }
        });

        const popularFood = topFoodItems.map(item => {
            const menuItem = menuItems.find(m => m.id === item.menuItemId);
            return {
                name: menuItem?.name || 'Unknown',
                count: item._sum.quantity || 0
            };
        });

        // --- 3. Room Occupancy ---
        // Count bookings per room type
        const roomBookings = await prisma.booking.groupBy({
            by: ['roomId'],
            _count: {
                id: true
            },
            orderBy: {
                _count: {
                    id: 'desc'
                }
            },
            take: 5
        });

        const roomIds = roomBookings.map(rb => rb.roomId);
        const rooms = await prisma.room.findMany({
            where: { id: { in: roomIds } }
        });

        const roomStats = roomBookings.map(rb => {
            const room = rooms.find(r => r.id === rb.roomId);
            return {
                roomNumber: room?.number || 'Unknown',
                type: room?.type || '-',
                bookings: rb._count.id
            };
        });

        res.json({
            bookingTrends,
            popularFood,
            roomStats
        });

    } catch (err) {
        console.error('Reports error:', err);
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
};
