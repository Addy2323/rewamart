const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({
        take: 5,
        select: { vendor: true }
    });
    console.log('Product Vendors:');
    products.forEach(p => {
        console.log(`"${p.vendor}" (length: ${p.vendor ? p.vendor.length : 0})`);
    });

    const promos = await prisma.promotion.findMany({
        select: { vendorName: true }
    });
    console.log('\nPromotion Vendors:');
    promos.forEach(p => {
        console.log(`"${p.vendorName}" (length: ${p.vendorName ? p.vendorName.length : 0})`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
