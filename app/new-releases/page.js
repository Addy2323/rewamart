'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, Sparkles } from 'lucide-react';
import ProductCard from '../../components/ProductCard';
import { getAllProducts } from '../../lib/products';

export default function NewReleasesPage() {
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProducts = async () => {
            const allProducts = await getAllProducts();

            // Sort by creation date (newest first) and take top 50
            const newProducts = allProducts
                .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                .slice(0, 50);

            setProducts(newProducts);
            setLoading(false);
        };

        loadProducts();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white sticky top-0 z-10 shadow-lg">
                <div className="flex items-center p-4">
                    <button
                        onClick={() => router.back()}
                        className="mr-3 p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div className="flex-1">
                        <div className="flex items-center space-x-2">
                            <Sparkles size={24} />
                            <h1 className="text-xl font-bold">New Releases</h1>
                        </div>
                        <p className="text-sm text-emerald-100 mt-1">Latest products just for you</p>
                    </div>
                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <Search size={24} />
                    </button>
                </div>
            </div>

            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {loading ? 'Loading...' : `${products.length} new product${products.length !== 1 ? 's' : ''}`}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-emerald-600 dark:text-emerald-400">
                        <Sparkles size={16} />
                        <span className="font-medium">Fresh Arrivals</span>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                        <p className="text-gray-500 dark:text-gray-400 mt-4">Loading new releases...</p>
                    </div>
                ) : products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Sparkles size={48} className="mx-auto mb-3 opacity-50 text-gray-400" />
                        <p className="text-gray-500 dark:text-gray-400">
                            No new products yet
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
