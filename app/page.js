'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Heart, Package, Tag, Sparkles, ShoppingBag, Headphones, Smartphone, ShirtIcon, ShoppingCart } from 'lucide-react';
import { storage, STORAGE_KEYS } from '../lib/storage';
import Toast from '../components/Toast';
import { useCart } from '../context/CartContext';
import FirstOrderPopup from '../components/FirstOrderPopup';

export default function HomePage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [flashSaleTime, setFlashSaleTime] = useState({ hours: 12, minutes: 1, seconds: 24 });
    const [products, setProducts] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const { cart, addToCart } = useCart();
    const [toast, setToast] = useState(null);

    // Banner slides with Unsplash images
    const banners = [
        {
            title: "Women's Clothing",
            subtitle: "Shop Now >>",
            link: "/womens-clothing",
            color: "from-pink-400 to-rose-400",
            image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80"
        },
        {
            title: "Men's Fashion",
            subtitle: "Explore Collection >>",
            link: "/mens-clothing",
            color: "from-blue-400 to-indigo-400",
            image: "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=800&q=80"
        },
        {
            title: "Electronics",
            subtitle: "Discover Deals >>",
            link: "/electronics",
            color: "from-purple-400 to-violet-400",
            image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80"
        }
    ];


    // Countdown timer effect
    useEffect(() => {
        const timer = setInterval(() => {
            setFlashSaleTime(prev => {
                let { hours, minutes, seconds } = prev;

                if (seconds > 0) {
                    seconds--;
                } else if (minutes > 0) {
                    minutes--;
                    seconds = 59;
                } else if (hours > 0) {
                    hours--;
                    minutes = 59;
                    seconds = 59;
                }

                return { hours, minutes, seconds };
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Fetch products for flash sale
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('/api/products?limit=6');
                const data = await response.json();
                if (data.products) {
                    setProducts(data.products);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };
        fetchProducts();
    }, []);

    // Auto-slide banner every 4 seconds
    useEffect(() => {
        const slideTimer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % banners.length);
        }, 4000);

        return () => clearInterval(slideTimer);
    }, [banners.length]);

    const features = [
        { icon: Heart, label: 'Wish List', color: 'bg-pink-100 text-pink-600', link: '/shop' },
        { icon: Package, label: 'Wholesale', color: 'bg-blue-100 text-blue-600', link: '/shop' },
        { icon: Tag, label: 'Bargain Zone', color: 'bg-purple-100 text-purple-600', link: '/best-sellers' },
        { icon: Sparkles, label: 'New Arrival', color: 'bg-orange-100 text-orange-600', link: '/new-releases' }
    ];

    const categories = [
        { icon: ShirtIcon, label: 'Dress', link: '/womens-clothing', color: 'bg-gradient-to-br from-blue-400 to-blue-500' },
        { icon: ShoppingBag, label: 'Tops', link: '/mens-clothing', color: 'bg-gradient-to-br from-red-400 to-red-500' },
        { icon: Smartphone, label: 'Phones', link: '/electronics', color: 'bg-gradient-to-br from-purple-400 to-purple-500' },
        { icon: Headphones, label: 'Earphones', link: '/electronics', color: 'bg-gradient-to-br from-green-400 to-green-500' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
            {/* Hero Banner Carousel */}
            <div className="mx-4 mt-4 rounded-2xl shadow-lg relative overflow-hidden h-48">
                {banners.map((banner, index) => (
                    <Link
                        key={index}
                        href={banner.link}
                        className={`absolute inset-0 bg-gradient-to-r ${banner.color} transition-opacity duration-500 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                            }`}
                    >
                        {/* Background Image */}
                        <div
                            className="absolute inset-0 bg-cover bg-center opacity-30"
                            style={{ backgroundImage: `url(${banner.image})` }}
                        />

                        {/* Content */}
                        <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">{banner.title}</h2>
                                <span className="text-white text-sm font-medium hover:underline">
                                    {banner.subtitle}
                                </span>
                            </div>

                            {/* Carousel Dots */}
                            <div className="flex space-x-2">
                                {banners.map((_, dotIndex) => (
                                    <button
                                        key={dotIndex}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setCurrentSlide(dotIndex);
                                        }}
                                        className={`w-2 h-2 rounded-full transition-all ${dotIndex === currentSlide ? 'bg-white w-6' : 'bg-white/50'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Feature Icons */}
            <div className="px-4 mt-6">
                <div className="grid grid-cols-4 gap-3">
                    {features.map((feature, index) => (
                        <Link
                            key={index}
                            href={feature.link}
                            className="flex flex-col items-center space-y-2"
                        >
                            <div className={`w-16 h-16 ${feature.color} rounded-full flex items-center justify-center shadow-md`}>
                                <feature.icon size={28} />
                            </div>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                                {feature.label}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Category Banners Grid */}
            <div className="px-4 mt-6">
                <div className="grid grid-cols-2 gap-3">
                    {/* Men's Shoes */}
                    <Link
                        href="/mens-clothing"
                        className="relative h-32 rounded-2xl overflow-hidden bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-300"
                    >
                        <div className="absolute inset-0 p-4 flex flex-col justify-between z-10">
                            <h3 className="text-lg font-bold text-white">Men's Shoes</h3>
                            <button className="w-fit px-4 py-1.5 bg-white/30 backdrop-blur-sm text-white text-sm font-medium rounded-full hover:bg-white/40 transition-colors">
                                View &gt;
                            </button>
                        </div>
                        <img
                            src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80"
                            alt="Men's Shoes"
                            className="absolute right-0 bottom-0 w-28 h-28 object-contain transform translate-x-2 translate-y-2"
                        />
                    </Link>

                    {/* Women's Shoes */}
                    <Link
                        href="/womens-clothing"
                        className="relative h-32 rounded-2xl overflow-hidden bg-gradient-to-r from-orange-400 to-orange-500"
                    >
                        <div className="absolute inset-0 p-4 flex flex-col justify-between z-10">
                            <h3 className="text-lg font-bold text-white">Women's Shoes</h3>
                            <button className="w-fit px-4 py-1.5 bg-white/30 backdrop-blur-sm text-white text-sm font-medium rounded-full hover:bg-white/40 transition-colors">
                                View &gt;
                            </button>
                        </div>
                        <img
                            src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80"
                            alt="Women's Shoes"
                            className="absolute right-0 bottom-0 w-28 h-28 object-contain transform translate-x-2 translate-y-2"
                        />
                    </Link>

                    {/* Phone */}
                    <Link
                        href="/electronics"
                        className="relative h-32 rounded-2xl overflow-hidden bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300"
                    >
                        <div className="absolute inset-0 p-4 flex flex-col justify-between z-10">
                            <h3 className="text-lg font-bold text-gray-800">Phone</h3>
                            <button className="w-fit px-4 py-1.5 bg-orange-500 text-white text-sm font-medium rounded-full hover:bg-orange-600 transition-colors">
                                View &gt;
                            </button>
                        </div>
                        <img
                            src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80"
                            alt="Phones"
                            className="absolute right-0 bottom-0 w-28 h-28 object-contain transform translate-x-2 translate-y-2"
                        />
                    </Link>

                    {/* Accessories */}
                    <Link
                        href="/electronics"
                        className="relative h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-400 via-gray-300 to-orange-300"
                    >
                        <div className="absolute inset-0 p-4 flex flex-col justify-between z-10">
                            <h3 className="text-lg font-bold text-gray-800">Accessories</h3>
                            <button className="w-fit px-4 py-1.5 bg-white/50 backdrop-blur-sm text-gray-700 text-sm font-medium rounded-full hover:bg-white/70 transition-colors">
                                View &gt;
                            </button>
                        </div>
                        <img
                            src="https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400&q=80"
                            alt="Accessories"
                            className="absolute right-0 bottom-0 w-28 h-28 object-contain transform translate-x-2 translate-y-2"
                        />
                    </Link>
                </div>
            </div>

            {/* Category Circles */}
            <div className="px-4 mt-6">
                <div className="grid grid-cols-4 gap-4">
                    {categories.map((category, index) => (
                        <Link
                            key={index}
                            href={category.link}
                            className="flex flex-col items-center space-y-2"
                        >
                            <div className={`w-20 h-20 ${category.color} rounded-full flex items-center justify-center shadow-lg`}>
                                <category.icon className="text-white" size={32} />
                            </div>
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                {category.label}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Flash Sale Section */}
            <div className="px-4 mt-8">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Flash Sale</h3>
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">-61%</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-gray-900 dark:bg-gray-800 text-white px-3 py-1.5 rounded-lg">
                        <span className="text-sm font-bold">{String(flashSaleTime.hours).padStart(2, '0')}</span>
                        <span>:</span>
                        <span className="text-sm font-bold">{String(flashSaleTime.minutes).padStart(2, '0')}</span>
                        <span>:</span>
                        <span className="text-sm font-bold">{String(flashSaleTime.seconds).padStart(2, '0')}</span>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {products.slice(0, 6).map((product) => (
                        <Link
                            key={product.id}
                            href="/shop"
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                        >
                            <div className="aspect-square bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                {product.image ? (
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <ShoppingBag size={48} className="text-gray-300" />
                                )}
                            </div>
                            <div className="p-3">
                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-1">
                                    {product.name}
                                </p>
                                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                    {product.price.toLocaleString()} TSh
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Today's Deal Section */}
            <div className="px-4 mt-8">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Today's Deal</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.slice(0, 4).map((product, index) => {
                        const discounts = ['-10%', '-11%', '-7%', '-15%'];
                        const orders = ['68 orders', '16 orders', '268 orders', '142 orders'];
                        const ratings = [4.4, 4.2, 4.6, 4.5];

                        return (
                            <div
                                key={product.id}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow relative flex flex-col"
                            >
                                {/* In Stock Badge */}
                                <div className="p-3 pb-0">
                                    <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold">In Stock</span>
                                </div>

                                {/* Discount Badge */}
                                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
                                    {discounts[index]}
                                </div>

                                {/* Product Image - Clickable */}
                                <Link href={`/shop/${product.id}`} className="block">
                                    <div className="aspect-square bg-gray-100 dark:bg-gray-700 flex items-center justify-center relative">
                                        {product.image ? (
                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <ShoppingBag size={64} className="text-gray-300" />
                                        )}
                                    </div>
                                </Link>

                                {/* Product Info */}
                                <div className="p-3 flex-1 flex flex-col">
                                    <Link href={`/shop/${product.id}`} className="block">
                                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                                            {product.name}
                                        </p>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                            {product.price.toLocaleString()} TSh
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                            {orders[index]}
                                        </p>

                                        {/* Rating */}
                                        <div className="flex items-center space-x-1 mb-3">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} className={`text-xs ${i < Math.floor(ratings[index]) ? 'text-yellow-400' : 'text-gray-300'}`}>
                                                    ★
                                                </span>
                                            ))}
                                            <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">
                                                {ratings[index]}
                                            </span>
                                        </div>
                                    </Link>

                                    {/* Add Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            addToCart(product);
                                        }}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
                                    >
                                        <ShoppingCart size={18} />
                                        <span>Add</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Thumbs Up Items Section */}
            <div className="px-4 mt-8">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Thumbs Up Items</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.slice(4, 8).map((product, index) => {
                        const discounts = ['-12%', '-8%', '-20%', '-5%'];
                        const orders = ['89 orders', '124 orders', '56 orders', '203 orders'];
                        const ratings = [4.7, 4.3, 4.8, 4.1];

                        return (
                            <div
                                key={product.id}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow relative flex flex-col"
                            >
                                {/* In Stock Badge */}
                                <div className="p-3 pb-0">
                                    <span className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold">In Stock</span>
                                </div>

                                {/* Discount Badge */}
                                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
                                    {discounts[index]}
                                </div>

                                {/* Product Image - Clickable */}
                                <Link href={`/shop/${product.id}`} className="block">
                                    <div className="aspect-square bg-gray-100 dark:bg-gray-700 flex items-center justify-center relative">
                                        {product.image ? (
                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <ShoppingBag size={64} className="text-gray-300" />
                                        )}
                                    </div>
                                </Link>

                                {/* Product Info */}
                                <div className="p-3 flex-1 flex flex-col">
                                    <Link href={`/shop/${product.id}`} className="block">
                                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                                            {product.name}
                                        </p>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                            {product.price.toLocaleString()} TSh
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                            {orders[index]}
                                        </p>

                                        {/* Rating */}
                                        <div className="flex items-center space-x-1 mb-3">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} className={`text-xs ${i < Math.floor(ratings[index]) ? 'text-yellow-400' : 'text-gray-300'}`}>
                                                    ★
                                                </span>
                                            ))}
                                            <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">
                                                {ratings[index]}
                                            </span>
                                        </div>
                                    </Link>

                                    {/* Add Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            addToCart(product);
                                            setToast({ type: 'success', message: `${product.name} added to cart!` });
                                        }}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
                                    >
                                        <ShoppingCart size={18} />
                                        <span>Add</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Padding for Nav */}
            <div className="h-24"></div>

            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
            {/* Promo Popup (Global/Home) */}
            <FirstOrderPopup />
        </div >
    );
}
