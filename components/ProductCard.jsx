'use client';

import { ShoppingCart, QrCode, Star, Truck } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
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
            <Link href={`/shop/${product.id}`} className="relative w-full h-56 bg-gray-100 overflow-hidden block cursor-pointer">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                />
                {product.cashbackRate > 0 && (
                    <span className={`absolute bg-emerald-500 text-white text-sm px-3 py-1 rounded-full font-bold z-10
                        ${(product.stockCount !== undefined && product.stockCount !== null)
                            ? 'top-12 left-4 md:top-4 md:right-4 md:left-auto'
                            : 'top-4 right-4'
                        }`}>
                        {product.cashbackRate}% Cashback
                    </span>
                )}
                {/* Stock Count Badge */}
                {product.stockCount !== undefined && product.stockCount !== null && (
                    <span className={`absolute top-4 left-4 text-white text-xs px-3 py-1 rounded-full font-bold z-10 ${product.stockCount === 0 ? 'bg-red-600' :
                        product.stockCount <= 5 ? 'bg-orange-500' :
                            'bg-blue-500'
                        }`}>
                        {product.stockCount === 0 ? 'Out of Stock' : `Only ${product.stockCount} left`}
                    </span>
                )}
                {/* Free Shipping Badge */}
                {product.hasFreeShipping && (
                    <span className="absolute bottom-4 left-4 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold z-10 flex items-center gap-1 shadow-sm">
                        <Truck size={10} />
                        FREE Shipping
                    </span>
                )}
            </Link>

            {/* Content Section */}
            <div className="p-4 flex flex-col flex-1">
                {/* Product Name */}
                <h3 className="text-lg font-bold text-black mb-2 line-clamp-2">{product.name}</h3>

                {/* Product Description */}
                {product.description && (
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {product.description}
                    </p>
                )}

                {/* Price Section */}
                <div className="mb-3">
                    <span className="text-xl font-bold text-emerald-600">
                        TZS {product.price.toLocaleString()}
                    </span>
                    {product.cashbackRate > 0 && (
                        <div className="text-emerald-600 font-semibold text-sm mt-1">
                            +TZS {(product.price * product.cashbackRate / 100).toLocaleString()}
                        </div>
                    )}
                </div>

                {/* Stock and Vendor */}
                <div className="flex items-center justify-between mb-3 text-xs">
                    <span className={product.inStock ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                    <span className="text-gray-500 font-medium">{product.vendor}</span>
                </div>

                {/* Ratings */}
                {reviewCount > 0 && (
                    <div className="flex items-center space-x-2 mb-3">
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <Star
                                    key={i}
                                    size={14}
                                    className={i < Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                />
                            ))}
                        </div>
                        <span className="text-xs text-gray-600">({reviewCount})</span>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-auto">
                    <button
                        onClick={() => onAddToCart(product)}
                        disabled={!product.inStock || product.stockCount === 0}
                        className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-bold text-sm transition-colors shadow-md active:scale-95 transform disabled:opacity-50 disabled:cursor-not-allowed"
                        title={product.stockCount === 0 ? "Out of stock" : "Add to cart"}
                    >
                        <ShoppingCart size={18} />
                        <span>{product.stockCount === 0 ? 'Out of Stock' : 'Add'}</span>
                    </button>
                    <button
                        onClick={() => onQRCode && onQRCode(product)}
                        className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-3 rounded-lg font-bold transition-colors shadow-md active:scale-95 transform"
                        title="Scan QR Code"
                    >
                        <QrCode size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
