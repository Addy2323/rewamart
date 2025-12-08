const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- USERS ---');
        const users = await prisma.user.findMany();
        users.forEach(u => console.log(`ID: ${u.id}, Name: "${u.name}", Role: ${u.role}, Email: ${u.email}`));

        console.log('\n--- PRODUCTS ---');
        const products = await prisma.product.findMany();
        products.forEach(p => console.log(`ID: ${p.id}, Name: "${p.name}", Vendor: "${p.vendor}"`));

        console.log('\n--- ORDERS ---');
        const orders = await prisma.order.findMany({
            include: {
                items: {
                    include: {
                        product: true
                    }
                }
            }
        });

        orders.forEach(o => {
            console.log(`Order #${o.id} (User ID: ${o.userId})`);
            o.items.forEach(i => {
                console.log(`  - Item: ${i.product.name}, Vendor: "${i.product.vendor}"`);
            });
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
