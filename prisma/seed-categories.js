const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedCategories() {
    console.log('🌱 Seeding categories...');

    try {
        // Insert Men's Clothing category
        const mensClothing = await prisma.category.upsert({
            where: { name: "Men's Clothing" },
            update: {},
            create: {
                name: "Men's Clothing",
                slug: 'mens-clothing',
                description: "Men's fashion and accessories including shoes, suits, sneakers, and more",
                image: '/images/categories/mens-clothing.jpg',
            },
        });
        console.log('✅ Created/Updated: Men\'s Clothing');

        // Insert Women's Clothing category
        const womensClothing = await prisma.category.upsert({
            where: { name: "Women's Clothing" },
            update: {},
            create: {
                name: "Women's Clothing",
                slug: 'womens-clothing',
                description: "Women's fashion and accessories including dresses, tops, suits, and more",
                image: '/images/categories/womens-clothing.jpg',
            },
        });
        console.log('✅ Created/Updated: Women\'s Clothing');

        // Insert Electronics category
        const electronics = await prisma.category.upsert({
            where: { name: 'Electronics' },
            update: {},
            create: {
                name: 'Electronics',
                slug: 'electronics',
                description: 'Electronic devices including computers, phones, and smartwatches',
                image: '/images/categories/electronics.jpg',
            },
        });
        console.log('✅ Created/Updated: Electronics');

        console.log('\n🎉 Categories seeded successfully!');
        console.log('\nCreated Categories:');
        console.log(`  - ${mensClothing.name} (ID: ${mensClothing.id})`);
        console.log(`  - ${womensClothing.name} (ID: ${womensClothing.id})`);
        console.log(`  - ${electronics.name} (ID: ${electronics.id})`);

    } catch (error) {
        console.error('❌ Error seeding categories:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedCategories()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
