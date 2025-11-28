// app/api/products/random/route.js
import { NextResponse } from 'next/server';

const mockProducts = [
  { id: 1, name: 'Samsung Galaxy S24', price: 2500000, image: 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', categoryId: 1, vendor: 'Tech Store', rating: 4.8, inStock: true },
  { id: 2, name: 'MacBook Air M3', price: 3200000, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', categoryId: 2, vendor: 'Apple Store', rating: 4.9, inStock: false },
  { id: 3, name: 'Sony Headphones', price: 500000, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', categoryId: 3, vendor: 'Audio Hub', rating: 4.6, inStock: true },
  { id: 4, name: 'iPad Pro', price: 2800000, image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', categoryId: 4, vendor: 'Tech Store', rating: 4.7, inStock: true },
  { id: 5, name: 'Nike Air Max', price: 450000, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', categoryId: 5, vendor: 'Fashion Store', rating: 4.5, inStock: true },
  { id: 6, name: 'Samsung TV 55"', price: 1800000, image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', categoryId: 1, vendor: 'Electronics', rating: 4.4, inStock: false },
  { id: 7, name: 'Canon Camera', price: 1200000, image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', categoryId: 6, vendor: 'Photo Store', rating: 4.7, inStock: true },
  { id: 8, name: 'Adidas Shoes', price: 380000, image: 'https://images.unsplash.com/photo-1711719745936-ff93f602246e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8YWRpZGFzJTIwc2hvZXxlbnwwfHwwfHx8MA%3D%3D', categoryId: 5, vendor: 'Fashion Store', rating: 4.3, inStock: false },
  { id: 9, name: 'LG Monitor 27"', price: 650000, image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', categoryId: 2, vendor: 'Tech Store', rating: 4.6, inStock: true },
  { id: 10, name: 'Mechanical Keyboard', price: 280000, image: 'https://images.unsplash.com/photo-1587829191301-dc798b83add3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', categoryId: 2, vendor: 'Tech Store', rating: 4.5, inStock: true },
  { id: 11, name: 'Logitech Mouse', price: 150000, image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', categoryId: 2, vendor: 'Tech Store', rating: 4.4, inStock: false },
  { id: 12, name: 'Puma Shoes', price: 420000, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', categoryId: 5, vendor: 'Fashion Store', rating: 4.2, inStock: true },
  { id: 13, name: 'Business Suit - Navy', price: 850000, image: 'https://images.unsplash.com/photo-1591047990975-a9826e1c73d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', categoryId: 5, vendor: 'Premium Fashion', rating: 4.8, inStock: true },
  { id: 14, name: 'Formal Suit - Black', price: 920000, image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', categoryId: 5, vendor: 'Luxury Store', rating: 4.9, inStock: false },
  { id: 15, name: 'Business Suit - Gray', price: 780000, image: 'https://images.unsplash.com/photo-1598033129519-c90900bc9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', categoryId: 5, vendor: 'Premium Fashion', rating: 4.7, inStock: true },
];

export async function GET(request) {
  try {
    // Shuffle and get random 8 products
    const shuffled = [...mockProducts].sort(() => Math.random() - 0.5);
    const randomProducts = shuffled.slice(0, 8);

    return NextResponse.json({
      products: randomProducts,
      source: 'random',
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error fetching random products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch random products' },
      { status: 500 }
    );
  }
}
