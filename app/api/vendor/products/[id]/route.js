// app/api/vendor/products/[id]/route.js
import { NextResponse } from 'next/server';

// Mock database for vendor products
let vendorProducts = [
    { id: 1, name: 'Samsung Galaxy S24', price: 2500000, image: 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', vendor: 'Tech Store', description: 'Latest flagship phone', inStock: true, rating: 4.8, cashback: 5 },
    { id: 2, name: 'MacBook Air M3', price: 3200000, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', vendor: 'Apple Store', description: 'Powerful laptop', inStock: false, rating: 4.9, cashback: 3 },
];

export async function GET(request, { params }) {
    try {
        const id = Number(params.id);
        const product = vendorProducts.find(p => p.id === id);

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ product });
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json(
            { error: 'Failed to fetch product' },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    try {
        const id = Number(params.id);
        const body = await request.json();

        const productIndex = vendorProducts.findIndex(p => p.id === id);

        if (productIndex === -1) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        vendorProducts[productIndex] = {
            ...vendorProducts[productIndex],
            name: body.name || vendorProducts[productIndex].name,
            price: body.price ? Number(body.price) : vendorProducts[productIndex].price,
            image: body.image || vendorProducts[productIndex].image,
            vendor: body.vendor || vendorProducts[productIndex].vendor,
            description: body.description || vendorProducts[productIndex].description,
            inStock: body.inStock !== undefined ? body.inStock : vendorProducts[productIndex].inStock,
            rating: body.rating ? Number(body.rating) : vendorProducts[productIndex].rating,
            cashback: body.cashback !== undefined ? Number(body.cashback) : vendorProducts[productIndex].cashback,
        };

        return NextResponse.json({
            message: 'Product updated successfully',
            product: vendorProducts[productIndex],
        });
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json(
            { error: 'Failed to update product' },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        const id = Number(params.id);
        const productIndex = vendorProducts.findIndex(p => p.id === id);

        if (productIndex === -1) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        const deletedProduct = vendorProducts.splice(productIndex, 1);

        return NextResponse.json({
            message: 'Product deleted successfully',
            product: deletedProduct[0],
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json(
            { error: 'Failed to delete product' },
            { status: 500 }
        );
    }
}
