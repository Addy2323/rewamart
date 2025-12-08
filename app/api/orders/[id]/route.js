import prisma from '@/lib/prisma';
import { apiHandler, requireAuth, successResponse, errorResponse } from '@/lib/middleware';

// GET /api/orders/[id] - Get a specific order
export const GET = apiHandler(async (request, { params }) => {
    const authResult = await requireAuth(request);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const { id } = params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) {
        return errorResponse('Invalid order ID', 400);
    }

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            items: {
                include: {
                    product: true
                }
            },
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true
                }
            }
        }
    });

    if (!order) {
        return errorResponse('Order not found', 404);
    }

    // Check authorization (admin, vendor, or order owner)
    const isAdmin = authResult.user.role === 'admin';
    const isOwner = order.userId === authResult.user.id;
    const isVendor = authResult.user.role === 'vendor' && order.items.some(item => item.product.vendor === authResult.user.name);

    if (!isAdmin && !isOwner && !isVendor) {
        return errorResponse('Unauthorized access to order', 403);
    }

    return successResponse({ order });
});

// PATCH /api/orders/[id] - Update order status
export const PATCH = apiHandler(async (request, { params }) => {
    const authResult = await requireAuth(request);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const { id } = params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) {
        return errorResponse('Invalid order ID', 400);
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
        return errorResponse('Status is required', 400);
    }

    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            items: {
                include: {
                    product: true
                }
            }
        }
    });

    if (!order) {
        return errorResponse('Order not found', 404);
    }

    // Check authorization (admin or vendor)
    const isAdmin = authResult.user.role === 'admin';
    const isVendor = authResult.user.role === 'vendor' && order.items.some(item => item.product.vendor === authResult.user.name);

    if (!isAdmin && !isVendor) {
        return errorResponse('Unauthorized to update order status', 403);
    }

    const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status },
        include: {
            items: {
                include: {
                    product: true
                }
            },
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true
                }
            }
        }
    });

    return successResponse({ order: updatedOrder });
});
