import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../db.js';
import crypto from 'crypto';
import { sendVerificationEmail } from '../utils/emailService.js';

const SECRET_KEY = process.env.JWT_SECRET || 'secret_key_fallback';

// Registration
export const register = async (req: Request, res: Response): Promise<void> => {
    console.log('[REG] Request recieved!');
    try {
        const { name, email, password } = req.body;
        console.log(`[REG] Trying to register: Name ${name}, Mail ${email}`);

        if (!email || !password) {
            console.log('[REG] Missing fields');
            res.status(400).json({ message: 'Email and password required' });
            return;
        }

        // Unique check
        console.log('[REG] Checking existing user...');
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            console.log(`[REG] User with ${email} already exists!`);
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        // Pass hash
        console.log('[REG] Hashing password...');
        const hashedPassword = await bcrypt.hash(password, 10);

        // Email token
        console.log('[REG] Generating verification token...');
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // BD insertion
        console.log('[REG] Creating user in DB...');
        const user = await prisma.user.create({
            data: {
                name: name || 'Anonymous',
                email,
                password: hashedPassword,
                status: 'UNVERIFIED',
                verificationToken,
            },
        });

        // Email send
        console.log('[REG] Verification letter sent to:', email);
        sendVerificationEmail(email, verificationToken);

        // Token
        console.log('[REG] Success! Assigned user ID:', user.id);
        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
            expiresIn: '24h',
        });

        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, status: user.status },
            message: 'Registered! Please check the mail!',
        });
    } catch (error) {
        console.error('[REG] FATAL ERROR:', error);
        res.status(500).json({ message: 'Registration failed' });
    }
};

// Email verification
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
    const { token } = req.params;
    console.log('[VERIFY] Verification attempt with token:', token);

    if (!token || typeof token !== 'string') {
        console.log('[VERIFY] Token format invalid!');
        res.redirect('/?status=invalid-token');
        return;
    }

    try {
        // User search by token
        const user = await prisma.user.findFirst({ where: { verificationToken: token } });

        // User existence check
        if (!user) {
            console.log('[VERIFY] User mismatch for token!');
            res.redirect('/?status=invalid-token');
            return;
        }

        // Check if already verified
        if (user.status === 'ACTIVE' && !user.verificationToken) {
            console.log(`[VERIFY] User ${user.id} is already verified!`);
            res.redirect('/?status=already-verified');
            return;
        }

        // Status update
        await prisma.user.update({
            where: { id: user.id },
            data: {
                status: 'ACTIVE',
                verificationToken: null,
            },
        });

        // Success - redirect to front
        console.log('[VERIFY] Email successfully verified for ID:', user.id);
        res.redirect('/?status=verified');
    } catch (error) {
        console.error('[VERIFY] FATAL ERROR:', error);
        res.redirect('/?status=invalid-token');
    }
};

// Login
export const login = async (req: Request, res: Response): Promise<void> => {
    console.log('[LOGIN] Request recieved:', req.body);
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });

        // Invalid cred
        if (!user) {
            console.log('[LOGIN] Error, no such user!');
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        // Banned check
        if (user.status === 'BLOCKED') {
            console.log('[LOGIN] User is banned!', user.id);
            res.status(403).json({ message: 'You are blocked' });
            return;
        }

        // Pass check
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            console.log('[LOGIN] Invalid password entered!');
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        // Last login update
        console.log('[LOGIN] Success! Updating the last login time', req.body);
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });

        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
            expiresIn: '24h',
        });

        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, status: user.status },
        });
    } catch (error) {
        console.error('[LOGIN] FATAL ERROR:', error);
        res.status(500).json({ message: 'Login failed' });
    }
};
