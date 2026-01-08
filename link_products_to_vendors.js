const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany();
    const vendors = await prisma.user.findMany({
        where: { role: 'vendor' }
    });

    console.log(`Found ${products.length} products and ${vendors.length} vendors.`);

    for (const product of products) {
        const vendorUser = vendors.find(v => v.name.toLowerCase() === product.vendor.toLowerCase());
        if (vendorUser) {
            await prisma.product.update({
                where: { id: product.id },
                data: { vendorId: vendorUser.id }
            });
            console.log(`Linked product "${product.name}" to vendor "${vendorUser.name}" (ID: ${vendorUser.id})`);
        } else {
            console.log(`No vendor user found for product "${product.name}" (Vendor string: "${product.vendor}")`);
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
