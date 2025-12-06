import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_development';
const JWT_EXPIRES_IN = '7d'; // Token valid for 7 days

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

/**
 * Compare password with hashed password
 */
export async function comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate referral code for user
 */
export function generateReferralCode(name, userId) {
    const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 4);
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${cleanName}${userId}${randomStr}`;
}

/**
 * Generate JWT token for user
 */
export function generateToken(user) {
    const payload = {
        userId: user.id,
        email: user.email,
        role: user.role,
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify JWT token
 */
export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

/**
 * Get user from token
 */
export async function getUserFromToken(token) {
    const decoded = verifyToken(token);
    if (!decoded) return null;

    try {
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
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

        return user;
    } catch (error) {
        return null;
    }
}

/**
 * Extract token from request headers
 */
export function extractToken(request) {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return null;

    // Bearer token format: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
        return parts[1];
    }

    return null;
}
