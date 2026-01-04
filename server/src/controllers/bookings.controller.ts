import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../prisma';
import { io } from '../index';
import { AuthRequest } from '../middlewares/auth.middleware';

// Helper to generate temp password
const generateTempPassword = () => Math.random().toString(36).slice(-8);

export const createBooking = async (req: Request, res: Response) => {
    const { roomId, guestName, checkInDate, expectedCheckOutDate } = req.body;

    try {
        // 1. Create Guest User
        const username = `guest_${Date.now()}`;
        const tempPassword = generateTempPassword();
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        const guest = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                name: guestName,
                role: 'GUEST'
            }
        });

        // 2. Create Booking
        const booking = await prisma.booking.create({
            data: {
                guestId: guest.id,
                roomId: parseInt(roomId),
                checkIn: new Date(checkInDate),
                checkOut: new Date(expectedCheckOutDate),
                status: 'ACTIVE',
                plainPassword: tempPassword
            }
        });

        // 3. Update Room Status
        await prisma.room.update({
            where: { id: parseInt(roomId) },
            data: { status: 'OCCUPIED' }
        });

        // Notify Admin
        io.emit('booking:new', { booking, guest });

        res.json({
            booking,
            credentials: { username, password: tempPassword }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Check-in failed' });
    }
};

export const getActiveBookings = async (req: Request, res: Response) => {
    try {
        const bookings = await prisma.booking.findMany({
            where: { status: 'ACTIVE' },
            include: { guest: true, room: true }
        });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: 'Fetch failed' });
    }
};

export const getPastBookings = async (req: Request, res: Response) => {
    try {
        const bookings = await prisma.booking.findMany({
            where: { status: { not: 'ACTIVE' } },
            include: { guest: true, room: true },
            orderBy: { checkOut: 'desc' },
            take: 50 // Limit to last 50
        });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: 'Fetch failed' });
    }
};

export const getMyBooking = async (req: AuthRequest, res: Response) => {
    // Requires Auth Middleware
    if (!req.user) return res.status(401).json({ error: 'No token' });

    try {
        const booking = await prisma.booking.findFirst({
            where: { guestId: req.user.id, status: 'ACTIVE' },
            include: { room: true }
        });

        if (!booking) return res.status(404).json({ error: 'No booking found' });
        res.json(booking);
    } catch (err) {
        res.status(500).json({ error: 'Fetch failed' });
    }
};

export const checkout = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const booking = await prisma.booking.findUnique({
            where: { id },
            include: { room: true } // Include room to get price
        });
        if (!booking) return res.status(404).json({ error: 'Booking not found' });

        // Calculate Final Bill
        // 1. Room Charges
        const checkIn = new Date(booking.checkIn);
        const checkOut = booking.checkOut ? new Date(booking.checkOut) : new Date();
        const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
        const roomTotal = diffDays * booking.room.price;

        // 2. Food Orders
        const orders = await prisma.order.findMany({
            where: { bookingId: id, status: { not: 'CANCELLED' } }
        });
        const foodTotal = orders.reduce((sum, order) => sum + order.total, 0);

        // 3. Tax
        const tax = (roomTotal + foodTotal) * 0.05;
        const grandTotal = roomTotal + foodTotal + tax;

        // Complete Booking with Bill Amount
        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: {
                status: 'COMPLETED',
                billAmount: grandTotal, // Save the final amount
                // Optionally verify checkOut time here if needed
                checkOut: new Date() // Set actual checkout time
            }
        });

        // Deactivate Guest User
        await prisma.user.update({
            where: { id: booking.guestId },
            data: { isActive: false }
        });

        // Mark Room Cleaning
        await prisma.room.update({
            where: { id: booking.roomId },
            data: { status: 'CLEANING' }
        });

        res.json({ msg: 'Checkout successful', booking: updatedBooking });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Checkout failed' });
    }
};

export const getEarnings = async (req: Request, res: Response) => {
    try {
        const bookings = await prisma.booking.findMany({
            where: { status: 'COMPLETED' },
            include: { room: true }
        });

        const now = new Date();
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        let weekly = 0;
        let monthly = 0;
        let yearly = 0;

        for (const b of bookings) {
            let amount = b.billAmount;

            // Auto-fix: Calculate if missing
            if (!amount || amount === 0) {
                const checkIn = new Date(b.checkIn);
                const checkOut = b.checkOut ? new Date(b.checkOut) : new Date();
                const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
                const roomTotal = diffDays * b.room.price;

                const orders = await prisma.order.findMany({
                    where: { bookingId: b.id, status: { not: 'CANCELLED' } }
                });
                const foodTotal = orders.reduce((sum, order) => sum + order.total, 0);
                const tax = (roomTotal + foodTotal) * 0.05;
                amount = roomTotal + foodTotal + tax;

                // Update DB to persist fix
                await prisma.booking.update({
                    where: { id: b.id },
                    data: { billAmount: amount }
                });
            }

            const date = new Date(b.checkOut);
            if (date >= startOfWeek) weekly += amount;
            if (date >= startOfMonth) monthly += amount;
            if (date >= startOfYear) yearly += amount;
        }

        res.json({ weekly, monthly, yearly });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Stats failed' });
    }
};

export const getBill = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const booking = await prisma.booking.findUnique({
            where: { id },
            include: { room: true }
        });

        if (!booking) return res.status(404).json({ error: 'Booking not found' });

        // 1. Calculate Room Charges
        const checkIn = new Date(booking.checkIn);
        const checkOut = booking.checkOut ? new Date(booking.checkOut) : new Date();
        const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
        const roomTotal = diffDays * booking.room.price;

        // 2. Calculate Food Orders
        const orders = await prisma.order.findMany({
            where: { bookingId: id, status: { not: 'CANCELLED' } }
        });
        const foodTotal = orders.reduce((sum, order) => sum + order.total, 0);

        // 3. Tax (example 5%)
        const tax = (roomTotal + foodTotal) * 0.05;

        res.json({
            roomTotal,
            foodTotal,
            tax,
            grandTotal: roomTotal + foodTotal + tax,
            breakdown: {
                days: diffDays,
                roomRate: booking.room.price,
                ordersCount: orders.length
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Bill fetch failed' });
    }
};
