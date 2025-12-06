import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { comparePassword, generateToken } from '@/lib/authBackend';
import { apiHandler, errorResponse, successResponse } from '@/lib/middleware';

export const POST = apiHandler(async (request) => {
    try {
        const body = await request.json();
        const { email, password } = body;

        // Validation
        if (!email || !password) {
            return errorResponse('Email and password are required');
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return errorResponse('Invalid email or password', 401);
        }

        // Verify password
        const isValidPassword = await comparePassword(password, user.password);

        if (!isValidPassword) {
            return errorResponse('Invalid email or password', 401);
        }

        // Generate JWT token
        const token = generateToken(user);

        // Return user data (excluding password)
        const { password: _, ...userWithoutPassword } = user;

        return successResponse({
            message: 'Login successful',
            token,
            user: {
                id: userWithoutPassword.id,
                email: userWithoutPassword.email,
                name: userWithoutPassword.name,
                phone: userWithoutPassword.phone,
                role: userWithoutPassword.role,
                referralCode: userWithoutPassword.referralCode,
                walletBalance: userWithoutPassword.walletBalance,
                autoInvest: userWithoutPassword.autoInvest,
                createdAt: userWithoutPassword.createdAt,
            },
        });

    } catch (error) {
        console.error('Login error:', error);
        return errorResponse('Login failed', 500);
    }
});
