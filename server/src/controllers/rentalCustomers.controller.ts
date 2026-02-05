import { Request, Response } from 'express';
import prisma from '../prisma';

export const createCustomer = async (req: Request, res: Response) => {
    const { name, phoneNumber } = req.body;
    if (!name || !phoneNumber) {
        return res.status(400).json({ error: 'Name and Phone Number are required' });
    }

    try {
        const customer = await prisma.rentalCustomer.create({ data: req.body });
        res.json(customer);
    } catch (err) {
        console.error("Create Customer Error:", err);
        res.status(500).json({ error: 'Failed to create customer' });
    }
};

export const searchCustomers = async (req: Request, res: Response) => {
    const { query, q } = req.query;
    const searchTerm = query || q;

    if (!searchTerm) return res.json([]);

    try {
        const customers = await prisma.rentalCustomer.findMany({
            where: {
                OR: [
                    { name: { contains: String(searchTerm), mode: 'insensitive' } },
                    { phoneNumber: { contains: String(searchTerm) } }
                ]
            },
            take: 10
        });
        res.json(customers);
    } catch (err) {
        res.status(500).json({ error: 'Search failed' });
    }
};

export const getAllCustomers = async (req: Request, res: Response) => {
    try {
        const customers = await prisma.rentalCustomer.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(customers);
    } catch (err) {
        console.error("Get All Customers Error:", err);
        res.status(500).json({ error: 'Failed to fetch customers' });
    }
};
