import { apiHandler, authenticate, successResponse, errorResponse } from '@/lib/middleware';
import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';

// GET /api/admin/vendors - List all vendors
export const GET = apiHandler(async (request) => {
    const user = await authenticate(request);

    // Ensure user is admin
    if (!user || user.role !== 'admin') {
        return errorResponse('Unauthorized access', 403);
    }

    const vendors = await prisma.user.findMany({
        where: { role: 'vendor' },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true
        },
        orderBy: { createdAt: 'desc' }
    });

    return successResponse({ success: true, vendors }, 200);
});

// POST /api/admin/vendors - Add a new vendor
export const POST = apiHandler(async (request) => {
    const user = await authenticate(request);

    // Ensure user is admin
    if (!user || user.role !== 'admin') {
        return errorResponse('Unauthorized access', 403);
    }

    const { name, email, password, phone } = await request.json();

    if (!name || !email || !password) {
        return errorResponse('Missing required fields', 400);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
        where: {
            OR: [
                { email },
                { phone: phone || undefined }
            ]
        }
    });

    if (existingUser) {
        return errorResponse('User with this email or phone already exists', 409);
    }

    const hashedPassword = await hash(password, 10);

    // Generate a unique referral code
    const referralCode = name.substring(0, 3).toUpperCase() + Math.floor(1000 + Math.random() * 9000);

    const newVendor = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            phone,
            role: 'vendor',
            referralCode,
            walletBalance: 0
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true
        }
    });

    return successResponse({ success: true, vendor: newVendor }, 201);
});

// DELETE /api/admin/vendors - Remove a vendor
export const DELETE = apiHandler(async (request) => {
    const user = await authenticate(request);

    // Ensure user is admin
    if (!user || user.role !== 'admin') {
        return errorResponse('Unauthorized access', 403);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return errorResponse('Vendor ID is required', 400);
    }

    const vendorId = parseInt(id);

    // Verify user exists and is a vendor
    const vendor = await prisma.user.findUnique({
        where: { id: vendorId }
    });

    if (!vendor) {
        return errorResponse('User not found', 404);
    }

    if (vendor.role !== 'vendor') {
        return errorResponse('User is not a vendor', 400);
    }

    await prisma.user.delete({
        where: { id: vendorId }
    });

    return successResponse({ success: true, message: 'Vendor removed successfully' }, 200);
});
