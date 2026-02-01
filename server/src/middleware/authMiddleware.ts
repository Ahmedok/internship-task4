import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../db.js';

const SECRET_KEY = process.env.JWT_SECRET || 'secret_key_fallback';

export interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
    };
}

export const authenticateToken = async (
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.error('[AUTH-M] No-token request was intercepted!');
        res.status(401).json({ message: 'Access token required' });
        return;
    }

    try {
        // Token check
        const decoded = jwt.verify(token, SECRET_KEY) as { id: number; email: string };

        // Recent ban check
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
        });
        console.error(`[AUTH-M] Checking user [${user?.email}] for request access...`);

        if (!user) {
            console.error(`[AUTH-M] Non-existing user was intercepted!`);
            res.status(401).json({ message: 'User not found' });
            return;
        }

        if (user.status === 'BLOCKED') {
            console.error(`[AUTH-M] Blocked user [${user.email}] was intercepted!`);
            res.status(403).json({ message: 'User is blocked' });
            return;
        }

        // Success passage
        console.error(`[AUTH-M] User [${user.email}] checked successfully. Request granted!`);
        (req as AuthRequest).user = { id: user.id, email: user.email };
        next();
    } catch (error) {
        console.error('[AUTH-M] FATAL ERROR:', error);
        res.status(403).json({ message: 'Invalid or expired token' });
        return;
    }
};
