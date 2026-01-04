const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const vendor = 'koss';
    const now = new Date();

    console.log('Current Date (now):', now.toISOString());
    console.log('Lenient Start Date (lte):', new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString());
    console.log('Lenient End Date (gte):', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString());

    const where = {
        vendorName: vendor,
        isActive: true,
        startDate: { lte: new Date(now.getTime() + 24 * 60 * 60 * 1000) },
        endDate: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
    };

    const promotions = await prisma.promotion.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 1
    });

    console.log('\nPromotions found:', JSON.stringify(promotions, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
