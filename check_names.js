const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({
        take: 5,
        select: { id: true, name: true, vendor: true }
    });
    console.log('Sample Products:');
    console.log(JSON.stringify(products, null, 2));

    const promos = await prisma.promotion.findMany({
        select: { id: true, title: true, vendorName: true }
    });
    console.log('Promotions:');
    console.log(JSON.stringify(promos, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
