// app/api/vendor/products/route.js
import { NextResponse } from 'next/server';

// Note: In a real app, this would use a database. 
// For now, we're using localStorage via the client-side storage library.
// The vendor dashboard saves directly to localStorage with STORAGE_KEYS.VENDOR_PRODUCTS

export async function GET(request) {
    try {
        // Return empty array - actual products are fetched from client-side storage
        // The shop page uses getAllProducts() which combines default products with vendor products from storage
        return NextResponse.json({
            products: [],
            count: 0,
            message: 'Vendor products are stored client-side. Use getAllProducts() from lib/products.js'
        });
    } catch (error) {
        console.error('Error fetching vendor products:', error);
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}

export async function POST(request) {
    try {
        const body = await request.json();

        if (!body.name || !body.price || !body.vendor) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Return success - actual saving happens on client-side
        const newProduct = {
            id: 'vendor_' + Date.now(),
            name: body.name,
            price: Number(body.price),
            image: body.image || 'https://via.placeholder.com/500',
            vendor: body.vendor,
            description: body.description || '',
            inStock: body.inStock !== false,
            rating: Number(body.rating) || 4.5,
            cashback: Number(body.cashback) || 0,
            cashbackRate: Number(body.cashback) || 0,
        };

        return NextResponse.json({
            message: 'Product created successfully',
            product: newProduct,
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { error: 'Failed to create product' },
            { status: 500 }
        );
    }
}
