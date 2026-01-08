const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({
        where: {
            vendor: 'kos'
        }
    });
    console.log('Products for vendor kos:', products.length);
    if (products.length > 0) {
        console.log('First product:', JSON.stringify(products[0], null, 2));
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
