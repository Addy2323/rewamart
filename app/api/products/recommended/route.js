import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // For now, we'll return random products as recommendations
    // In a real app, you'd use the userId to fetch order history and recommend based on that

    const productCount = await prisma.product.count();
    const skip = Math.max(0, Math.floor(Math.random() * (productCount - 8)));

    const recommendedProducts = await prisma.product.findMany({
      take: 8,
      skip: skip,
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      products: recommendedProducts,
      source: 'recommended',
    });
  } catch (error) {
    console.error('Error fetching recommended products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommended products' },
      { status: 500 }
    );
  }
}
