import prisma from '@/lib/prisma';
import { apiHandler, requireAuth, successResponse, errorResponse } from '@/lib/middleware';

// GET /api/wallet/transactions - Get transaction history
export const GET = apiHandler(async (request) => {
    const authResult = await requireAuth(request);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type'); // filter by transaction type
    const skip = (page - 1) * limit;

    const where = {
        userId: authResult.user.id,
        ...(type && { type }),
    };

    const [transactions, total] = await Promise.all([
        prisma.walletTransaction.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        }),
        prisma.walletTransaction.count({ where }),
    ]);

    return successResponse({
        transactions,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    });
});

// POST /api/wallet/transactions - Add funds (deposit)
export const POST = apiHandler(async (request) => {
    const authResult = await requireAuth(request);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const body = await request.json();
    const { amount, method, reference } = body;

    if (!amount || amount <= 0) {
        return errorResponse('Invalid amount');
    }

    // In production, integrate with actual payment gateway (M-Pesa, Tigo Pesa, etc.)
    // For now, simulate successful deposit

    const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
            where: { id: authResult.user.id },
        });

        const balanceBefore = user.walletBalance;
        const balanceAfter = balanceBefore + parseFloat(amount);

        await tx.user.update({
            where: { id: authResult.user.id },
            data: { walletBalance: balanceAfter },
        });

        const transaction = await tx.walletTransaction.create({
            data: {
                userId: authResult.user.id,
                type: 'deposit',
                amount: parseFloat(amount),
                balanceBefore,
                balanceAfter,
                status: 'completed',
                reference: reference || `DEP-${Date.now()}`,
                description: `Deposit via ${method || 'wallet'}`,
            },
        });

        return { transaction, newBalance: balanceAfter };
    });

    return successResponse({
        message: 'Deposit successful',
        transaction: result.transaction,
        balance: result.newBalance,
    }, 201);
});
