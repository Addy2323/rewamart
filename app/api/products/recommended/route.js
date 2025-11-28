// app/api/products/recommended/route.js
import { NextResponse } from 'next/server';

// Mock database - replace with Prisma in production
const mockProducts = [
  { id: 1, name: 'Samsung Galaxy S24', price: 2500000, image: 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', categoryId: 1, vendor: 'Tech Store', inStock: true },
  { id: 2, name: 'MacBook Air M3', price: 3200000, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', categoryId: 2, vendor: 'Apple Store', inStock: false },
  { id: 3, name: 'Sony Headphones', price: 500000, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', categoryId: 3, vendor: 'Audio Hub', inStock: true },
  { id: 4, name: 'iPad Pro', price: 2800000, image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', categoryId: 4, vendor: 'Tech Store', inStock: true },
  { id: 5, name: 'Nike Air Max', price: 450000, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', categoryId: 5, vendor: 'Fashion Store', inStock: true },
  { id: 6, name: 'Samsung TV 55"', price: 1800000, image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', categoryId: 1, vendor: 'Electronics', inStock: false },
  { id: 7, name: 'Canon Camera', price: 1200000, image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', categoryId: 6, vendor: 'Photo Store', inStock: true },
  { id: 8, name: 'Adidas Shoes', price: 380000, image: 'https://images.unsplash.com/photo-1593287073863-c992914cb3e3?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YWRpZGFzJTIwc2hvZXxlbnwwfHwwfHx8MA%3D%3D', categoryId: 5, vendor: 'Fashion Store', inStock: false },
  { id: 9, name: 'Business Suit - Navy', price: 850000, image: 'https://images.unsplash.com/photo-1591047990975-a9826e1c73d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', categoryId: 5, vendor: 'Premium Fashion', inStock: true },
  { id: 10, name: 'Formal Suit - Black', price: 920000, image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', categoryId: 5, vendor: 'Luxury Store', inStock: false },
  { id: 11, name: 'Business Suit - Gray', price: 780000, image: 'https://images.unsplash.com/photo-1598033129519-c90900bc9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60', categoryId: 5, vendor: 'Premium Fashion', inStock: true },
];

const mockUserInteractions = {
  1: [
    { productId: 1, categoryId: 1, interactionType: 'view' },
    { productId: 2, categoryId: 2, interactionType: 'click' },
    { productId: 3, categoryId: 3, interactionType: 'view' },
  ],
  2: [
    { productId: 5, categoryId: 5, interactionType: 'view' },
    { productId: 8, categoryId: 5, interactionType: 'click' },
  ],
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get user interactions
    const interactions = mockUserInteractions[userId] || [];

    if (interactions.length === 0) {
      // If no interactions, return random products
      return NextResponse.json({
        products: mockProducts.sort(() => Math.random() - 0.5).slice(0, 8),
        source: 'random',
      });
    }

    // Count category interactions
    const categoryScores = {};
    interactions.forEach((interaction) => {
      const weight = interaction.interactionType === 'purchase' ? 3 : interaction.interactionType === 'click' ? 2 : 1;
      categoryScores[interaction.categoryId] = (categoryScores[interaction.categoryId] || 0) + weight;
    });

    // Get top categories
    const topCategories = Object.entries(categoryScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([catId]) => parseInt(catId));

    // Filter products by top categories
    const recommendedProducts = mockProducts
      .filter((p) => topCategories.includes(p.categoryId))
      .sort(() => Math.random() - 0.5)
      .slice(0, 8);

    // If not enough products, fill with random ones
    if (recommendedProducts.length < 8) {
      const remaining = mockProducts
        .filter((p) => !recommendedProducts.find((rp) => rp.id === p.id))
        .sort(() => Math.random() - 0.5)
        .slice(0, 8 - recommendedProducts.length);
      recommendedProducts.push(...remaining);
    }

    return NextResponse.json({
      products: recommendedProducts,
      source: 'recommended',
      topCategories,
    });
  } catch (error) {
    console.error('Error fetching recommended products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommended products' },
      { status: 500 }
    );
  }
}
