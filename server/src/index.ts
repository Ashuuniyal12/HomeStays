import dotenv from 'dotenv';
// Force restart
dotenv.config();

// Fallback for environment variables if not set
if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = "postgresql://neondb_owner:npg_Vpo5Iw1yKlSR@ep-royal-union-ahn7elce-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
    process.env.JWT_SECRET = "super_secret_key_change_this";
    process.env.PORT = process.env.PORT || "3000";
}

import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // In production, replace with specific client URL
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
    }
});

const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Pass dependencies to routes or use dependency injection in the future
// For now, we attach them to req or use global/singleton pattern
// Better: Use a context object or import the singletons where needed.
// Given the legacy structure, we'll start by importing singletons in controllers.

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Import Routes
import authRoutes from './routes/auth.routes';
import roomRoutes from './routes/rooms.routes';
import bookingRoutes from './routes/bookings.routes';
import menuRoutes from './routes/menu.routes';
import orderRoutes from './routes/orders.routes';
import dashboardRoutes from './routes/dashboard.routes';
import guestsRoutes from './routes/guests.routes';
import hallRoutes from './routes/hall.routes';

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/guests', guestsRoutes);
app.use('/api/hall', hallRoutes);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export { prisma, io }; // Export singletons for usage in other files
