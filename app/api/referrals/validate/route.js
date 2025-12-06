import prisma from '@/lib/prisma';
import { apiHandler, successResponse, errorResponse } from '@/lib/middleware';

// POST /api/referrals/validate - Validate referral code
export const POST = apiHandler(async (request) => {
    const body = await request.json();
    const { code } = body;

    if (!code) {
        return errorResponse('Referral code is required');
    }

    const referrer = await prisma.user.findUnique({
        where: { referralCode: code },
        select: {
            id: true,
            name: true,
            referralCode: true,
        },
    });

    if (!referrer) {
        return errorResponse('Invalid referral code', 404);
    }

    return successResponse({
        valid: true,
        referrer: {
            name: referrer.name,
            code: referrer.referralCode,
        },
    });
});
