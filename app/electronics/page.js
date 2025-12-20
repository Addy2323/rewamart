'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Search, ShoppingCart } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import { getAllProducts } from '../../lib/products';
import { storage, STORAGE_KEYS } from '../../lib/storage';
import Toast from '../../components/Toast';

export default function ElectronicsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [activeSubcategory, setActiveSubcategory] = useState('all');
    const [cart, setCart] = useState([]);
    const [toast, setToast] = useState(null);

    const subcategories = [
        { id: 'all', name: 'All' },
        { id: 'computers', name: 'Computers' },
        { id: 'phones', name: 'Phones' },
        { id: 'smartwatch', name: 'Smartwatch' },
    ];

    useEffect(() => {
        const loadProducts = async () => {
            const allProducts = await getAllProducts();
            const electronicsProducts = allProducts.filter(p => {
                const categoryStr = Array.isArray(p.category)
                    ? p.category.join(' ').toLowerCase()
                    : String(p.category || '').toLowerCase();
                const nameStr = String(p.name || '').toLowerCase();

                return categoryStr.includes('electronics') ||
                    categoryStr.includes('computer') ||
                    categoryStr.includes('phone') ||
                    categoryStr.includes('watch') ||
                    categoryStr.includes('tech') ||
                    nameStr.includes('computer') ||
                    nameStr.includes('phone') ||
                    nameStr.includes('watch') ||
                    nameStr.includes('laptop') ||
                    nameStr.includes('tablet');
            });
            setProducts(electronicsProducts);
            setFilteredProducts(electronicsProducts);
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
                const subcatStr = String(p.subcategory || '').toLowerCase();
                const nameStr = String(p.name || '').toLowerCase();
                const categoryStr = String(p.category || '').toLowerCase();

                return subcatStr.includes(subcategory.toLowerCase()) ||
                    nameStr.includes(subcategory.toLowerCase()) ||
                    categoryStr.includes(subcategory.toLowerCase());
            });
            setFilteredProducts(filtered);
        }
    }, [searchParams, products]);

    // Load cart from storage
    useEffect(() => {
        const savedCart = storage.get(STORAGE_KEYS.CART, []);
        setCart(savedCart);
    }, []);

    // Add to cart function
    const addToCart = (product) => {
        const newCart = [...cart, { ...product, cartId: Date.now() }];
        setCart(newCart);
        storage.set(STORAGE_KEYS.CART, newCart);
        setToast({ type: 'success', message: 'Added to cart' });
    };

    const handleSubcategoryClick = (subcategoryId) => {
        if (subcategoryId === 'all') {
            router.push('/electronics');
        } else {
            router.push(`/electronics?subcategory=${subcategoryId}`);
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
                        Electronics
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
                            <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
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

            {/* Floating Cart Button */}
            {cart.length > 0 && (
                <button
                    onClick={() => router.push('/shop')}
                    className="fixed bottom-20 right-4 bg-emerald-600 text-white p-4 rounded-full shadow-lg hover:bg-emerald-700 transition-transform hover:scale-105 active:scale-95 z-40 flex items-center space-x-2"
                >
                    <ShoppingCart size={24} />
                    <span className="font-bold">{cart.length}</span>
                </button>
            )}

            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
