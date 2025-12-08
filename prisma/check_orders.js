const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const orders = await prisma.order.findMany({
            include: {
                user: true,
                items: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        console.log(`Found ${orders.length} orders in the database.`);

        orders.forEach(order => {
            console.log(`\nOrder #${order.id} - Status: ${order.status}`);
            console.log(`User: ${order.user.name} (${order.user.email})`);
            console.log(`Total: ${order.totalAmount}`);
            console.log(`Created: ${order.createdAt}`);
            console.log('Items:');
            order.items.forEach(item => {
                console.log(`  - ${item.product.name} x${item.quantity}`);
            });
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
