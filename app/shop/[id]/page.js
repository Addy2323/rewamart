'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingCart, Star, Share2, Heart } from 'lucide-react';
import { productsAPI } from '../../../lib/api';


export default function ProductDetailsPage({ params }) {
    const router = useRouter();
    const { id } = params;
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState('');
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const result = await productsAPI.getById(id);
                if (result.success) {
                    setProduct(result.data.product);
                    setSelectedImage(result.data.product.image);
                } else {
                    // Handle error
                }
            } catch (error) {
                console.error('Error fetching product:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
                <p className="text-gray-600 dark:text-gray-400 mb-4">Product not found</p>
                <button
                    onClick={() => router.back()}
                    className="text-emerald-600 font-medium hover:underline"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const allImages = [product.image, ...(product.images || [])].filter(Boolean);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">


            <div className="max-w-7xl mx-auto px-4 py-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Back
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-sm relative">
                            <img
                                src={selectedImage}
                                alt={product.name}
                                className="w-full h-full object-contain"
                            />
                            {product.cashbackRate > 0 && (
                                <span className="absolute top-4 right-4 bg-emerald-500 text-white text-sm px-3 py-1 rounded-full font-bold shadow-sm">
                                    {product.cashbackRate}% Cashback
                                </span>
                            )}
                        </div>

                        {allImages.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                {allImages.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(img)}
                                        className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === img
                                            ? 'border-emerald-600 ring-2 ring-emerald-100'
                                            : 'border-transparent hover:border-gray-300'
                                            }`}
                                    >
                                        <img
                                            src={img}
                                            alt={`${product.name} ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="flex flex-col">
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                {product.name}
                            </h1>
                            <div className="flex items-center gap-4 text-sm">
                                <span className="text-gray-500 dark:text-gray-400">
                                    Sold by <span className="font-medium text-emerald-600">{product.vendor}</span>
                                </span>
                                <div className="flex items-center text-yellow-500">
                                    <Star size={16} className="fill-current" />
                                    <span className="ml-1 font-medium text-gray-900 dark:text-white">
                                        {product.rating || '4.5'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-6">
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-3xl font-bold text-emerald-600">
                                    TZS {product.price.toLocaleString()}
                                </span>
                            </div>
                            {product.cashbackRate > 0 && (
                                <p className="text-emerald-600 font-medium text-sm flex items-center gap-1">
                                    <span className="bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded text-xs">
                                        Save TZS {(product.price * product.cashbackRate / 100).toLocaleString()}
                                    </span>
                                    with cashback
                                </p>
                            )}

                            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {product.description}
                                </p>
                            </div>
                        </div>

                        <div className="mt-auto bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm sticky bottom-4 md:static">
                            <div className="flex items-center justify-between mb-4">
                                <span className={`font-medium ${product.inStock ? 'text-emerald-600' : 'text-red-600'
                                    }`}>
                                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                                </span>
                                {product.stockCount > 0 && (
                                    <span className="text-sm text-gray-500">
                                        {product.stockCount} units left
                                    </span>
                                )}
                            </div>

                            <div className="flex gap-4">
                                <div className="flex items-center border border-gray-300 rounded-lg">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        disabled={quantity <= 1}
                                    >
                                        -
                                    </button>
                                    <span className="px-3 font-medium text-gray-900 dark:text-white">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => setQuantity(Math.min(product.stockCount || 99, quantity + 1))}
                                        className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        disabled={quantity >= (product.stockCount || 99)}
                                    >
                                        +
                                    </button>
                                </div>

                                <button
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-emerald-200 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!product.inStock}
                                >
                                    <ShoppingCart size={20} />
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
