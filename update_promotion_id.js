const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const updated = await prisma.promotion.update({
        where: { id: 3 },
        data: { vendorName: 'koss' }
    });
    console.log('Updated promotion:', JSON.stringify(updated, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
