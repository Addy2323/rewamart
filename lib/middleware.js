import { extractToken, getUserFromToken } from './authBackend';

// CORS headers for API responses
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
};

/**
 * Get CORS headers - can be customized per request if needed
 */
export function getCorsHeaders() {
    return corsHeaders;
}

/**
 * Handle OPTIONS preflight requests
 */
export function handleCors(request) {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: corsHeaders,
        });
    }
    return null;
}

/**
 * Middleware to authenticate API requests
 * Returns user if authenticated, null otherwise
 */
export async function authenticate(request) {
    const token = extractToken(request);
    if (!token) {
        return null;
    }

    const user = await getUserFromToken(token);
    return user;
}

/**
 * Middleware to require authentication
 * Returns response with 401 if not authenticated
 */
export async function requireAuth(request) {
    const user = await authenticate(request);

    if (!user) {
        return {
            authenticated: false,
            response: new Response(
                JSON.stringify({ error: 'Authentication required' }),
                {
                    status: 401,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders }
                }
            )
        };
    }

    return { authenticated: true, user };
}

/**
 * Middleware to require admin role
 */
export async function requireAdmin(request) {
    const authResult = await requireAuth(request);

    if (!authResult.authenticated) {
        return authResult;
    }

    if (authResult.user.role !== 'admin') {
        return {
            authenticated: false,
            response: new Response(
                JSON.stringify({ error: 'Admin access required' }),
                {
                    status: 403,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders }
                }
            )
        };
    }

    return authResult;
}

/**
 * Error handler wrapper for API routes
 */
export function apiHandler(handler) {
    return async (request, context) => {
        // Handle OPTIONS preflight requests
        const corsResponse = handleCors(request);
        if (corsResponse) {
            return corsResponse;
        }

        try {
            return await handler(request, context);
        } catch (error) {
            console.error('API Error:', error);

            return new Response(
                JSON.stringify({
                    error: 'Internal server error',
                    message: process.env.NODE_ENV === 'development' ? error.message : undefined
                }),
                {
                    status: 500,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders }
                }
            );
        }
    };
}

/**
 * Success response helper
 */
export function successResponse(data, status = 200) {
    return new Response(
        JSON.stringify(data),
        {
            status,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
    );
}

/**
 * Error response helper
 */
export function errorResponse(message, status = 400) {
    return new Response(
        JSON.stringify({ error: message }),
        {
            status,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
    );
}
