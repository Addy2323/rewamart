import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const productCount = await prisma.product.count();
    const skip = Math.max(0, Math.floor(Math.random() * (productCount - 8)));

    const randomProducts = await prisma.product.findMany({
      take: 8,
      skip: skip,
      include: {
        category: true,
      },
    });

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
