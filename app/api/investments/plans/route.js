import prisma from '@/lib/prisma';
import { apiHandler, successResponse } from '@/lib/middleware';

// GET /api/investments/plans - Get all investment plans
export const GET = apiHandler(async (request) => {
    const plans = await prisma.investmentPlan.findMany({
        where: { isActive: true },
        orderBy: { minAmount: 'asc' },
    });

    return successResponse({ plans });
});
