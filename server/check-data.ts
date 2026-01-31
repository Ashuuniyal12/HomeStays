
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = "postgresql://neondb_owner:npg_Vpo5Iw1yKlSR@ep-royal-union-ahn7elce-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
}

const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.booking.count();
        console.log(`TOTAL_BOOKINGS: ${count}`);

        if (count > 0) {
            const bookings = await prisma.booking.findMany({
                take: 5,
                select: { checkIn: true }
            });
            console.log('SAMPLE_BOOKING_DATE:', bookings[0].checkIn);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
