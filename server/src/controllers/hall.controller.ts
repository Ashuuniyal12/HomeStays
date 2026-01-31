import { Request, Response } from 'express';
import prisma from '../prisma';

// --- Create Hall Booking ---
export const createHallBooking = async (req: Request, res: Response) => {
    console.log("Create Hall Booking Request:", req.body); // DEBUG LOG

    const {
        guestName, guestPhone, guestAddress, guestEmail,
        eventDate, session, purpose,
        menuItemIds, totalAmount, advanceAmount
    } = req.body;

    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create or Find Hall Guest
            let guest = await tx.hallGuest.findFirst({
                where: { phoneNumber: guestPhone }
            });

            if (!guest) {
                guest = await tx.hallGuest.create({
                    data: {
                        name: guestName,
                        phoneNumber: guestPhone,
                        address: guestAddress,
                        email: guestEmail
                    }
                });
            } else {
                // Update address if provided
                if (guestAddress) {
                    await tx.hallGuest.update({
                        where: { id: guest.id },
                        data: { address: guestAddress }
                    });
                }
            }

            // 2. Create Booking
            const booking = await tx.hallBooking.create({
                data: {
                    hallGuestId: guest.id,
                    eventDate: new Date(eventDate),
                    session,
                    purpose,
                    status: 'CONFIRMED',
                    totalAmount: parseFloat(totalAmount),
                    advanceAmount: parseFloat(advanceAmount),
                    extraAmount: 0
                }
            });

            // 3. Add Menu Items
            if (menuItemIds && menuItemIds.length > 0) {
                // Ensure IDs are integers
                const bookingItems = menuItemIds.map((itemId: any) => ({
                    hallBookingId: booking.id,
                    menuItemId: parseInt(itemId),
                    quantity: 1 // Default per plate indicator
                }));

                await tx.hallBookingItem.createMany({
                    data: bookingItems
                });
            }

            return booking;
        });

        console.log("Booking created successfully:", result);
        res.status(201).json(result);

    } catch (err: any) {
        console.error('Create Hall Booking Error STACK:', err); // DEBUG LOG
        res.status(500).json({ error: 'Failed to create hall booking', details: err.message });
    }
};

// --- Get All Bookings ---
export const getHallBookings = async (req: Request, res: Response) => {
    try {
        const bookings = await prisma.hallBooking.findMany({
            include: {
                guest: true,
                menuItems: {
                    include: { menuItem: true }
                }
            },
            orderBy: { eventDate: 'asc' }
        });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
};

// --- Check Availability ---
export const checkHallAvailability = async (req: Request, res: Response) => {
    const { date, session } = req.query;

    if (!date) return res.status(400).json({ error: 'Date is required' });

    try {
        const searchDate = new Date(date as string);

        const existingBooking = await prisma.hallBooking.findFirst({
            where: {
                eventDate: {
                    equals: searchDate
                },
                // If checking for FULL_DAY, any booking blocks it.
                // If checking for MORNING, FULL_DAY or MORNING blocks it.
                OR: [
                    { session: 'FULL_DAY' },
                    { session: session as string }
                ],
                status: { not: 'CANCELLED' }
            }
        });

        res.json({ available: !existingBooking, blockingBooking: existingBooking });
    } catch (err) {
        res.status(500).json({ error: 'Failed to check availability' });
    }
};
