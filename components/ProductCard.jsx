'use client';

import { ShoppingCart, QrCode, Star } from 'lucide-react';
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

    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col h-full">
            {/* Product Image - Large */}
            <div className="relative w-full h-56 bg-gray-100 overflow-hidden">
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="w-full h-full object-cover"
                />
                {product.cashbackRate > 0 && (
                    <span className="absolute top-4 right-4 bg-emerald-500 text-white text-sm px-3 py-1 rounded-full font-bold">
                        {product.cashbackRate}% Cashback
                    </span>
                )}
            </div>

            {/* Content Section */}
            <div className="p-5 flex flex-col flex-1">
                {/* Product Name */}
                <h3 className="text-2xl font-bold text-black mb-4 line-clamp-2">{product.name}</h3>

                {/* Price Section */}
                <div className="mb-4">
                    <span className="text-3xl font-bold text-emerald-600">
                        TZS {product.price.toLocaleString()}
                    </span>
                    {product.cashbackRate > 0 && (
                        <div className="text-emerald-600 font-semibold text-lg mt-1">
                            +TZS {(product.price * product.cashbackRate / 100).toLocaleString()}
                        </div>
                    )}
                </div>

                {/* Stock and Vendor */}
                <div className="flex items-center justify-between mb-4 text-base">
                    <span className={product.inStock ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                    <span className="text-gray-500 font-medium">{product.vendor}</span>
                </div>

                {/* Ratings */}
                {reviewCount > 0 && (
                    <div className="flex items-center space-x-2 mb-4">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    size={16}
                                    className={i < Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                />
                            ))}
                        </div>
                        <span className="text-sm text-gray-600">({reviewCount})</span>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-auto">
                    <button
                        onClick={() => onAddToCart(product)}
                        disabled={!product.inStock}
                        className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-bold text-base transition-colors shadow-md active:scale-95 transform disabled:opacity-50"
                        title="Add to cart"
                    >
                        <ShoppingCart size={20} />
                        <span>Add</span>
                    </button>
                    <button
                        onClick={() => onQRCode && onQRCode(product)}
                        className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-bold transition-colors shadow-md active:scale-95 transform"
                        title="Scan QR Code"
                    >
                        <QrCode size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
