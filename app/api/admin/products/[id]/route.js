// app/api/admin/products/[id]/route.js
import { NextResponse } from 'next/server';

// Mock database - replace with Prisma in production
let mockProducts = [
  { id: 1, name: 'Samsung Galaxy S24', price: 2500000, image: 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', categoryId: 1, vendor: 'Tech Store', inStock: true, description: 'Latest Samsung flagship phone', rating: 4.8 },
  { id: 2, name: 'MacBook Air M3', price: 3200000, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', categoryId: 2, vendor: 'Apple Store', inStock: false, description: 'Powerful laptop for professionals', rating: 4.9 },
  { id: 3, name: 'Sony Headphones', price: 500000, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', categoryId: 3, vendor: 'Audio Hub', inStock: true, description: 'Premium noise-cancelling headphones', rating: 4.6 },
];

export async function GET(request, { params }) {
  try {
    const id = Number(params.id);
    const product = mockProducts.find(p => p.id === id);

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

    const productIndex = mockProducts.findIndex(p => p.id === id);

    if (productIndex === -1) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Update product
    mockProducts[productIndex] = {
      ...mockProducts[productIndex],
      name: body.name || mockProducts[productIndex].name,
      price: body.price ? Number(body.price) : mockProducts[productIndex].price,
      image: body.image || mockProducts[productIndex].image,
      categoryId: body.categoryId ? Number(body.categoryId) : mockProducts[productIndex].categoryId,
      vendor: body.vendor || mockProducts[productIndex].vendor,
      inStock: body.inStock !== undefined ? body.inStock : mockProducts[productIndex].inStock,
      description: body.description || mockProducts[productIndex].description,
      rating: body.rating ? Number(body.rating) : mockProducts[productIndex].rating,
    };

    return NextResponse.json({
      message: 'Product updated successfully',
      product: mockProducts[productIndex],
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
    const productIndex = mockProducts.findIndex(p => p.id === id);

    if (productIndex === -1) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const deletedProduct = mockProducts.splice(productIndex, 1);

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
