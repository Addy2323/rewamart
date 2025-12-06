import { apiHandler, requireAuth, successResponse, errorResponse } from '@/lib/middleware';
import prisma from '@/lib/prisma';

// POST /api/investments/auto-invest - Toggle auto-invest setting
export const POST = apiHandler(async (request) => {
    const authResult = await requireAuth(request);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const body = await request.json();
    const { enabled } = body;

    if (typeof enabled !== 'boolean') {
        return errorResponse('enabled field must be a boolean');
    }

    const user = await prisma.user.update({
        where: { id: authResult.user.id },
        data: { autoInvest: enabled },
        select: {
            autoInvest: true,
        },
    });

    return successResponse({
        message: `Auto-invest ${enabled ? 'enabled' : 'disabled'} successfully`,
        autoInvest: user.autoInvest,
    });
});

// GET /api/investments/auto-invest - Get auto-invest status
export const GET = apiHandler(async (request) => {
    const authResult = await requireAuth(request);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const user = await prisma.user.findUnique({
        where: { id: authResult.user.id },
        select: {
            autoInvest: true,
        },
    });

    return successResponse({
        autoInvest: user.autoInvest,
    });
});
