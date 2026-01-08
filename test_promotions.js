const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const promotions = await prisma.promotion.findMany({
        where: {
            type: 'free_shipping',
            isActive: true
        }
    });
    console.log('Active Free Shipping Promotions:', JSON.stringify(promotions, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
