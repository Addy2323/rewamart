import { apiHandler, authenticate, successResponse, errorResponse } from '@/lib/middleware';
import prisma from '@/lib/prisma';

// GET /api/chat/messages - Get messages for a conversation
export const GET = apiHandler(async (request) => {
    const user = await authenticate(request);
    if (!user) return errorResponse('Unauthorized', 401);

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) return errorResponse('Conversation ID is required', 400);

    const messages = await prisma.chatMessage.findMany({
        where: {
            conversationId: parseInt(conversationId),
            conversation: {
                OR: [
                    { customerId: user.id },
                    { vendorId: user.id }
                ]
            }
        },
        orderBy: { createdAt: 'asc' }
    });

    // Mark messages as read
    await prisma.chatMessage.updateMany({
        where: {
            conversationId: parseInt(conversationId),
            senderId: { not: user.id },
            isRead: false
        },
        data: { isRead: true }
    });

    return successResponse({ messages });
});

// POST /api/chat/messages - Send a message
export const POST = apiHandler(async (request) => {
    const user = await authenticate(request);
    if (!user) return errorResponse('Unauthorized', 401);

    const { conversationId, content } = await request.json();

    if (!conversationId || !content) {
        return errorResponse('Conversation ID and content are required', 400);
    }

    // Verify user is part of the conversation
    const conversation = await prisma.chatConversation.findFirst({
        where: {
            id: parseInt(conversationId),
            OR: [
                { customerId: user.id },
                { vendorId: user.id }
            ]
        }
    });

    if (!conversation) return errorResponse('Conversation not found', 404);

    const message = await prisma.chatMessage.create({
        data: {
            conversationId: parseInt(conversationId),
            senderId: user.id,
            content
        }
    });

    // Update conversation timestamp
    await prisma.chatConversation.update({
        where: { id: parseInt(conversationId) },
        data: { updatedAt: new Date() }
    });

    return successResponse({ message });
});
