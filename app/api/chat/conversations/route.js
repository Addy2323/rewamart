import { apiHandler, authenticate, successResponse, errorResponse } from '@/lib/middleware';
import prisma from '@/lib/prisma';

// GET /api/chat/conversations - List all conversations for the current user
export const GET = apiHandler(async (request) => {
    const user = await authenticate(request);
    if (!user) return errorResponse('Unauthorized', 401);

    const conversations = await prisma.chatConversation.findMany({
        where: {
            OR: [
                { customerId: user.id },
                { vendorId: user.id }
            ]
        },
        include: {
            customer: {
                select: { id: true, name: true, email: true }
            },
            vendor: {
                select: { id: true, name: true, email: true }
            },
            messages: {
                orderBy: { createdAt: 'desc' },
                take: 1
            }
        },
        orderBy: { updatedAt: 'desc' }
    });

    return successResponse({ conversations });
});

// POST /api/chat/conversations - Start or get a conversation with a vendor
export const POST = apiHandler(async (request) => {
    const user = await authenticate(request);
    if (!user) return errorResponse('Unauthorized', 401);

    const { vendorId } = await request.json();
    if (!vendorId) return errorResponse('Vendor ID is required', 400);

    // Ensure vendor exists and is actually a vendor
    const vendor = await prisma.user.findUnique({
        where: { id: parseInt(vendorId) }
    });

    if (!vendor || vendor.role !== 'vendor') {
        return errorResponse('Invalid vendor', 404);
    }

    // Find or create conversation
    const conversation = await prisma.chatConversation.upsert({
        where: {
            customerId_vendorId: {
                customerId: user.id,
                vendorId: vendor.id
            }
        },
        update: {},
        create: {
            customerId: user.id,
            vendorId: vendor.id
        },
        include: {
            vendor: {
                select: { id: true, name: true, email: true }
            }
        }
    });

    return successResponse({ conversation });
});
