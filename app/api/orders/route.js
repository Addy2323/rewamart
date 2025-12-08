import prisma from '@/lib/prisma';
import { apiHandler, requireAdmin, requireAuth, successResponse, errorResponse } from '@/lib/middleware';

// GET /api/orders - Get user's orders (or all orders for admin)
export const GET = apiHandler(async (request) => {
    const authResult = await requireAuth(request);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const isAdmin = authResult.user.role === 'admin';
    const isVendor = authResult.user.role === 'vendor';

    let where = {};
    if (isAdmin) {
        where = {};
    } else if (isVendor) {
        // Vendor sees orders they placed OR orders containing their products
        where = {
            OR: [
                { userId: authResult.user.id },
                {
                    items: {
                        some: {
                            product: {
                                vendor: authResult.user.name
                            }
                        }
                    }
                }
            ]
        };
    } else {
        where = { userId: authResult.user.id };
    }

    const [orders, total] = await Promise.all([
        prisma.order.findMany({
            where,
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                                price: true,
                                vendor: true,
                            },
                        },
                    },
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        }),
        prisma.order.count({ where }),
    ]);

    return successResponse({
        orders,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    });
});

// POST /api/orders - Create new order
export const POST = apiHandler(async (request) => {
    const authResult = await requireAuth(request);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const body = await request.json();
    const { items, paymentMethod, deliveryAddress } = body;

    if (!items || items.length === 0) {
        return errorResponse('Order must contain at least one item');
    }

    // Calculate total and cashback
    let totalAmount = 0;
    let totalCashback = 0;
    const orderItems = [];

    for (const item of items) {
        const product = await prisma.product.findUnique({
            where: { id: parseInt(item.productId) },
        });

        if (!product) {
            return errorResponse(`Product ${item.productId} not found`, 404);
        }

        if (product.stockCount < item.quantity) {
            return errorResponse(`Insufficient stock for ${product.name}`, 400);
        }

        const itemTotal = product.price * item.quantity;
        const itemCashback = (itemTotal * product.cashbackRate) / 100;

        totalAmount += itemTotal;
        totalCashback += itemCashback;

        orderItems.push({
            productId: product.id,
            quantity: item.quantity,
            price: product.price,
            cashback: itemCashback,
        });
    }

    // Get user's wallet balance
    const user = await prisma.user.findUnique({
        where: { id: authResult.user.id },
    });

    // Check if payment method is wallet
    if (paymentMethod === 'wallet') {
        if (user.walletBalance < totalAmount) {
            return errorResponse('Insufficient wallet balance', 400);
        }
    }

    // Create order in a transaction
    const order = await prisma.$transaction(async (tx) => {
        // Create the order
        const newOrder = await tx.order.create({
            data: {
                userId: authResult.user.id,
                totalAmount,
                cashbackEarned: totalCashback,
                status: 'pending',
                paymentMethod: paymentMethod || 'wallet',
                paymentStatus: paymentMethod === 'wallet' ? 'paid' : 'pending',
                deliveryAddress: deliveryAddress || null,
                items: {
                    create: orderItems,
                },
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        // If paying with wallet, deduct amount and add cashback
        if (paymentMethod === 'wallet') {
            const balanceBefore = user.walletBalance;
            const balanceAfter = balanceBefore - totalAmount + totalCashback;

            await tx.user.update({
                where: { id: authResult.user.id },
                data: { walletBalance: balanceAfter },
            });

            // Record wallet transactions
            await tx.walletTransaction.create({
                data: {
                    userId: authResult.user.id,
                    type: 'order_payment',
                    amount: -totalAmount,
                    balanceBefore,
                    balanceAfter: balanceBefore - totalAmount,
                    reference: newOrder.id.toString(),
                    description: `Order #${newOrder.id} payment`,
                },
            });

            await tx.walletTransaction.create({
                data: {
                    userId: authResult.user.id,
                    type: 'cashback',
                    amount: totalCashback,
                    balanceBefore: balanceBefore - totalAmount,
                    balanceAfter,
                    reference: newOrder.id.toString(),
                    description: `Cashback for Order #${newOrder.id}`,
                },
            });

            // Record cashback
            await tx.cashback.create({
                data: {
                    userId: authResult.user.id,
                    orderId: newOrder.id,
                    amount: totalCashback,
                    status: 'credited',
                },
            });

            // Update product stock
            for (const item of orderItems) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: {
                        stockCount: {
                            decrement: item.quantity,
                        },
                    },
                });
            }

            // Check if auto-invest is enabled
            if (user.autoInvest && totalCashback > 0) {
                // Find the best investment plan for the cashback amount
                const plans = await tx.investmentPlan.findMany({
                    where: {
                        isActive: true,
                        minAmount: { lte: totalCashback },
                    },
                    orderBy: { minAmount: 'desc' },
                    take: 1,
                });

                if (plans.length > 0) {
                    const plan = plans[0];
                    const maturityDate = new Date();
                    maturityDate.setDate(maturityDate.getDate() + plan.duration);
                    const expectedReturn = totalCashback + (totalCashback * plan.returnRate * plan.duration) / (365 * 100);

                    await tx.investment.create({
                        data: {
                            userId: authResult.user.id,
                            planId: plan.id,
                            amount: totalCashback,
                            currentValue: totalCashback,
                            expectedReturn,
                            maturityDate,
                        },
                    });

                    // Deduct cashback from wallet since it's invested
                    await tx.user.update({
                        where: { id: authResult.user.id },
                        data: { walletBalance: { decrement: totalCashback } },
                    });

                    await tx.walletTransaction.create({
                        data: {
                            userId: authResult.user.id,
                            type: 'investment',
                            amount: -totalCashback,
                            balanceBefore: balanceAfter,
                            balanceAfter: balanceAfter - totalCashback,
                            description: `Auto-invest cashback in ${plan.name} plan`,
                        },
                    });
                }
            }
        }

        return newOrder;
    });

    return successResponse({
        message: 'Order created successfully',
        order,
        cashbackEarned: totalCashback,
    }, 201);
});
