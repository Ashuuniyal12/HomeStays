import { Request, Response } from 'express';
// Trigger restart after prisma generate 
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../prisma';
import { io } from '../index';
import { AuthRequest } from '../middlewares/auth.middleware';

// Helper to generate temp password
const generateTempPassword = () => Math.random().toString(36).slice(-8);

// Helper to generate custom username from guest name
const generateUsername = (guestName: string): string => {
    // Clean and normalize the guest name
    const cleanName = guestName.toLowerCase().replace(/[^a-z\s]/g, '');
    const nameParts = cleanName.split(' ').filter(part => part.length > 0);

    if (nameParts.length === 0) {
        // Fallback if name is invalid
        return 'guest' + Math.random().toString(36).slice(-4);
    }

    let username = '';

    if (nameParts.length === 1) {
        // Single name: take first 5-6 chars
        username = nameParts[0].slice(0, 6);
    } else {
        // Multiple names: take first 3-4 from first name + first 2 from last name
        const firstName = nameParts[0];
        const lastName = nameParts[nameParts.length - 1];
        username = firstName.slice(0, 4) + lastName.slice(0, 2);
    }

    // Add 3-4 digit random number to ensure uniqueness
    const randomSuffix = Math.floor(100 + Math.random() * 9000); // 3-4 digits
    username = username + randomSuffix;

    // Ensure it's within 8-10 characters
    if (username.length > 10) {
        username = username.slice(0, 7) + randomSuffix.toString().slice(-3);
    }

    return username;
};

export const createBooking = async (req: Request, res: Response) => {
    const { roomId, guestName, checkInDate, expectedCheckOutDate, phoneNumber, idType, idNumber, advancePayment, email, discount } = req.body;

    try {
        // 1. Create Guest User
        const username = generateUsername(guestName);
        const tempPassword = generateTempPassword();
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // Check if user exists (by email or phone) to avoid duplicates
        let guest = await prisma.user.findFirst({
            where: {
                OR: [
                    email ? { email: { equals: email, mode: 'insensitive' } } : {},
                    phoneNumber ? { phoneNumber: { contains: phoneNumber } } : {}
                ].filter(Boolean) as any
            }
        });

        if (guest) {
            // Update existing guest credentials and details
            guest = await prisma.user.update({
                where: { id: guest.id },
                data: {
                    password: hashedPassword, // Rotate password for this stay
                    isActive: true,
                    // Update details if provided
                    name: guestName || guest.name,
                    idType: idType || guest.idType,
                    idNumber: idNumber || guest.idNumber,
                    email: email || guest.email
                }
            });
        } else {
            // Create New Guest
            guest = await prisma.user.create({
                data: {
                    username,
                    password: hashedPassword,
                    name: guestName,
                    role: 'GUEST',
                    phoneNumber,
                    email,
                    idType,
                    idNumber
                }
            });
        }

        // 2. Create Booking
        const booking = await prisma.booking.create({
            data: {
                guestId: guest.id,
                roomId: parseInt(roomId),
                checkIn: new Date(checkInDate),
                checkOut: new Date(expectedCheckOutDate),
                status: 'ACTIVE',
                plainPassword: tempPassword,
                paidAmount: advancePayment ? parseFloat(advancePayment) : 0,
                discount: discount ? parseFloat(discount) : 0 // New Field
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
            credentials: { username: guest.username, password: tempPassword }
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
        console.error('Active Bookings Error:', err);
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
        console.error('Past Bookings Error:', err);
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
        console.error('My Booking Error:', err);
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
        // 3. Tax (Removed)
        const tax = 0;
        const grandTotal = roomTotal + foodTotal;

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
                const tax = 0;
                amount = roomTotal + foodTotal;

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

export const searchGuest = async (req: Request, res: Response) => {
    const { query } = req.query; // email or phone
    if (!query) return res.status(400).json({ error: 'Query required' });

    try {
        // Find ALL bookings where the guest matches email or phone
        // This solves the issue of split history if multiple User records exist for the same person
        const bookings = await prisma.booking.findMany({
            where: {
                guest: {
                    OR: [
                        { email: { equals: String(query), mode: 'insensitive' } },
                        { phoneNumber: { contains: String(query) } }
                    ]
                }
            },
            orderBy: { checkIn: 'desc' },
            take: 10,
            include: {
                room: true,
                guest: true
            }
        });

        if (bookings.length === 0) return res.json(null);

        // Use the most recent guest details for the form
        const latestGuest = bookings[0].guest;

        res.json({
            ...latestGuest,
            bookings // Return the aggregated list of bookings
        });
    } catch (err) {
        console.error('Search Guest Error', err);
        res.status(500).json({ error: 'Search failed' });
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

        // 2. Calculate Food Orders with Details
        const orders = await prisma.order.findMany({
            where: { bookingId: id, status: { not: 'CANCELLED' } },
            include: {
                items: {
                    include: { menuItem: true }
                }
            }
        });

        const foodTotal = orders.reduce((sum, order) => sum + order.total, 0);

        // Flatten items for display
        const foodItems = orders.flatMap(order =>
            order.items.map(item => ({
                name: item.menuItem.name,
                quantity: item.quantity,
                price: item.price,
                total: item.price * item.quantity,
                orderDate: order.createdAt
            }))
        );

        // 3. Tax (Removed)
        const tax = 0;
        const discount = booking.discount || 0;
        const grandTotal = (roomTotal + foodTotal) - discount;
        const paidAmount = booking.paidAmount || 0;
        const remainingAmount = grandTotal - paidAmount;

        res.json({
            roomTotal,
            foodTotal,
            tax: 0,
            discount,
            grandTotal,
            paidAmount,
            remainingAmount,
            breakdown: {
                days: diffDays,
                roomRate: booking.room.price,
                ordersCount: orders.length,
                foodItems // Send detailed items
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Bill fetch failed' });
    }
};
