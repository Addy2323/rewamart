import { storage, STORAGE_KEYS } from './storage';

export const PRODUCTS = [
    // Electronics (5-10% cashback)
    {
        id: 'e1',
        name: 'Samsung Galaxy S24',
        price: 2500000,
        category: 'electronics',
        vendor: 'TechHub TZ',
        image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80',
        rating: 4.8,
        cashback: 0.08,
        description: 'Latest Samsung flagship with AI features'
    },
    {
        id: 'e2',
        name: 'MacBook Air M2',
        price: 3200000,
        category: 'electronics',
        vendor: 'iStore Tanzania',
        image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80',
        rating: 4.9,
        cashback: 0.05,
        description: 'Supercharged by M2 chip'
    },
    {
        id: 'e3',
        name: 'Sony WH-1000XM5',
        price: 850000,
        category: 'electronics',
        vendor: 'Audio Plus',
        image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80',
        rating: 4.7,
        cashback: 0.10,
        description: 'Industry leading noise canceling headphones'
    },
    {
        id: 'e4',
        name: 'Samsung 55" 4K TV',
        price: 1800000,
        category: 'electronics',
        vendor: 'Electronics Plus',
        image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=800&q=80',
        rating: 4.6,
        cashback: 0.07,
        description: 'Crystal processor 4K UHD Smart TV'
    },
    {
        id: 'e5',
        name: 'JBL Flip 6',
        price: 350000,
        category: 'electronics',
        vendor: 'Sound City',
        image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80',
        rating: 4.5,
        cashback: 0.09,
        description: 'Portable waterproof speaker'
    },

    // Fashion (8-15% cashback)
    {
        id: 'f1',
        name: 'Nike Air Max',
        price: 250000,
        category: 'fashion',
        vendor: 'SportZone TZ',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
        rating: 4.7,
        cashback: 0.12,
        description: 'Classic comfort and style'
    },
    {
        id: 'f2',
        name: 'Official Suit',
        price: 450000,
        category: 'fashion',
        vendor: 'Executive Wear',
        image: 'https://images.unsplash.com/photo-1594938298603-c8148c47e356?auto=format&fit=crop&w=800&q=80',
        rating: 4.8,
        cashback: 0.15,
        description: 'Premium tailored business suit'
    },
    {
        id: 'f3',
        name: 'Designer Handbag',
        price: 180000,
        category: 'fashion',
        vendor: 'Fashion Hub',
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
        rating: 4.6,
        cashback: 0.10,
        description: 'Luxury leather handbag'
    },
    {
        id: 'f4',
        name: 'Sports Watch',
        price: 120000,
        category: 'fashion',
        vendor: 'Time Keepers',
        image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80',
        rating: 4.4,
        cashback: 0.08,
        description: 'Water resistant digital watch'
    },
    {
        id: 'f5',
        name: 'Sunglasses',
        price: 85000,
        category: 'fashion',
        vendor: 'Eye Style',
        image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80',
        rating: 4.5,
        cashback: 0.14,
        description: 'UV protection polarized lenses'
    },

    // Home & Garden (4-7% cashback)
    {
        id: 'h1',
        name: 'Modern Sofa Set',
        price: 1500000,
        category: 'home',
        vendor: 'Furniture Palace',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
        rating: 4.7,
        cashback: 0.05,
        description: '3-seater velvet sofa'
    },
    {
        id: 'h2',
        name: 'Coffee Maker',
        price: 150000,
        category: 'home',
        vendor: 'Home Appliances TZ',
        image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=800&q=80',
        rating: 4.6,
        cashback: 0.07,
        description: 'Programmable drip coffee maker'
    },
    {
        id: 'h3',
        name: 'Queen Bed Frame',
        price: 850000,
        category: 'home',
        vendor: 'Sleep Well',
        image: 'https://images.unsplash.com/photo-1505693416388-b0346ef414f9?auto=format&fit=crop&w=800&q=80',
        rating: 4.8,
        cashback: 0.04,
        description: 'Solid wood bed frame'
    },
    {
        id: 'h4',
        name: 'Blender Set',
        price: 120000,
        category: 'home',
        vendor: 'Kitchen Pro',
        image: 'https://images.unsplash.com/photo-1570222094114-28a9d88a2b64?auto=format&fit=crop&w=800&q=80',
        rating: 4.5,
        cashback: 0.06,
        description: 'High speed smoothie blender'
    },
    {
        id: 'h5',
        name: 'Desk Lamp',
        price: 45000,
        category: 'home',
        vendor: 'Light House',
        image: 'https://images.unsplash.com/photo-1507473888900-52e1adad5420?auto=format&fit=crop&w=800&q=80',
        rating: 4.4,
        cashback: 0.05,
        description: 'LED adjustable desk lamp'
    },

    // Health & Beauty (15-20% cashback)
    {
        id: 'b1',
        name: 'Skincare Set',
        price: 150000,
        category: 'beauty',
        vendor: 'Beauty Corner',
        image: 'https://images.unsplash.com/photo-1556228552-523cd13b86ee?auto=format&fit=crop&w=800&q=80',
        rating: 4.9,
        cashback: 0.20,
        description: 'Complete daily skincare routine'
    },
    {
        id: 'b2',
        name: 'Vitamin Supplements',
        price: 65000,
        category: 'beauty',
        vendor: 'HealthPlus Pharmacy',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
        rating: 4.8,
        cashback: 0.18,
        description: 'Multivitamins for daily health'
    },
    {
        id: 'b3',
        name: 'Yoga Mat',
        price: 45000,
        category: 'beauty',
        vendor: 'FitLife Tanzania',
        image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=800&q=80',
        rating: 4.7,
        cashback: 0.15,
        description: 'Non-slip exercise mat'
    },
    {
        id: 'b4',
        name: 'Perfume',
        price: 250000,
        category: 'beauty',
        vendor: 'Scent World',
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80',
        rating: 4.8,
        cashback: 0.16,
        description: 'Luxury floral fragrance'
    },
    {
        id: 'b5',
        name: 'Hair Dryer',
        price: 180000,
        category: 'beauty',
        vendor: 'Salon Pro',
        image: 'https://images.unsplash.com/photo-1522338140262-f46f5913618a?auto=format&fit=crop&w=800&q=80',
        rating: 4.6,
        cashback: 0.15,
        description: 'Professional ionic hair dryer'
    }
];

