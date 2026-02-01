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

    // Field validation
    const { name, email, password } = req.body;
    if (!email || !password) {
        console.log('[REG] Incorrect data input!');
        res.status(400).json({ message: 'Email and password required' });
        return;
    }

    // Registration attempt
    console.log(`[REG] Trying to register user with name [${name}] and email [${email}]...`);
    try {
        // Hashes prep
        console.log('[REG] Hashing password and verification token...');
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Creation attempt (should either pass or give P2002)
        console.log('[REG] Attempting to create user in DB...');
        const user = await prisma.user.create({
            data: {
                name: name || 'Anonymous',
                email,
                password: hashedPassword,
                status: 'UNVERIFIED',
                verificationToken,
            },
        });

        // Success
        console.log(`[REG] User [${email}] created successfully! Sending verification email...`);

        sendVerificationEmail(email, verificationToken);

        const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
            expiresIn: '24h',
        });

        res.status(201).json({
            token,
            user: { id: user.id, name: user.name, email: user.email, status: user.status },
            message: 'Registered! Please check the mail!',
        });
    } catch (error: any) {
        // Database unique check error
        if (error.code === 'P2002') {
            console.log(`[REG] DB-FAIL: User with ${email} already exists!`);
            res.status(409).json({ message: 'User already exists' });
            return;
        }
        // Other errors
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
    console.log('[LOGIN] Request recieved!');
    try {
        const { email, password } = req.body;
        console.log('[LOGIN] Request attempt for user:', email);

        const user = await prisma.user.findUnique({ where: { email } });

        // Invalid cred
        if (!user) {
            console.log('[LOGIN] Error, no such user!');
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        // Banned check
        if (user.status === 'BLOCKED') {
            console.log('[LOGIN] User is banned! ID:', user.id);
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
        console.log('[LOGIN] Success! Updating the last login time for user:', email);
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
