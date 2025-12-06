import { apiHandler, authenticate, successResponse, errorResponse } from '@/lib/middleware';
import prisma from '@/lib/prisma';

// GET /api/admin/customers - List all customers
export const GET = apiHandler(async (request) => {
    const user = await authenticate(request);

    // Ensure user is admin
    if (!user || user.role !== 'admin') {
        return errorResponse('Unauthorized access', 403);
    }

    const customers = await prisma.user.findMany({
        where: { role: 'customer' },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
            walletBalance: true,
            _count: {
                select: { orders: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return successResponse({ success: true, customers }, 200);
});
