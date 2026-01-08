const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const vendors = await prisma.product.groupBy({
        by: ['vendor'],
        _count: {
            vendor: true
        }
    });
    console.log('Vendors and product counts:', JSON.stringify(vendors, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
