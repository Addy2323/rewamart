'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import Toast from '../../components/Toast';
import { productsAPI } from '../../lib/api';
import { storage, STORAGE_KEYS } from '../../lib/storage';

export default function BestSellersPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // For now, we'll fetch all products and display them. 
                // In a real scenario, we'd sort by sales count or have a specific 'best-sellers' endpoint.
                const result = await productsAPI.getAll({ limit: 20 });
                if (result.success) {
                    setProducts(result.data.products);
                }
            } catch (error) {
                console.error('Error fetching best sellers:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    const addToCart = (product) => {
        const currentCart = storage.get(STORAGE_KEYS.CART, []);
        const newCart = [...currentCart, { ...product, cartId: Date.now() }];
        storage.set(STORAGE_KEYS.CART, newCart);
        window.dispatchEvent(new Event('cart-updated'));
        setToast({ type: 'success', message: 'Added to cart' });
    };

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const { current } = scrollContainerRef;
            const scrollAmount = 300;
            if (direction === 'left') {
                current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
            {toast && (
                <Toast
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToast(null)}
                />
            )}
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Best Sellers in Rewamart Renewed</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Top rated and most popular items, professionally inspected and tested to work and look like new.</p>
                </div>

                <div className="relative group">
                    {/* Left Button */}
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-800/80 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-gray-800"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft size={24} className="text-gray-800 dark:text-white" />
                    </button>

                    {/* Carousel Container */}
                    <div
                        ref={scrollContainerRef}
                        className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4 px-1 scroll-smooth"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {loading ? (
                            [...Array(8)].map((_, i) => (
                                <div key={i} className="min-w-[200px] md:min-w-[250px] flex-shrink-0 bg-white dark:bg-gray-800 rounded-xl h-80 animate-pulse"></div>
                            ))
                        ) : (
                            products.map(product => (
                                <div key={product.id} className="min-w-[200px] md:min-w-[250px] flex-shrink-0">
                                    <ProductCard
                                        product={product}
                                        onAddToCart={addToCart}
                                    />
                                </div>
                            ))
                        )}
                    </div>

                    {/* Right Button */}
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 dark:bg-gray-800/80 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-gray-800"
                        aria-label="Scroll right"
                    >
                        <ChevronRight size={24} className="text-gray-800 dark:text-white" />
                    </button>
                </div>

                {!loading && products.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No products found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
