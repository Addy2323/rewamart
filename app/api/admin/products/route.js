// app/api/admin/products/route.js
import { NextResponse } from 'next/server';

// Mock database - replace with Prisma in production
let mockProducts = [
  { id: 1, name: 'Samsung Galaxy S24', price: 2500000, image: 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', categoryId: 1, vendor: 'Tech Store', inStock: true, description: 'Latest Samsung flagship phone', rating: 4.8 },
  { id: 2, name: 'MacBook Air M3', price: 3200000, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', categoryId: 2, vendor: 'Apple Store', inStock: false, description: 'Powerful laptop for professionals', rating: 4.9 },
  { id: 3, name: 'Sony Headphones', price: 500000, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', categoryId: 3, vendor: 'Audio Hub', inStock: true, description: 'Premium noise-cancelling headphones', rating: 4.6 },
];

export async function GET(request) {
  try {
    return NextResponse.json({
      products: mockProducts,
      count: mockProducts.length,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.price || !body.vendor) {
      return NextResponse.json(
        { error: 'Missing required fields: name, price, vendor' },
        { status: 400 }
      );
    }

    // Create new product
    const newProduct = {
      id: Math.max(...mockProducts.map(p => p.id), 0) + 1,
      name: body.name,
      price: Number(body.price),
      image: body.image || 'https://via.placeholder.com/500',
      categoryId: Number(body.categoryId) || 1,
      vendor: body.vendor,
      inStock: body.inStock !== false,
      description: body.description || '',
      rating: Number(body.rating) || 4.5,
    };

    mockProducts.push(newProduct);

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
