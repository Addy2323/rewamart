'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, TrendingUp, Award, ShoppingCart } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import { getAllProducts } from '../../lib/products';
import { storage, STORAGE_KEYS } from '../../lib/storage';
import Toast from '../../components/Toast';

export default function BestSellersPage() {
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState([]);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const loadProducts = async () => {
            const allProducts = await getAllProducts();

            // Sort by rating and review count (best sellers approximation)
            const bestSellers = allProducts
                .sort((a, b) => {
                    const scoreA = (a.rating || 0) * (a.reviewCount || 0);
                    const scoreB = (b.rating || 0) * (b.reviewCount || 0);
                    return scoreB - scoreA;
                })
                .slice(0, 50);

            setProducts(bestSellers);
            setLoading(false);
        };

        loadProducts();
    }, []);

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

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white sticky top-0 z-10 shadow-lg">
                <div className="flex items-center p-4">
                    <button
                        onClick={() => router.back()}
                        className="mr-3 p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div className="flex-1">
                        <div className="flex items-center space-x-2">
                            <Award size={24} />
                            <h1 className="text-xl font-bold">Best Sellers</h1>
                        </div>
                        <p className="text-sm text-orange-100 mt-1">Most popular products</p>
                    </div>
                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <Search size={24} />
                    </button>
                </div>
            </div>

            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {loading ? 'Loading...' : `${products.length} best seller${products.length !== 1 ? 's' : ''}`}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-orange-600 dark:text-orange-400">
                        <TrendingUp size={16} />
                        <span className="font-medium">Top Rated</span>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                        <p className="text-gray-500 dark:text-gray-400 mt-4">Loading best sellers...</p>
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {products.map((product, index) => (
                            <div key={product.id} className="relative">
                                {index < 3 && (
                                    <div className="absolute -top-2 -left-2 z-10 bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-lg">
                                        {index + 1}
                                    </div>
                                )}
                                <ProductCard product={product} onAddToCart={addToCart} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Award size={48} className="mx-auto mb-3 opacity-50 text-gray-400" />
                        <p className="text-gray-500 dark:text-gray-400">
                            No best sellers yet
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
