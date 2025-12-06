import prisma from '@/lib/prisma';
import { apiHandler, requireAuth, successResponse, errorResponse } from '@/lib/middleware';

// POST /api/wallet/withdraw - Withdraw funds to mobile money
export const POST = apiHandler(async (request) => {
    const authResult = await requireAuth(request);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const body = await request.json();
    const { amount, method, phoneNumber } = body;

    if (!amount || amount <= 0) {
        return errorResponse('Invalid amount');
    }

    if (!method || !phoneNumber) {
        return errorResponse('Payment method and phone number are required');
    }

    const user = await prisma.user.findUnique({
        where: { id: authResult.user.id },
    });

    if (user.walletBalance < amount) {
        return errorResponse('Insufficient balance', 400);
    }

    // In production, integrate with actual payment gateway
    // For now, simulate successful withdrawal

    const result = await prisma.$transaction(async (tx) => {
        const balanceBefore = user.walletBalance;
        const balanceAfter = balanceBefore - parseFloat(amount);

        await tx.user.update({
            where: { id: authResult.user.id },
            data: { walletBalance: balanceAfter },
        });

        const transaction = await tx.walletTransaction.create({
            data: {
                userId: authResult.user.id,
                type: 'withdrawal',
                amount: -parseFloat(amount),
                balanceBefore,
                balanceAfter,
                status: 'completed',
                reference: `WD-${Date.now()}`,
                description: `Withdrawal to ${method} (${phoneNumber})`,
            },
        });

        return { transaction, newBalance: balanceAfter };
    });

    return successResponse({
        message: 'Withdrawal successful',
        transaction: result.transaction,
        balance: result.newBalance,
    });
});
