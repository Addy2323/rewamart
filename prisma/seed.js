const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Starting database seed...');

    // Clear existing data (in development)
    if (process.env.NODE_ENV === 'development') {
        console.log('Clearing existing data...');
        await prisma.cashback.deleteMany();
        await prisma.walletTransaction.deleteMany();
        await prisma.investment.deleteMany();
        await prisma.investmentPlan.deleteMany();
        await prisma.referral.deleteMany();
        await prisma.orderItem.deleteMany();
        await prisma.order.deleteMany();
        await prisma.address.deleteMany();
        await prisma.product.deleteMany();
        await prisma.category.deleteMany();
        await prisma.user.deleteMany();
    }

    // Create Admin User
    console.log('Creating admin user...');
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
        data: {
            email: 'admin@rewamart.com',
            password: hashedAdminPassword,
            name: 'Admin User',
            phone: '+255700000000',
            role: 'admin',
            referralCode: 'ADMIN001',
            walletBalance: 0,
        },
    });

    // Create Test Customer
    console.log('Creating test customer...');
    const hashedCustomerPassword = await bcrypt.hash('customer123', 10);
    const customer = await prisma.user.create({
        data: {
            email: 'customer@test.com',
            password: hashedCustomerPassword,
            name: 'Test Customer',
            phone: '+255711111111',
            role: 'customer',
            referralCode: 'TESTCUST001',
            walletBalance: 50000, // 50,000 TZS for testing
        },
    });

    // Create Categories
    console.log('Creating categories...');
    const categories = await Promise.all([
        prisma.category.create({
            data: {
                name: 'Electronics',
                slug: 'electronics',
                description: 'Latest gadgets and electronics',
                image: '/images/categories/electronics.jpg',
            },
        }),
        prisma.category.create({
            data: {
                name: 'Fashion',
                slug: 'fashion',
                description: 'Trendy clothing and accessories',
                image: '/images/categories/fashion.jpg',
            },
        }),
        prisma.category.create({
            data: {
                name: 'Home & Living',
                slug: 'home-living',
                description: 'Furniture and home decor',
                image: '/images/categories/home.jpg',
            },
        }),
        prisma.category.create({
            data: {
                name: 'Health & Beauty',
                slug: 'health-beauty',
                description: 'Personal care and beauty products',
                image: '/images/categories/health.jpg',
            },
        }),
        prisma.category.create({
            data: {
                name: 'Groceries',
                slug: 'groceries',
                description: 'Fresh food and daily essentials',
                image: '/images/categories/groceries.jpg',
            },
        }),
    ]);

    // Create Products
    console.log('Creating products...');
    const products = [
        // Electronics
        {
            name: 'Samsung Galaxy A54',
            description: 'Premium smartphone with 128GB storage, 6GB RAM, and excellent camera',
            price: 850000,
            image: '/images/products/samsung-a54.jpg',
            categoryId: categories[0].id,
            stockCount: 25,
            cashbackRate: 7.0,
            vendor: 'TechMart TZ',
            rating: 4.5,
            reviewCount: 42,
        },
        {
            name: 'HP Laptop 15-inch',
            description: 'Intel Core i5, 8GB RAM, 512GB SSD, perfect for work and study',
            price: 1850000,
            image: '/images/products/hp-laptop.jpg',
            categoryId: categories[0].id,
            stockCount: 15,
            cashbackRate: 8.0,
            vendor: 'Computer World',
            rating: 4.7,
            reviewCount: 28,
        },
        // Fashion
        {
            name: 'Nike Air Max Sneakers',
            description: 'Comfortable and stylish sneakers for everyday wear',
            price: 180000,
            image: '/images/products/nike-sneakers.jpg',
            categoryId: categories[1].id,
            stockCount: 40,
            cashbackRate: 5.0,
            vendor: 'Fashion Hub',
            rating: 4.3,
            reviewCount: 65,
        },
        {
            name: 'Designer Handbag',
            description: 'Elegant leather handbag for modern women',
            price: 120000,
            image: '/images/products/handbag.jpg',
            categoryId: categories[1].id,
            stockCount: 30,
            cashbackRate: 6.0,
            vendor: 'Luxury Brands',
            rating: 4.6,
            reviewCount: 34,
        },
        // Home & Living
        {
            name: 'Queen Size Mattress',
            description: 'Memory foam mattress for ultimate comfort',
            price: 450000,
            image: '/images/products/mattress.jpg',
            categoryId: categories[2].id,
            stockCount: 12,
            cashbackRate: 7.5,
            vendor: 'Home Comfort',
            rating: 4.8,
            reviewCount: 56,
        },
        {
            name: 'Smart LED TV 43-inch',
            description: 'Full HD Smart TV with streaming apps',
            price: 680000,
            image: '/images/products/smart-tv.jpg',
            categoryId: categories[2].id,
            stockCount: 18,
            cashbackRate: 8.0,
            vendor: 'Electronics Plus',
            rating: 4.4,
            reviewCount: 41,
        },
        // Health & Beauty
        {
            name: 'Skincare Set Premium',
            description: 'Complete skincare routine with natural ingredients',
            price: 95000,
            image: '/images/products/skincare.jpg',
            categoryId: categories[3].id,
            stockCount: 50,
            cashbackRate: 5.5,
            vendor: 'Beauty Paradise',
            rating: 4.7,
            reviewCount: 89,
        },
        {
            name: 'Fitness Tracker Watch',
            description: 'Monitor your health with step counter and heart rate tracking',
            price: 150000,
            image: '/images/products/fitness-watch.jpg',
            categoryId: categories[3].id,
            stockCount: 35,
            cashbackRate: 6.0,
            vendor: 'Health Tech',
            rating: 4.2,
            reviewCount: 47,
        },
        // Groceries
        {
            name: 'Rice 25kg Bag',
            description: 'Premium quality Tanzanian rice',
            price: 75000,
            image: '/images/products/rice.jpg',
            categoryId: categories[4].id,
            stockCount: 100,
            cashbackRate: 3.0,
            vendor: 'Fresh Foods',
            rating: 4.6,
            reviewCount: 124,
        },
        {
            name: 'Cooking Oil 5L',
            description: 'Pure vegetable cooking oil',
            price: 28000,
            image: '/images/products/cooking-oil.jpg',
            categoryId: categories[4].id,
            stockCount: 80,
            cashbackRate: 2.5,
            vendor: 'Daily Essentials',
            rating: 4.5,
            reviewCount: 98,
        },
    ];

    for (const product of products) {
        await prisma.product.create({ data: product });
    }

    // Create Investment Plans
    console.log('Creating investment plans...');
    await Promise.all([
        prisma.investmentPlan.create({
            data: {
                name: 'Basic',
                minAmount: 50000,
                maxAmount: 499999,
                returnRate: 12.0, // 12% annual
                duration: 90, // 90 days
                description: 'Perfect for beginners looking to start their investment journey',
                features: [
                    '12% annual return',
                    '90-day lock period',
                    'Minimum investment: 50,000 TZS',
                    'Low risk investment',
                    'Flexible withdrawal after maturity',
                ],
            },
        }),
        prisma.investmentPlan.create({
            data: {
                name: 'Standard',
                minAmount: 500000,
                maxAmount: 1999999,
                returnRate: 15.0, // 15% annual
                duration: 180, // 180 days
                description: 'Balanced investment plan for growing your wealth',
                features: [
                    '15% annual return',
                    '180-day lock period',
                    'Minimum investment: 500,000 TZS',
                    'Medium risk investment',
                    'Auto-reinvest option',
                    'Priority customer support',
                ],
            },
        }),
        prisma.investmentPlan.create({
            data: {
                name: 'Premium',
                minAmount: 2000000,
                maxAmount: 4999999,
                returnRate: 18.0, // 18% annual
                duration: 365, // 1 year
                description: 'Premium investment plan with higher returns',
                features: [
                    '18% annual return',
                    '365-day lock period',
                    'Minimum investment: 2,000,000 TZS',
                    'Medium-high risk investment',
                    'Monthly interest payouts',
                    'Dedicated account manager',
                    'Investment insurance',
                ],
            },
        }),
        prisma.investmentPlan.create({
            data: {
                name: 'Elite',
                minAmount: 5000000,
                maxAmount: null,
                returnRate: 22.0, // 22% annual
                duration: 365, // 1 year
                description: 'Exclusive plan for high-value investors',
                features: [
                    '22% annual return',
                    '365-day lock period',
                    'Minimum investment: 5,000,000 TZS',
                    'High-yield investment',
                    'Quarterly bonus payouts',
                    'VIP customer service',
                    'Comprehensive insurance',
                    'Exclusive investment opportunities',
                    'Tax advisory services',
                ],
            },
        }),
    ]);

    console.log('Seed completed successfully!');
    console.log('-----------------------------------');
    console.log('Admin Login:');
    console.log('  Email: admin@rewamart.com');
    console.log('  Password: admin123');
    console.log('');
    console.log('Test Customer Login:');
    console.log('  Email: customer@test.com');
    console.log('  Password: customer123');
    console.log('  Wallet Balance: 50,000 TZS');
    console.log('-----------------------------------');
}

main()
    .catch((e) => {
        console.error('Error during seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
