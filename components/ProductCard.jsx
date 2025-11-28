'use client';

import { ShoppingCart, Eye, QrCode, Star } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { getAverageRating, getProductReviews } from '../lib/reviews';

export default function ProductCard({ product, onAddToCart, onViewDetails, onQRCode }) {
    const [avgRating, setAvgRating] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);

    useEffect(() => {
        const reviews = getProductReviews(product.id);
        setReviewCount(reviews.length);
        if (reviews.length > 0) {
            const avg = getAverageRating(product.id);
            setAvgRating(parseFloat(avg));
        }
    }, [product.id]);
    const formatCurrency = (amount) => {
        return `TZS ${amount.toLocaleString()}`;
    };

    return (
        <div className="card-shadow bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-emerald-100 dark:hover:border-emerald-600 transition-all">
            <div className="relative mb-3">
                <Image
                    src={product.image}
                    alt={product.name}
                    width={500}
                    height={300}
                    className="w-full h-40 object-cover rounded-lg"
                />
                {product.cashbackRate > 0 && (
                    <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px] px-2 py-1 rounded-full font-bold">
                        {product.cashbackRate}% Cashback
                    </span>
                )}
            </div>

            <div className="space-y-2">
                <div className="flex items-start justify-between">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-2 flex-1">{product.name}</h3>
                </div>

                {/* Ratings */}
                {reviewCount > 0 && (
                    <div className="flex items-center space-x-1">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    size={12}
                                    className={i < Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}
                                />
                            ))}
                        </div>
                        <span className="text-[10px] text-gray-600 dark:text-gray-400">({reviewCount})</span>
                    </div>
                )}

                <div className="flex items-baseline justify-between">
                    <div>
                        <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(product.price)}
                        </span>
                    </div>
                    {product.cashbackRate > 0 && (
                        <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">
                            +{formatCurrency(product.price * product.cashbackRate / 100)}
                        </span>
                    )}
                </div>

                <div className="flex items-center justify-between text-xs">
                    <span className={product.inStock ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">{product.vendor}</span>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => onAddToCart(product)}
                        disabled={!product.inStock}
                        className="flex-1 flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-xs font-medium transition-colors shadow-sm active:scale-95 transform disabled:opacity-50"
                    >
                        <ShoppingCart size={14} />
                        <span>Add</span>
                    </button>
                    <button
                        onClick={() => onQRCode && onQRCode(product)}
                        className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-xs font-medium transition-colors shadow-sm active:scale-95 transform"
                        title="Generate QR Code"
                    >
                        <QrCode size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}
