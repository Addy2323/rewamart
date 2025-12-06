import { apiHandler, requireAuth, successResponse } from '@/lib/middleware';

export const GET = apiHandler(async (request) => {
    const authResult = await requireAuth(request);

    if (!authResult.authenticated) {
        return authResult.response;
    }

    return successResponse({
        user: authResult.user,
    });
});
