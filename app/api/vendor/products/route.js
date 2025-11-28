// app/api/vendor/products/route.js
import { NextResponse } from 'next/server';

// Mock database for vendor products
let vendorProducts = [
    { id: 1, name: 'Samsung Galaxy S24', price: 2500000, image: 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', vendor: 'Tech Store', description: 'Latest flagship phone', inStock: true, rating: 4.8, cashback: 5 },
    { id: 2, name: 'MacBook Air M3', price: 3200000, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', vendor: 'Apple Store', description: 'Powerful laptop', inStock: false, rating: 4.9, cashback: 3 },
];

export async function GET(request) {
    try {
        return NextResponse.json({
            products: vendorProducts,
            count: vendorProducts.length,
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

        const newProduct = {
            id: Math.max(...vendorProducts.map(p => p.id), 0) + 1,
            name: body.name,
            price: Number(body.price),
            image: body.image || 'https://via.placeholder.com/500',
            vendor: body.vendor,
            description: body.description || '',
            inStock: body.inStock !== false,
            rating: Number(body.rating) || 4.5,
            cashback: Number(body.cashback) || 0,
        };

        vendorProducts.push(newProduct);

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
