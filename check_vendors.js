const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        where: {
            role: {
                in: ['vendor', 'VENDOR', 'Vendor']
            }
        }
    });
    console.log('Users with vendor role:', JSON.stringify(users, null, 2));

    const productVendors = await prisma.product.groupBy({
        by: ['vendor'],
        _count: {
            vendor: true
        }
    });
    console.log('Vendors in Product table:', JSON.stringify(productVendors, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
