import prisma from '@/lib/prisma';
import { apiHandler, requireAuth, successResponse, errorResponse } from '@/lib/middleware';

// GET /api/investments - Get user's investments
export const GET = apiHandler(async (request) => {
    const authResult = await requireAuth(request);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const investments = await prisma.investment.findMany({
        where: { userId: authResult.user.id },
        include: {
            plan: {
                select: {
                    id: true,
                    name: true,
                    returnRate: true,
                    duration: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    // Calculate current values
    const investmentsWithValues = investments.map((inv) => {
        const daysPassed = Math.floor(
            (Date.now() - inv.startDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const daysTotal = inv.plan.duration;
        const progress = Math.min(daysPassed / daysTotal, 1);
        const earnedReturn = (inv.expectedReturn - inv.amount) * progress;
        const currentValue = inv.amount + earnedReturn;

        return {
            ...inv,
            currentValue,
            progress: Math.round(progress * 100),
            daysPassed,
            daysRemaining: Math.max(daysTotal - daysPassed, 0),
        };
    });

    return successResponse({ investments: investmentsWithValues });
});

// POST /api/investments - Create new investment
export const POST = apiHandler(async (request) => {
    const authResult = await requireAuth(request);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const body = await request.json();
    const { planId, amount } = body;

    if (!planId || !amount || amount <= 0) {
        return errorResponse('Plan ID and valid amount are required');
    }

    const plan = await prisma.investmentPlan.findUnique({
        where: { id: parseInt(planId) },
    });

    if (!plan || !plan.isActive) {
        return errorResponse('Invalid or inactive investment plan', 404);
    }

    const investAmount = parseFloat(amount);

    // Note: Minimum validation is handled on frontend for each investment type
    // (UTT AMIS: 10,000 TZS, M-Wekeza: 1,000 TZS)
    // Backend plan minimums are not enforced here

    const user = await prisma.user.findUnique({
        where: { id: authResult.user.id },
    });

    const result = await prisma.$transaction(async (tx) => {
        // Calculate maturity date and expected return
        const maturityDate = new Date();
        maturityDate.setDate(maturityDate.getDate() + plan.duration);
        const expectedReturn = investAmount + (investAmount * plan.returnRate * plan.duration) / (365 * 100);

        // Create investment
        const investment = await tx.investment.create({
            data: {
                userId: authResult.user.id,
                planId: plan.id,
                amount: investAmount,
                currentValue: investAmount,
                expectedReturn,
                maturityDate,
                status: 'active', // Mark as active immediately since payment is confirmed on frontend
            },
            include: {
                plan: true,
            },
        });

        // We no longer deduct from wallet or create a wallet transaction
        // as payment is handled externally (mobile money)

        return { investment, newBalance: user.walletBalance };
    });

    return successResponse({
        message: 'Investment created successfully',
        investment: result.investment,
        balance: result.newBalance,
    }, 201);
});
