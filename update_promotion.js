const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const updated = await prisma.promotion.updateMany({
        where: { vendorName: 'kos' },
        data: { vendorName: 'koss' }
    });
    console.log('Updated promotions:', updated.count);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
