import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import fs from 'fs';
import path from 'path';

// GET: Fetch promotions
// Query params: vendor (optional), active (optional, default true)
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const vendor = searchParams.get('vendor');
        const activeOnly = searchParams.get('active') !== 'false';
        const categoryId = searchParams.get('category');

        const now = new Date();

        const where = {
            ...(vendor && { vendorName: vendor }),
            ...(activeOnly && {
                isActive: true,
                // Lenient date check: start date can be up to 24 hours in the future 
                // to account for timezone differences where "today" has started for the user
                startDate: { lte: new Date(now.getTime() + 24 * 60 * 60 * 1000) },
                endDate: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
            }),
            ...(categoryId && { targetCategory: parseInt(categoryId) })
        };

        const promotions = await prisma.promotion.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: activeOnly ? 1 : 50 // Limit to 1 for customer display (max 1 popup)
        });

        return NextResponse.json({ promotions });
    } catch (error) {
        console.error('Error fetching promotions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch promotions' },
            { status: 500 }
        );
    }
}

// POST: Create a new promotion (vendor only)
export async function POST(request) {
    try {
        const body = await request.json();
        console.log('POST /api/promotions body:', body);
        const {
            vendorName,
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

        // Ensure isActive is boolean
        const finalIsActive = isActive === undefined ? true : (isActive === true || isActive === 'true');

        // Validation
        if (!vendorName || !title || !type || !startDate || !endDate) {
            return NextResponse.json(
                { error: 'Missing required fields: vendorName, title, type, startDate, endDate' },
                { status: 400 }
            );
        }

        // Validate type
        const validTypes = ['free_shipping', 'discount_percent', 'discount_fixed', 'campaign'];
        if (!validTypes.includes(type)) {
            return NextResponse.json(
                { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
                { status: 400 }
            );
        }

        // Validate discount value for discount types
        if ((type === 'discount_percent' || type === 'discount_fixed') && !discountValue) {
            return NextResponse.json(
                { error: 'discountValue is required for discount types' },
                { status: 400 }
            );
        }

        const promotion = await prisma.promotion.create({
            data: {
                vendorName,
                title,
                description,
                type,
                discountValue: discountValue ? parseFloat(discountValue) : null,
                minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                isActive: finalIsActive,
                targetCategory: targetCategory ? parseInt(targetCategory) : null,
                targetProductId: targetProductId ? parseInt(targetProductId) : null
            }
        });

        return NextResponse.json({ promotion }, { status: 201 });
    } catch (error) {
        console.error('Error creating promotion:', error);
        try {
            fs.appendFileSync('api_errors.log', `[${new Date().toISOString()}] POST /api/promotions: ${error.stack}\n`);
        } catch (e) { }
        return NextResponse.json(
            { error: 'Failed to create promotion', details: error.message },
            { status: 500 }
        );
    }
}
