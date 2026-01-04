const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Attempting to update promotion with ID 3...');
        const promotion = await prisma.promotion.update({
            where: { id: 3 },
            data: {
                title: 'Test Update ' + new Date().getTime(),
                targetProductId: null
            }
        });
        console.log('Update successful:', promotion);
    } catch (error) {
        console.error('Update failed with error:');
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
