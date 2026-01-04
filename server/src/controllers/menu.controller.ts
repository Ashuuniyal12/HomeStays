import { Request, Response } from 'express';
import prisma from '../prisma';

export const getMenu = async (req: Request, res: Response) => {
    try {
        const items = await prisma.menuItem.findMany({
            where: { available: true }
        });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: 'Fetch failed' });
    }
};

export const createMenuItem = async (req: Request, res: Response) => {
    const { name, description, category, price, isVeg } = req.body;
    try {
        const item = await prisma.menuItem.create({
            data: { name, description, category, price: parseFloat(price), isVeg }
        });
        res.json(item);
    } catch (err) {
        res.status(400).json({ error: 'Creation failed' });
    }
};

export const updateMenuItem = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, category, price, isVeg, available } = req.body;
    try {
        const item = await prisma.menuItem.update({
            where: { id: parseInt(id) },
            data: { name, description, category, price: parseFloat(price), isVeg, available }
        });
        res.json(item);
    } catch (err) {
        res.status(400).json({ error: 'Update failed' });
    }
};

export const deleteMenuItem = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.menuItem.delete({ where: { id: parseInt(id) } });
        res.json({ msg: 'Item deleted' });
    } catch (err) {
        res.status(400).json({ error: 'Delete failed' });
    }
};
