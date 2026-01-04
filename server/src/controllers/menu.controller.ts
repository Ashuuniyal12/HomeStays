import { Request, Response } from 'express';
import prisma from '../prisma';

export const getMenu = async (req: Request, res: Response) => {
    try {
        // Return ALL items (Guest/Admin UIs handle 'available' status display)
        const items = await prisma.menuItem.findMany();
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

    // Construct data object dynamically to allow partial updates
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (category !== undefined) data.category = category;
    if (price !== undefined) data.price = parseFloat(price);
    if (isVeg !== undefined) data.isVeg = isVeg;
    if (available !== undefined) data.available = available;

    try {
        const item = await prisma.menuItem.update({
            where: { id: parseInt(id) },
            data
        });
        res.json(item);
    } catch (err) {
        console.error(err);
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
