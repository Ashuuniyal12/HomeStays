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
        const booking = await prisma.booking.findUnique({ where: { id } });
        if (!booking) return res.status(404).json({ error: 'Booking not found' });

        // Complete Booking
        const updatedBooking = await prisma.booking.update({
            where: { id },
            data: { status: 'COMPLETED' }
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
        res.status(500).json({ error: 'Checkout failed' });
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
