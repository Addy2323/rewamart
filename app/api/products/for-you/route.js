import { NextResponse } from 'next/server';
import { getUserById } from '../../../../lib/auth';
import { getAllProducts } from '../../../../lib/products';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = getUserById(userId);

    if (!user || !user.profile || !user.profile.preferredCategories) {
        return NextResponse.json({ products: [], count: 0 });
    }

    const allProducts = getAllProducts();
    const preferredCategories = user.profile.preferredCategories;

    const recommendedProducts = allProducts.filter(product =>
        preferredCategories.includes(product.category.toLowerCase())
    );

    return NextResponse.json({
        products: recommendedProducts,
        count: recommendedProducts.length,
    });
}