export const getProductsByCategory = (category) => {
    if (category === 'all') return PRODUCTS;
    return PRODUCTS.filter(p => p.category === category);
};

export const getProductById = (id) => {
    return PRODUCTS.find(p => p.id === id);
};

// Get products with dynamic cashback from storage
export const getProductsWithCashback = () => {
    const customCashback = storage.get(STORAGE_KEYS.PRODUCT_CASHBACK, {});
    return PRODUCTS.map(product => ({
        ...product,
        cashbackRate: customCashback[product.id] !== undefined ? customCashback[product.id] : Math.round(product.cashback * 100),
        inStock: true
    }));
};

// Update cashback for a product
export const updateProductCashback = (productId, cashbackRate) => {
    const customCashback = storage.get(STORAGE_KEYS.PRODUCT_CASHBACK, {});
    customCashback[productId] = cashbackRate;
    storage.set(STORAGE_KEYS.PRODUCT_CASHBACK, customCashback);
};

// Get all products for admin
export const getAllProducts = () => {
    const customCashback = storage.get(STORAGE_KEYS.PRODUCT_CASHBACK, {});
    return PRODUCTS.map(product => ({
        ...product,
        cashbackRate: customCashback[product.id] !== undefined ? customCashback[product.id] : Math.round(product.cashback * 100),
        inStock: true
    }));
};
