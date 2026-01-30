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

        if (!user) {
            res.status(401).json({ message: 'User not found' });
            return;
        }

        if (user.status === 'BLOCKED') {
            res.status(403).json({ message: 'User is blocked' });
            return;
        }

        // Success passage
        (req as AuthRequest).user = { id: user.id, email: user.email };
        next();
    } catch (error) {
        console.error('Auth Error:', error);
        res.status(403).json({ message: 'Invalid or expired token' });
        return;
    }
};
