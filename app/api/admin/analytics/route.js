import prisma from '@/lib/prisma';
import { apiHandler, requireAdmin, successResponse } from '@/lib/middleware';

// GET /api/admin/analytics - Get platform analytics
export const GET = apiHandler(async (request) => {
    const authResult = await requireAdmin(request);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    // Get counts and stats
    const [
        totalUsers,
        totalOrders,
        totalProducts,
        totalInvestments,
        recentOrders,
        topProducts,
    ] = await Promise.all([
        prisma.user.count({ where: { role: 'customer' } }),
        prisma.order.count(),
        prisma.product.count(),
        prisma.investment.count(),
        prisma.order.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                items: {
                    include: {
                        product: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        }),
        prisma.orderItem.groupBy({
            by: ['productId'],
            _sum: {
                quantity: true,
            },
            orderBy: {
                _sum: {
                    quantity: 'desc',
                },
            },
            take: 5,
        }),
    ]);

    // Calculate revenue
    const ordersData = await prisma.order.aggregate({
        where: { paymentStatus: 'paid' },
        _sum: {
            totalAmount: true,
            cashbackEarned: true,
        },
    });

    const investmentsData = await prisma.investment.aggregate({
        _sum: {
            amount: true,
        },
    });

    // Get top products details
    const topProductIds = topProducts.map((p) => p.productId);
    const topProductsDetails = await prisma.product.findMany({
        where: { id: { in: topProductIds } },
        select: {
            id: true,
            name: true,
            image: true,
            price: true,
        },
    });

    const topProductsWithQuantity = topProducts.map((tp) => {
        const product = topProductsDetails.find((p) => p.id === tp.productId);
        return {
            ...product,
            totalSold: tp._sum.quantity,
        };
    });

    return successResponse({
        stats: {
            totalUsers,
            totalOrders,
            totalProducts,
            totalInvestments,
            totalRevenue: ordersData._sum.totalAmount || 0,
            totalCashback: ordersData._sum.cashbackEarned || 0,
            totalInvested: investmentsData._sum.amount || 0,
        },
        recentOrders,
        topProducts: topProductsWithQuantity,
    });
});
