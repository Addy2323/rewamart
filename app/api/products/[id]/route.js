import prisma from '@/lib/prisma';
import { apiHandler, requireAuth, successResponse, errorResponse } from '@/lib/middleware';

// GET /api/products/[id] - Get single product
export const GET = apiHandler(async (request, { params }) => {
    const id = parseInt(params.id);

    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            category: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },
        },
    });

    if (!product) {
        return errorResponse('Product not found', 404);
    }

    return successResponse({ product });
});

// PUT /api/products/[id] - Update product (Admin or Vendor owner)
export const PUT = apiHandler(async (request, { params }) => {
    const authResult = await requireAuth(request);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const id = parseInt(params.id);
    const body = await request.json();

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
        where: { id },
    });

    if (!existingProduct) {
        return errorResponse('Product not found', 404);
    }

    // Check permission: Admin or Owner
    const isOwner = existingProduct.vendor === authResult.user.name;
    const isAdmin = authResult.user.role === 'admin';

    if (!isAdmin && !isOwner) {
        return errorResponse('Unauthorized to update this product', 403);
    }

    const product = await prisma.product.update({
        where: { id },
        data: {
            name: body.name,
            description: body.description,
            price: body.price ? parseFloat(body.price) : undefined,
            image: body.image,
            categoryId: body.categoryId ? parseInt(body.categoryId) : undefined,
            inStock: body.inStock,
            stockCount: body.stockCount ? parseInt(body.stockCount) : undefined,
            cashbackRate: body.cashbackRate ? parseFloat(body.cashbackRate) : undefined,
            rating: body.rating ? parseFloat(body.rating) : undefined,
            // Prevent vendors from changing the vendor field to someone else
            vendor: isAdmin ? body.vendor : existingProduct.vendor,
        },
        include: {
            category: true,
        },
    });

    return successResponse({ product });
});

// DELETE /api/products/[id] - Delete product (Admin or Vendor owner)
export const DELETE = apiHandler(async (request, { params }) => {
    const authResult = await requireAuth(request);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const id = parseInt(params.id);

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
        where: { id },
    });

    if (!existingProduct) {
        return errorResponse('Product not found', 404);
    }

    // Check permission: Admin or Owner
    const isOwner = existingProduct.vendor === authResult.user.name;
    const isAdmin = authResult.user.role === 'admin';

    if (!isAdmin && !isOwner) {
        return errorResponse('Unauthorized to delete this product', 403);
    }

    await prisma.product.delete({
        where: { id },
    });

    return successResponse({ message: 'Product deleted successfully' });
});
