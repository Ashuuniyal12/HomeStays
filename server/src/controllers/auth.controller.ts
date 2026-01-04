import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../prisma';

export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );

        res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } catch (err) {
        res.status(500).json({ error: 'Login failed' });
    }
};

export const registerAdmin = async (req: Request, res: Response) => {
    const { username, password, secret } = req.body;

    // Simple protection for initial setup
    if (secret !== 'admin-secret-setup') return res.status(403).json({ error: 'Forbidden' });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { username, password: hashedPassword, role: 'OWNER' }
        });
        res.json({ msg: 'Admin created', userId: user.id });
    } catch (err) {
        res.status(400).json({ error: 'User already exists' });
    }
};
