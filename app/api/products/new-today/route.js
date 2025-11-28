// app/api/products/new-today/route.js
import { NextResponse } from 'next/server';

const mockProducts = [
  { id: 1, name: 'Samsung Galaxy S24', price: 2500000, image: 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', categoryId: 1, vendor: 'Tech Store', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), inStock: true },
  { id: 2, name: 'MacBook Air M3', price: 3200000, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', categoryId: 2, vendor: 'Apple Store', createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), inStock: false },
  { id: 3, name: 'Sony Headphones', price: 500000, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', categoryId: 3, vendor: 'Audio Hub', createdAt: new Date(Date.now() - 30 * 60 * 1000), inStock: true },
  { id: 4, name: 'iPad Pro', price: 2800000, image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', categoryId: 4, vendor: 'Tech Store', createdAt: new Date(Date.now() - 15 * 60 * 1000), inStock: true },
  { id: 5, name: 'Nike Air Max', price: 450000, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', categoryId: 5, vendor: 'Fashion Store', createdAt: new Date(Date.now() - 10 * 60 * 1000), inStock: true },
  { id: 6, name: 'Samsung TV 55"', price: 1800000, image: 'https://images.unsplash.com/photo-1601944179066-29786cb9d32a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2Ftc3VuZyUyMHR2fGVufDB8fDB8fHww', categoryId: 1, vendor: 'Electronics', createdAt: new Date(Date.now() - 5 * 60 * 1000), inStock: false },
  { id: 7, name: 'Canon Camera', price: 1200000, image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', categoryId: 6, vendor: 'Photo Store', createdAt: new Date(Date.now() - 2 * 60 * 1000), inStock: true },
  { id: 8, name: 'Adidas Shoes', price: 380000, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', categoryId: 5, vendor: 'Fashion Store', createdAt: new Date(Date.now() - 1 * 60 * 1000), inStock: false },
  { id: 9, name: 'LG Monitor 27"', price: 650000, image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', categoryId: 2, vendor: 'Tech Store', createdAt: new Date(), inStock: true },
  { id: 10, name: 'Mechanical Keyboard', price: 280000, image: 'https://images.unsplash.com/photo-1587829191301-dc798b83add3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', categoryId: 2, vendor: 'Tech Store', createdAt: new Date(), inStock: true },
  { id: 11, name: 'Business Suit - Navy', price: 850000, image: 'https://images.unsplash.com/photo-1591047990975-a9826e1c73d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', categoryId: 5, vendor: 'Premium Fashion', createdAt: new Date(), inStock: true },
  { id: 12, name: 'Formal Suit - Black', price: 920000, image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', categoryId: 5, vendor: 'Luxury Store', createdAt: new Date(), inStock: false },
  { id: 13, name: 'Business Suit - Gray', price: 780000, image: 'https://images.unsplash.com/photo-1598033129519-c90900bc9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', categoryId: 5, vendor: 'Premium Fashion', createdAt: new Date(), inStock: true },
];

export async function GET(request) {
  try {
    // Sort by creation date (newest first) and get top 10
    const newProducts = mockProducts
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    return NextResponse.json({
      products: newProducts,
      count: newProducts.length,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error fetching new products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch new products' },
      { status: 500 }
    );
  }
}
