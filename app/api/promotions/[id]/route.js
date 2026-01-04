import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import fs from 'fs';
import path from 'path';

// GET: Fetch single promotion by ID
export async function GET(request, { params }) {
    try {
        const { id } = params;

        const promotion = await prisma.promotion.findUnique({
            where: { id: parseInt(id) }
        });

        if (!promotion) {
            return NextResponse.json(
                { error: 'Promotion not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ promotion });
    } catch (error) {
        console.error('Error fetching promotion:', error);
        return NextResponse.json(
            { error: 'Failed to fetch promotion' },
            { status: 500 }
        );
    }
}

// PUT: Update a promotion
export async function PUT(request, { params }) {
    try {
        const { id } = params;
        const body = await request.json();
        const {
            title,
            description,
            type,
            discountValue,
            minOrderAmount,
            startDate,
            endDate,
            isActive,
            targetCategory,
            targetProductId
        } = body;

        // Check if promotion exists
        const existing = await prisma.promotion.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Promotion not found' },
                { status: 404 }
            );
        }

        const promotion = await prisma.promotion.update({
            where: { id: parseInt(id) },
            data: {
                ...(title && { title }),
                ...(description !== undefined && { description }),
                ...(type && { type }),
                ...(discountValue !== undefined && { discountValue: discountValue ? parseFloat(discountValue) : null }),
                ...(minOrderAmount !== undefined && { minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null }),
                ...(startDate && { startDate: new Date(startDate) }),
                ...(endDate && { endDate: new Date(endDate) }),
                ...(isActive !== undefined && { isActive: isActive === true || isActive === 'true' }),
                ...(targetCategory !== undefined && { targetCategory: targetCategory ? parseInt(targetCategory) : null }),
                ...(targetProductId !== undefined && { targetProductId: targetProductId ? parseInt(targetProductId) : null })
            }
        });

        return NextResponse.json({ promotion });
    } catch (error) {
        console.error('Error updating promotion:', error);
        try {
            fs.appendFileSync('api_errors.log', `[${new Date().toISOString()}] PUT /api/promotions/${id}: ${error.stack}\n`);
        } catch (e) { }
        return NextResponse.json(
            { error: 'Failed to update promotion', details: error.message },
            { status: 500 }
        );
    }
}

// DELETE: Delete a promotion
export async function DELETE(request, { params }) {
    try {
        const { id } = params;

        // Check if promotion exists
        const existing = await prisma.promotion.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existing) {
            return NextResponse.json(
                { error: 'Promotion not found' },
                { status: 404 }
            );
        }

        await prisma.promotion.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ message: 'Promotion deleted successfully' });
    } catch (error) {
        console.error('Error deleting promotion:', error);
        return NextResponse.json(
            { error: 'Failed to delete promotion' },
            { status: 500 }
        );
    }
}
