import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Get today's start date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch products created today, or just the latest 10 if none today
    const newProducts = await prisma.product.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        category: true,
      },
    });

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
