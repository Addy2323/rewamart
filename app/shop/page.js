'use client';

import { useState, useEffect } from 'react';
import { Search, ShoppingCart, X, Filter, Star } from 'lucide-react';
import Image from 'next/image';
import ProductCard from '../../components/ProductCard';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';
import QRCodeModal from '../../components/QRCodeModal';
import VendorUpdates from '../../components/VendorUpdates';
import { getAllProducts } from '../../lib/products';
import { addFunds, toggleAutoInvest, getWallet, processPurchase } from '../../lib/wallet';
import { storage, STORAGE_KEYS } from '../../lib/storage';
import { getProductReviews, addReview } from '../../lib/reviews';
import { processReferralReward, processReferralPurchase } from '../../lib/referrals';

export default function ShopPage() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [toast, setToast] = useState(null);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [qrProduct, setQrProduct] = useState(null);
    const [isQROpen, setIsQROpen] = useState(false);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [reviewData, setReviewData] = useState({ rating: 5, comment: '', name: '' });
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [newTodayProducts, setNewTodayProducts] = useState([]);
    const [randomProducts, setRandomProducts] = useState([]);
    const [user, setUser] = useState(null);
    const [referralDiscount, setReferralDiscount] = useState(0);

    useEffect(() => {
        // Load products with dynamic cashback
        const allProducts = getAllProducts();
        let filtered = activeCategory === 'all'
            ? allProducts
            : allProducts.filter(p => p.category === activeCategory);

        if (searchQuery) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.vendor.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        setProducts(filtered);
    }, [activeCategory, searchQuery]);

    useEffect(() => {
        // Load cart from storage
        const savedCart = storage.get(STORAGE_KEYS.CART, []);
        setCart(savedCart);
    }, []);

    useEffect(() => {
        // Get user from localStorage
        const userData = JSON.parse(localStorage.getItem('user') || 'null');
        setUser(userData);

        // Fetch recommended products if user is logged in
        if (userData?.id) {
            fetchRecommendedProducts(userData.id);
        }

        // Fetch new today products
        fetchNewTodayProducts();

        // Fetch random products
        fetchRandomProducts();
    }, []);

    // Calculate referral discount whenever cart changes
    useEffect(() => {
        const appliedCode = storage.get(STORAGE_KEYS.APPLIED_REFERRAL_CODE);
        const hasMadePurchase = storage.get(STORAGE_KEYS.HAS_MADE_PURCHASE);

        if (appliedCode && !hasMadePurchase && cart.length > 0) {
            const total = cart.reduce((sum, item) => sum + item.price, 0);
            const discount = Math.floor(total * 0.10);
            setReferralDiscount(discount);
        } else {
            setReferralDiscount(0);
        }
    }, [cart]);

    const fetchRecommendedProducts = async (userId) => {
        try {
            const response = await fetch(`/api/products/recommended?userId=${userId}`);
            const data = await response.json();
            setRecommendedProducts(data.products || []);
        } catch (error) {
            console.error('Error fetching recommended products:', error);
        }
    };

    const fetchNewTodayProducts = async () => {
        try {
            const response = await fetch('/api/products/new-today');
            const data = await response.json();
            setNewTodayProducts(data.products || []);
        } catch (error) {
            console.error('Error fetching new today products:', error);
        }
    };

    const fetchRandomProducts = async () => {
        try {
            const response = await fetch('/api/products/random');
            const data = await response.json();
            setRandomProducts(data.products || []);
        } catch (error) {
            console.error('Error fetching random products:', error);
        }
    };

    const addToCart = (product) => {
        const newCart = [...cart, { ...product, cartId: Date.now() }];
        setCart(newCart);
        storage.set(STORAGE_KEYS.CART, newCart);
        setToast({ type: 'success', message: 'Added to cart' });
    };

    const removeFromCart = (cartId) => {
        const newCart = cart.filter(item => item.cartId !== cartId);
        setCart(newCart);
        storage.set(STORAGE_KEYS.CART, newCart);
    };

    const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);
    const finalTotal = cartTotal - referralDiscount;
    const potentialCashback = cart.reduce((sum, item) => sum + (item.price * item.cashback), 0);

    const handleCheckout = async () => {
        setIsCheckingOut(true);

        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Process purchase (Cashback + Auto-Invest)
        const result = processPurchase(finalTotal, potentialCashback);

        let referralMessage = '';

        // If a referral code was used, process the complete referral flow
        const appliedCode = storage.get(STORAGE_KEYS.APPLIED_REFERRAL_CODE);
        const hasMadePurchase = storage.get(STORAGE_KEYS.HAS_MADE_PURCHASE);

        if (appliedCode && !hasMadePurchase) {
            const referralResult = processReferralPurchase(finalTotal, appliedCode);
            storage.set(STORAGE_KEYS.HAS_MADE_PURCHASE, true);
            storage.remove(STORAGE_KEYS.APPLIED_REFERRAL_CODE);

            referralMessage = ` Plus TZS ${referralResult.inviteeBonus.toLocaleString()} referral bonus added to your wallet!`;
        }

        // Clear cart
        setCart([]);
        storage.set(STORAGE_KEYS.CART, []);
        setIsCheckingOut(false);
        setIsCartOpen(false);
        setReferralDiscount(0);

        // Construct success message
        let message = `Purchase successful! Earned TZS ${result.cashbackEarned.toLocaleString()} cashback.`;
        if (result.investedAmount > 0) {
            message += ` Auto-invested TZS ${result.investedAmount.toLocaleString()}.`;
        }
        message += referralMessage;

        setToast({ type: 'success', message });
    };

    const categories = [
        { id: 'all', label: 'All' },
        { id: 'electronics', label: 'Electronics' },
        { id: 'fashion', label: 'Fashion' },
        { id: 'home', label: 'Home' },
        { id: 'beauty', label: 'Beauty' }
    ];

    return (
        <div className="pb-24 dark:bg-gray-900 transition-colors">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 z-40 pb-2 shadow-sm">
                <div className="p-4 space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                        <input
                            type="text"
                            placeholder="Search products, brands..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white dark:placeholder-gray-400"
                        />
                    </div>

                    {/* Categories */}
                    <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat.id
                                    ? 'bg-emerald-600 text-white shadow-md'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Vendor Updates Notification */}
            <VendorUpdates />

            {/* Product Grid */}
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-0">
                {products.map(product => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={addToCart}
                        onViewDetails={setSelectedProduct}
                        onQRCode={(prod) => {
                            setQrProduct(prod);
                            setIsQROpen(true);
                        }}
                    />
                ))}
            </div>

            {/* New Products Today Section */}
            {newTodayProducts.length > 0 && (
                <div className="p-4 space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Today's New Products</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {newTodayProducts.slice(0, 10).map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={addToCart}
                                onViewDetails={setSelectedProduct}
                                onQRCode={(prod) => {
                                    setQrProduct(prod);
                                    setIsQROpen(true);
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Recommended For You Section (Only if logged in) */}
            {user && recommendedProducts.length > 0 && (
                <div className="p-4 space-y-4">
                    <div className="flex items-center space-x-2">
                        <span className="text-2xl">✨</span>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recommended For You</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {recommendedProducts.slice(0, 8).map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={addToCart}
                                onViewDetails={setSelectedProduct}
                                onQRCode={(prod) => {
                                    setQrProduct(prod);
                                    setIsQROpen(true);
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Random Picks Section */}
            {randomProducts.length > 0 && (
                <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Random Picks for You</h2>
                        <button
                            onClick={fetchRandomProducts}
                            className="px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors text-sm font-medium"
                        >
                            Refresh
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {randomProducts.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={addToCart}
                                onViewDetails={setSelectedProduct}
                                onQRCode={(prod) => {
                                    setQrProduct(prod);
                                    setIsQROpen(true);
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Floating Cart Button */}
            {cart.length > 0 && (
                <button
                    onClick={() => setIsCartOpen(true)}
                    className="fixed bottom-20 right-4 bg-emerald-600 text-white p-4 rounded-full shadow-lg hover:bg-emerald-700 transition-transform hover:scale-105 active:scale-95 z-40 flex items-center space-x-2"
                >
                    <ShoppingCart size={24} />
                    <span className="font-bold">{cart.length}</span>
                </button>
            )}

            {/* Cart Modal */}
            <Modal
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                title="Shopping Cart"
            >
                {cart.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        Your cart is empty
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                            {cart.map(item => (
                                <div key={item.cartId} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{item.name}</p>
                                            <p className="text-xs text-emerald-600">
                                                +{Math.round(item.cashback * 100)}% Cashback
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <span className="font-bold text-sm">
                                            {item.price.toLocaleString()}
                                        </span>
                                        <button
                                            onClick={() => removeFromCart(item.cartId)}
                                            className="text-gray-400 hover:text-red-500"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-bold">TZS {cartTotal.toLocaleString()}</span>
                            </div>
                            {referralDiscount > 0 && (
                                <div className="flex justify-between text-sm text-blue-600">
                                    <span>Referral Bonus (10%)</span>
                                    <span className="font-bold">- TZS {referralDiscount.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm text-green-600">
                                <span>Est. Cashback</span>
                                <span className="font-bold">+ TZS {potentialCashback.toLocaleString()}</span>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={isCheckingOut}
                                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold mt-4 hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                            >
                                {isCheckingOut ? 'Processing...' : `Checkout (TZS ${finalTotal.toLocaleString()})`}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Product Details Modal */}
            <Modal
                isOpen={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
                title="Product Details"
            >
                {selectedProduct && (
                    <div className="space-y-4 max-h-[80vh] overflow-y-auto">
                        <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden">
                            <Image
                                src={selectedProduct.image}
                                alt={selectedProduct.name}
                                fill
                                className="object-cover"
                            />
                        </div>

                        <div>
                            <h2 className="text-xl font-bold">{selectedProduct.name}</h2>
                            <p className="text-gray-500 text-sm">{selectedProduct.vendor}</p>
                        </div>

                        <div className="flex items-center space-x-2">
                            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold">
                                {selectedProduct.category.toUpperCase()}
                            </span>
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                                {selectedProduct.cashbackRate}% Cashback
                            </span>
                        </div>

                        <p className="text-gray-600 text-sm leading-relaxed">
                            {selectedProduct.description}
                        </p>

                        {/* Reviews Section */}
                        <div className="border-t pt-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-gray-900">Reviews</h3>
                                <button
                                    onClick={() => {
                                        setIsReviewOpen(true);
                                        setSelectedProduct(null);
                                    }}
                                    className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
                                >
                                    Add Review
                                </button>
                            </div>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {getProductReviews(selectedProduct.id).length > 0 ? (
                                    getProductReviews(selectedProduct.id).map(review => (
                                        <div key={review.id} className="bg-gray-50 p-3 rounded-lg">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium text-sm">{review.name}</span>
                                                <div className="flex items-center">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={12}
                                                            className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-600">{review.comment}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-gray-500 text-center py-2">No reviews yet</p>
                                )}
                            </div>
                        </div>

                        <div className="pt-4 border-t flex items-center justify-between">
                            <span className="text-2xl font-bold text-emerald-600">
                                TZS {selectedProduct.price.toLocaleString()}
                            </span>
                            <button
                                onClick={() => {
                                    addToCart(selectedProduct);
                                    setSelectedProduct(null);
                                }}
                                className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-700"
                            >
                                Add to Cart
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Review Modal */}
            <Modal
                isOpen={isReviewOpen}
                onClose={() => {
                    setIsReviewOpen(false);
                    setReviewData({ rating: 5, comment: '', name: '' });
                }}
                title="Add Review"
            >
                {selectedProduct && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                            <input
                                type="text"
                                value={reviewData.name}
                                onChange={(e) => setReviewData({ ...reviewData, name: e.target.value })}
                                placeholder="Enter your name"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                            <div className="flex space-x-2">
                                {[1, 2, 3, 4, 5].map(rating => (
                                    <button
                                        key={rating}
                                        onClick={() => setReviewData({ ...reviewData, rating })}
                                        className={`p-2 rounded-lg transition-colors ${reviewData.rating >= rating
                                            ? 'bg-yellow-400 text-white'
                                            : 'bg-gray-200 text-gray-600'
                                            }`}
                                    >
                                        <Star size={20} className="fill-current" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                            <textarea
                                value={reviewData.comment}
                                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                                placeholder="Share your experience..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                rows="4"
                            />
                        </div>

                        <button
                            onClick={() => {
                                if (!reviewData.name || !reviewData.comment) {
                                    setToast({ type: 'error', message: 'Please fill in all fields' });
                                    return;
                                }
                                addReview(selectedProduct.id, reviewData);
                                setToast({ type: 'success', message: 'Review added successfully' });
                                setIsReviewOpen(false);
                                setReviewData({ rating: 5, comment: '', name: '' });
                                setSelectedProduct(null);
                            }}
                            className="w-full bg-emerald-600 text-white py-2 rounded-lg font-bold hover:bg-emerald-700"
                        >
                            Submit Review
                        </button>
                    </div>
                )}
            </Modal>

            {/* QR Code Modal */}
            <QRCodeModal
                isOpen={isQROpen}
                onClose={() => setIsQROpen(false)}
                product={qrProduct}
            />

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
