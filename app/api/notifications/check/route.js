import prisma from '@/lib/prisma';
import { apiHandler, successResponse, errorResponse } from '@/lib/middleware';

export const GET = apiHandler(async (request) => {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const since = searchParams.get('since');
    const userId = searchParams.get('userId');

    if (!since) {
        return errorResponse('Missing "since" timestamp', 400);
    }

    const sinceDate = new Date(since);
    if (isNaN(sinceDate.getTime())) {
        return errorResponse('Invalid "since" timestamp', 400);
    }

    let result = { hasNew: false, count: 0, latestItem: null };

    if (type === 'vendor_orders') {
        if (!userId) {
            return errorResponse('Missing "userId" for vendor checks', 400);
        }

        // Get the vendor name for this user
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true, role: true }
        });

        if (!user || user.role !== 'vendor') {
            // If user not found or not a vendor, just return no updates to avoid errors
            return successResponse(result);
        }

        // Find orders created after 'since' for products by this vendor
        const newOrders = await prisma.order.findMany({
            where: {
                createdAt: { gt: sinceDate },
                product: {
                    vendor: user.name
                }
            },
            include: {
                product: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 1
        });

        if (newOrders.length > 0) {
            result = {
                hasNew: true,
                count: newOrders.length, // Note: This is just 1 because of take: 1, but sufficient for notification
                latestItem: {
                    type: 'order',
                    message: `New order for ${newOrders[0].product.name}`,
                    timestamp: newOrders[0].createdAt
                }
            };
        }

    } else if (type === 'new_products') {
        // Find products created after 'since'
        const newProducts = await prisma.product.findMany({
            where: {
                createdAt: { gt: sinceDate }
            },
            select: { name: true, vendor: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
            take: 1
        });

        if (newProducts.length > 0) {
            result = {
                hasNew: true,
                count: newProducts.length,
                latestItem: {
                    type: 'product',
                    message: `New product "${newProducts[0].name}" added by ${newProducts[0].vendor}`,
                    timestamp: newProducts[0].createdAt
                }
            };
        }
    } else {
        return errorResponse('Invalid notification type', 400);
    }

    return successResponse(result);
});
