import prisma from '@/lib/prisma';
import { apiHandler, requireAdmin, requireAuth, successResponse, errorResponse } from '@/lib/middleware';

// GET /api/products - Get all products with filters and pagination
export const GET = apiHandler(async (request) => {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const vendor = searchParams.get('vendor');
    const search = searchParams.get('search');
    const freeShipping = searchParams.get('freeShipping') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Get vendors with active free shipping promotions
    let freeShippingVendors = [];
    if (freeShipping) {
        const activePromotions = await prisma.promotion.findMany({
            where: {
                type: 'free_shipping',
                isActive: true,
                startDate: { lte: new Date() },
                endDate: { gte: new Date() },
            },
            select: { vendorName: true },
        });
        freeShippingVendors = activePromotions.map(p => p.vendorName);
    }

    const where = {
        ...(category && { category: { slug: category } }),
        ...(vendor && { vendor: vendor }),
        ...(freeShipping && { vendor: { in: freeShippingVendors } }),
        ...(search && {
            OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ],
        }),
    };

    // Get all vendors with active free shipping promotions to mark products
    const allActiveFreeShippingPromotions = await prisma.promotion.findMany({
        where: {
            type: 'free_shipping',
            isActive: true,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
        },
        select: { vendorName: true },
    });
    const allFreeShippingVendors = new Set(allActiveFreeShippingPromotions.map(p => p.vendorName));

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        }),
        prisma.product.count({ where }),
    ]);

    const productsWithShippingInfo = products.map(p => ({
        ...p,
        hasFreeShipping: allFreeShippingVendors.has(p.vendor)
    }));

    return successResponse({
        products: productsWithShippingInfo,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    });
});

// POST /api/products - Create new product (Admin or Vendor)
export const POST = apiHandler(async (request) => {
    const authResult = await requireAuth(request);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const { user } = authResult;
    if (user.role !== 'admin' && user.role !== 'vendor') {
        return errorResponse('Unauthorized access', 403);
    }

    const body = await request.json();
    const {
        name,
        description,
        price,
        image,
        images,
        categoryId,
        subcategory,
        stockCount,
        cashbackRate,
        vendor,
    } = body;

    if (!name || !description || !price || !categoryId) {
        return errorResponse('Name, description, price, and category are required');
    }

    const product = await prisma.product.create({
        data: {
            name,
            description,
            price: parseFloat(price),
            image: image || '/images/products/default.jpg',
            images: images || [],
            categoryId: parseInt(categoryId),
            subcategory: subcategory || null,
            stockCount: stockCount || 0,
            cashbackRate: cashbackRate || 5.0,
            vendor: vendor || 'RewaMart',
        },
        include: {
            category: true,
        },
    });

    return successResponse({ product }, 201);
});
