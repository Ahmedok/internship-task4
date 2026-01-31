import type { Response } from 'express';
import type { AuthRequest } from '../middleware/authMiddleware.js';
import prisma from '../db.js';

export const getUsers = async (_: AuthRequest, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { lastLogin: 'desc' }, // Sorting
            select: {
                id: true,
                name: true,
                email: true,
                lastLogin: true,
                registrationTime: true,
                status: true,
            },
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
};

// To ban (ID array: [1, 5, 10])
export const blockUsers = async (req: AuthRequest, res: Response) => {
    try {
        const { userIds } = req.body;
        await prisma.user.updateMany({
            where: { id: { in: userIds } },
            data: { status: 'BLOCKED' },
        });
        console.log(`[ADMIN-BLOCK] User [${req.user?.email}] has blocked IDs: [${userIds}]`);
        res.json({ message: 'Users blocked' });
    } catch (error) {
        console.log(`[ADMIN-ERROR] User [${req.user?.email}] block attempt failed: ${error}`);
        res.status(500).json({ message: 'Error blocking users' });
    }
};

// To unban
export const unblockUsers = async (req: AuthRequest, res: Response) => {
    try {
        const { userIds } = req.body;
        await prisma.user.updateMany({
            where: { id: { in: userIds } },
            data: { status: 'ACTIVE' },
        });
        console.log(`[ADMIN-UNBLOCK] User [${req.user?.email}] has unblocked IDs: [${userIds}]`);
        res.json({ message: 'Users unblocked' });
    } catch (error) {
        console.log(`[ADMIN-ERROR] User [${req.user?.email}] unblock attempt failed: ${error}`);
        res.status(500).json({ message: 'Error unblocking users' });
    }
};

// To delete
export const deleteUsers = async (req: AuthRequest, res: Response) => {
    try {
        const { userIds } = req.body;
        await prisma.user.deleteMany({
            where: { id: { in: userIds } },
        });
        console.log(`[ADMIN-DELETE] User [${req.user?.email}] has deleted IDs: [${userIds}]`);
        res.json({ message: 'Users deleted' });
    } catch (error) {
        console.log(`[ADMIN-ERROR] User [${req.user?.email}] delete attempt failed: ${error}`);
        res.status(500).json({ message: 'Error deleting users' });
    }
};

// To delete all unverified
export const deleteUnverified = async (req: AuthRequest, res: Response) => {
    try {
        await prisma.user.deleteMany({
            where: { status: 'UNVERIFIED' },
        });
        console.log(`[ADMIN-CLEAN] User [${req.user?.email}] has deleted all unverified users.`);
        res.json({ message: 'Unverified users deleted' });
    } catch (error) {
        console.log(`[ADMIN-ERROR] User [${req.user?.email}] clean attempt failed: ${error}`);
        res.status(500).json({ message: 'Error deleting unverified' });
    }
};
