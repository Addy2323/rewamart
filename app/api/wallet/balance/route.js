import prisma from '@/lib/prisma';
import { apiHandler, requireAuth, successResponse } from '@/lib/middleware';

// GET /api/wallet/balance - Get current wallet balance
export const GET = apiHandler(async (request) => {
    const authResult = await requireAuth(request);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const user = await prisma.user.findUnique({
        where: { id: authResult.user.id },
        select: {
            walletBalance: true,
        },
    });

    return successResponse({
        balance: user.walletBalance,
    });
});
