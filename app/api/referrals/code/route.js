import prisma from '@/lib/prisma';
import { apiHandler, requireAuth, successResponse } from '@/lib/middleware';

// GET /api/referrals/code - Get user's referral code and stats
export const GET = apiHandler(async (request) => {
    const authResult = await requireAuth(request);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const user = await prisma.user.findUnique({
        where: { id: authResult.user.id },
        select: {
            referralCode: true,
        },
    });

    // Get referral stats
    const referrals = await prisma.referral.findMany({
        where: { referrerId: authResult.user.id },
        include: {
            referred: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    createdAt: true,
                },
            },
        },
    });

    const totalReferrals = referrals.length;
    const totalCommission = referrals.reduce((sum, ref) => sum + ref.totalCommission, 0);

    return successResponse({
        referralCode: user.referralCode,
        totalReferrals,
        totalCommission,
        referrals: referrals.map((r) => ({
            id: r.id,
            user: r.referred,
            commission: r.totalCommission,
            status: r.status,
            joinedAt: r.createdAt,
        })),
    });
});
