const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProducts() {
    try {
        const products = await prisma.product.findMany({
            include: { category: true },
            take: 10
        });

        console.log(`📦 Found ${products.length} products in database:`);
        console.log('');

        products.forEach((p, i) => {
            console.log(`${i + 1}. ${p.name}`);
            console.log(`   Category: ${p.category.name}`);
            console.log(`   Current Subcategory: ${p.subcategory || '(none)'}`);
            console.log('');
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkProducts();
