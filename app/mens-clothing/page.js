'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Search } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import { getAllProducts } from '../../lib/products';

export default function MensClothingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [activeSubcategory, setActiveSubcategory] = useState('all');

    const subcategories = [
        { id: 'all', name: 'All' },
        { id: 'shoes', name: 'Shoes' },
        { id: 'sneakers', name: 'Sneakers' },
        { id: 'suits', name: 'Suits' },
        { id: 'slip-ons', name: 'Slip ons' },
    ];

    useEffect(() => {
        const loadProducts = async () => {
            const allProducts = await getAllProducts();
            const mensProducts = allProducts.filter(p => {
                // Handle category which might be an object (from Prisma) or a string
                const categoryName = p.category && typeof p.category === 'object'
                    ? p.category.name
                    : String(p.category || '');

                const categoryStr = categoryName.toLowerCase();
                const nameStr = String(p.name || '').toLowerCase();

                return categoryStr.includes('men') ||
                    categoryStr.includes('shoes') ||
                    categoryStr.includes('fashion') ||
                    nameStr.includes('men') ||
                    nameStr.includes('shoe');
            });
            setProducts(mensProducts);
            setFilteredProducts(mensProducts);
        };

        loadProducts();
    }, []);

    useEffect(() => {
        const subcategory = searchParams.get('subcategory') || 'all';
        setActiveSubcategory(subcategory);

        if (subcategory === 'all') {
            setFilteredProducts(products);
        } else {
            const filtered = products.filter(p => {
                const subcatStr = String(p.subcategory || '').toLowerCase().replace(/\s+/g, '-');
                const nameStr = String(p.name || '').toLowerCase();
                return subcatStr === subcategory.toLowerCase() ||
                    nameStr.includes(subcategory.replace('-', ' ').toLowerCase());
            });
            setFilteredProducts(filtered);
        }
    }, [searchParams, products]);

    const handleSubcategoryClick = (subcategoryId) => {
        if (subcategoryId === 'all') {
            router.push('/mens-clothing');
        } else {
            router.push(`/mens-clothing?subcategory=${subcategoryId}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
            <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-10">
                <div className="flex items-center p-4">
                    <button
                        onClick={() => router.back()}
                        className="mr-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                    >
                        <ArrowLeft size={24} className="text-gray-700 dark:text-gray-300" />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white flex-1">
                        Men's Clothing
                    </h1>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <Search size={24} className="text-gray-700 dark:text-gray-300" />
                    </button>
                </div>

                <div className="flex space-x-4 px-4 pb-3 overflow-x-auto scrollbar-hide">
                    {subcategories.map((sub) => (
                        <button
                            key={sub.id}
                            onClick={() => handleSubcategoryClick(sub.id)}
                            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeSubcategory === sub.id
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            {sub.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                </p>

                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400">
                            No products found in this category
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
