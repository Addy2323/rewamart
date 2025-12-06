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

    if (investAmount < plan.minAmount) {
        return errorResponse(`Minimum investment for ${plan.name} is ${plan.minAmount} TZS`, 400);
    }

    if (plan.maxAmount && investAmount > plan.maxAmount) {
        return errorResponse(`Maximum investment for ${plan.name} is ${plan.maxAmount} TZS`, 400);
    }

    const user = await prisma.user.findUnique({
        where: { id: authResult.user.id },
    });

    if (user.walletBalance < investAmount) {
        return errorResponse('Insufficient wallet balance', 400);
    }

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
            },
            include: {
                plan: true,
            },
        });

        // Deduct from wallet
        const balanceBefore = user.walletBalance;
        const balanceAfter = balanceBefore - investAmount;

        await tx.user.update({
            where: { id: authResult.user.id },
            data: { walletBalance: balanceAfter },
        });

        // Record transaction
        await tx.walletTransaction.create({
            data: {
                userId: authResult.user.id,
                type: 'investment',
                amount: -investAmount,
                balanceBefore,
                balanceAfter,
                reference: investment.id.toString(),
                description: `Investment in ${plan.name} plan`,
            },
        });

        return { investment, newBalance: balanceAfter };
    });

    return successResponse({
        message: 'Investment created successfully',
        investment: result.investment,
        balance: result.newBalance,
    }, 201);
});
