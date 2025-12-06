import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, generateToken, generateReferralCode } from '@/lib/authBackend';
import { apiHandler, errorResponse, successResponse } from '@/lib/middleware';

export const POST = apiHandler(async (request) => {
    try {
        const body = await request.json();
        const { email, password, name, phone, referredBy } = body;

        // Validation
        if (!email || !password || !name) {
            return errorResponse('Email, password, and name are required');
        }

        if (password.length < 6) {
            return errorResponse('Password must be at least 6 characters');
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return errorResponse('Email already registered', 409);
        }

        // Check if phone is provided and unique
        if (phone) {
            const phoneExists = await prisma.user.findUnique({
                where: { phone },
            });

            if (phoneExists) {
                return errorResponse('Phone number already registered', 409);
            }
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user (without referral code first to get ID)
        const tempUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                phone: phone || null,
                referralCode: 'TEMP', // Temporary, will update
                referredBy: referredBy || null,
            },
        });

        // Generate and update referral code
        const referralCode = generateReferralCode(name, tempUser.id);
        const user = await prisma.user.update({
            where: { id: tempUser.id },
            data: { referralCode },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                referralCode: true,
                walletBalance: true,
                autoInvest: true,
                createdAt: true,
            },
        });

        // If referred by someone, create referral relationship
        if (referredBy) {
            const referrer = await prisma.user.findUnique({
                where: { referralCode: referredBy },
            });

            if (referrer) {
                await prisma.referral.create({
                    data: {
                        referrerId: referrer.id,
                        referredId: user.id,
                        commissionRate: 5.0, // 5% commission
                    },
                });
            }
        }

        // Generate JWT token
        const token = generateToken(user);

        return successResponse({
            message: 'User registered successfully',
            token,
            user,
        }, 201);

    } catch (error) {
        console.error('Registration error:', error);
        return errorResponse('Registration failed', 500);
    }
});
