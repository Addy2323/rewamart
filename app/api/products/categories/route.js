import prisma from '@/lib/prisma';
import { apiHandler, successResponse } from '@/lib/middleware';

// GET /api/products/categories - Get all categories
export const GET = apiHandler(async (request) => {
    const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: {
                select: { products: true },
            },
        },
    });

    return successResponse({
        categories: categories.map((cat) => ({
            ...cat,
            productCount: cat._count.products,
        })),
    });
});
