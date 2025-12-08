'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, X, Filter, Star, MapPin, Scan, Smartphone, CreditCard, Truck, Bus, Lightbulb, Phone, Sparkles } from 'lucide-react';
import dynamic from 'next/dynamic';
import ProductCard from '../../components/ProductCard';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';
import QRCodeModal from '../../components/QRCodeModal';
import ScanPayModal from '../../components/ScanPayModal';
import VendorUpdates from '../../components/VendorUpdates';
import { getAllProducts } from '../../lib/products';
import { addFunds, toggleAutoInvest, getWallet, processPurchase } from '../../lib/wallet';
import { createOrder } from '../../lib/orders';
import { storage, STORAGE_KEYS } from '../../lib/storage';
import { getProductReviews, addReview } from '../../lib/reviews';
import { processReferralReward, processReferralPurchase } from '../../lib/referrals';
import { initiateSTKPush } from '../../lib/stkpush';
import { createInvestment } from '../../lib/investments';
import { createWithdrawal } from '../../lib/withdrawals';
import CashbackAllocationModal from '../../components/CashbackAllocationModal';

// Dynamic import for LocationPicker (client-side only due to Leaflet)
const LocationPicker = dynamic(() => import('../../components/LocationPicker'), {
    ssr: false,
    loading: () => <div className="h-10 bg-gray-200 animate-pulse rounded-lg"></div>
});

export default function ShopPage() {
    const router = useRouter();
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
    const [paymentMethod, setPaymentMethod] = useState('');
    const [deliveryTransport, setDeliveryTransport] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [deliveryLocation, setDeliveryLocation] = useState(null);
    const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
    const [deliveryDistance, setDeliveryDistance] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isScanPayOpen, setIsScanPayOpen] = useState(false);
    const [isCashbackModalOpen, setIsCashbackModalOpen] = useState(false);
    const [earnedCashback, setEarnedCashback] = useState(0);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [orderSuccessOpen, setOrderSuccessOpen] = useState(false);

    // Shop location (Kariakoo, Dar es Salaam)
    const SHOP_LOCATION = {
        lat: -6.8160,
        lng: 39.2803,
        name: 'Kariakoo'
    };

    // Payment methods available
    const paymentMethods = [
        { id: 'mpesa', name: 'M-Pesa', icon: 'smartphone', color: 'bg-green-500' },
        { id: 'airtel', name: 'Airtel Money', icon: 'smartphone', color: 'bg-red-500' },
        { id: 'tigopesa', name: 'Tigo Pesa', icon: 'credit-card', color: 'bg-blue-500' },
        { id: 'cash', name: 'Cash on Delivery', icon: 'banknote', color: 'bg-yellow-500' }
    ];

    // Delivery transport options with base price and per-km rate
    const deliveryOptions = [
        {
            id: 'bolt',
            name: 'Bolt',
            icon: 'truck',
            basePrice: 2000,
            pricePerKm: 500,
            time: '30-45 min',
            speedKmh: 30,
            maxDistance: 50 // Limited to 50km
        },
        {
            id: 'uber',
            name: 'Uber',
            icon: 'truck',
            basePrice: 2500,
            pricePerKm: 600,
            time: '25-40 min',
            speedKmh: 35,
            maxDistance: 50 // Limited to 50km
        },
        {
            id: 'bus',
            name: 'Bus Delivery',
            icon: 'bus',
            basePrice: 12000,
            pricePerKm: 0,
            time: '1 day',
            speedKmh: 60,
            fixedPrice: true,
            maxDistance: null // Unlimited within Tanzania
        }
    ];

    useEffect(() => {
        // Load products with dynamic cashback
        const loadProducts = async () => {
            try {
                const allProducts = await getAllProducts();
                let filtered = activeCategory === 'all'
                    ? allProducts
                    : allProducts.filter(p => p.category === activeCategory);

                if (searchQuery) {
                    filtered = filtered.filter(p =>
                        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (p.vendor && p.vendor.toLowerCase().includes(searchQuery.toLowerCase()))
                    );
                }
                setProducts(filtered);
            } catch (error) {
                console.error('Error loading products:', error);
                setProducts([]);
            }
        };

        loadProducts();
    }, [activeCategory, searchQuery]);

    useEffect(() => {
        // Load cart from storage
        const savedCart = storage.get(STORAGE_KEYS.CART, []);
        setCart(savedCart);
    }, []);

    useEffect(() => {
        // Get user from localStorage
        const userData = storage.get(STORAGE_KEYS.USER);
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

    // Calculate distance when location is selected
    useEffect(() => {
        if (deliveryLocation) {
            const distance = calculateDistance(
                SHOP_LOCATION.lat,
                SHOP_LOCATION.lng,
                deliveryLocation.lat,
                deliveryLocation.lng
            );
            setDeliveryDistance(distance);
        } else {
            setDeliveryDistance(null);
        }
    }, [deliveryLocation]);

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

    // Calculate distance between two coordinates using Haversine formula
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Earth's radius in kilometers
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance; // Distance in kilometers
    };

    // Calculate delivery price based on distance
    const calculateDeliveryPrice = (option, distance) => {
        if (option.fixedPrice) return option.basePrice;
        if (!distance) return option.basePrice;
        const price = option.basePrice + (distance * option.pricePerKm);
        return Math.round(price / 500) * 500; // Round to nearest 500
    };

    // Calculate estimated delivery time based on distance
    const calculateDeliveryTime = (option, distance) => {
        if (option.fixedPrice) return option.time;
        if (!distance) return option.time;
        const timeInMinutes = Math.round((distance / option.speedKmh) * 60);
        if (timeInMinutes < 60) {
            return `${timeInMinutes}-${timeInMinutes + 15} min`;
        } else {
            const hours = Math.floor(timeInMinutes / 60);
            const mins = timeInMinutes % 60;
            return `${hours}h ${mins}min`;
        }
    };

    // Get delivery options with calculated prices
    const getDeliveryOptionsWithPrices = () => {
        return deliveryOptions.map(option => ({
            ...option,
            price: calculateDeliveryPrice(option, deliveryDistance),
            estimatedTime: calculateDeliveryTime(option, deliveryDistance),
            isAvailable: !option.maxDistance || !deliveryDistance || deliveryDistance <= option.maxDistance
        }));
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
    const deliveryOptionsWithPrices = getDeliveryOptionsWithPrices();
    const selectedDelivery = deliveryOptionsWithPrices.find(d => d.id === deliveryTransport);
    const deliveryCost = selectedDelivery?.price || 0;
    const finalTotal = cartTotal - referralDiscount + deliveryCost;
    const potentialCashback = cart.reduce((sum, item) => sum + (item.price * item.cashback), 0);

    const handleCheckout = async () => {
        // Check if user is authenticated
        if (!user || !user.id) {
            setToast({
                type: 'error',
                message: 'Please create an account or sign in so as to keep track of your product'
            });
            // Redirect to auth page after showing message
            setTimeout(() => {
                router.push('/auth');
            }, 2000);
            return;
        }

        // Validate payment method selection
        if (!paymentMethod) {
            setToast({ type: 'error', message: 'Please select a payment method' });
            return;
        }

        // Validate delivery transport selection
        if (!deliveryTransport) {
            setToast({ type: 'error', message: 'Please select a delivery transport option' });
            return;
        }

        // Validate delivery address (either from map or typed)
        if (!deliveryLocation && !deliveryAddress.trim()) {
            setToast({ type: 'error', message: 'Please select a location on map or enter your delivery address' });
            return;
        }

        // Validate phone number
        if (!phoneNumber.trim()) {
            setToast({ type: 'error', message: 'Please enter your phone number' });
            return;
        }

        // Validate Tanzanian phone format (0XXXXXXXXX or +255XXXXXXXXX)
        const phoneRegex = /^(?:\+255|0)[67]\d{8}$/;
        if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
            setToast({ type: 'error', message: 'Please enter a valid Tanzanian phone number (e.g., 0712345678 or +255712345678)' });
            return;
        }

        setIsCheckingOut(true);
        setIsProcessingPayment(true);

        // Initiate STK Push Payment
        try {
            const paymentResult = await initiateSTKPush(phoneNumber, finalTotal);

            setIsProcessingPayment(false);

            if (paymentResult.success) {
                // Create orders for each cart item
                for (const product of cart) {
                    await createOrder(product, paymentMethod, {
                        address: deliveryAddress,
                        phone: phoneNumber,
                        location: deliveryLocation,
                        distance: deliveryDistance,
                        transport: deliveryTransport
                    }, deliveryCost);
                }

                let referralMessage = '';

                // If a referral code was used, process the complete referral flow
                const appliedCode = storage.get(STORAGE_KEYS.APPLIED_REFERRAL_CODE);
                const hasMadePurchase = storage.get(STORAGE_KEYS.HAS_MADE_PURCHASE);

                if (appliedCode && !hasMadePurchase) {
                    // Note: Referral bonus logic might need adjustment if wallet is removed
                    // For now, we'll assume it's tracked separately or added to cashback
                    const referralResult = processReferralPurchase(finalTotal, appliedCode);
                    storage.set(STORAGE_KEYS.HAS_MADE_PURCHASE, true);
                    storage.remove(STORAGE_KEYS.APPLIED_REFERRAL_CODE);

                    referralMessage = ` Plus referral bonus!`;
                }

                // Clear cart and selections
                setCart([]);
                storage.set(STORAGE_KEYS.CART, []);
                setIsCheckingOut(false);
                setIsCartOpen(false);
                setReferralDiscount(0);
                setPaymentMethod('');
                setDeliveryTransport('');
                setDeliveryAddress('');
                setDeliveryLocation(null);
                setDeliveryDistance(null);
                // Keep phone number for next time

                // Show success modal
                setOrderSuccessOpen(true);

                // After 5 seconds, close success modal and open cashback modal
                setTimeout(() => {
                    setOrderSuccessOpen(false);
                    setEarnedCashback(potentialCashback);
                    setIsCashbackModalOpen(true);
                }, 5000);

            } else {
                setToast({ type: 'error', message: 'Payment failed. Please try again.' });
                setIsCheckingOut(false);
            }
        } catch (error) {
            console.error('Checkout error:', error);
            setToast({ type: 'error', message: 'An error occurred during checkout.' });
            setIsCheckingOut(false);
            setIsProcessingPayment(false);
        }
    };

    const handleInvestCashback = async (amount, provider, details) => {
        const result = createInvestment(user?.id || 'guest', amount, provider, details);
        if (result.success) {
            // Redirect to dashboard after short delay
            setTimeout(() => router.push('/user-dashboard'), 2000);
        }
    };

    const handleWithdrawCashback = async (amount, phone) => {
        const result = createWithdrawal(user?.id || 'guest', amount, phone);
        if (result.success) {
            // Redirect to dashboard after short delay
            setTimeout(() => router.push('/user-dashboard'), 2000);
        }
    };

    const handleScanPayment = async (product) => {
        // Add product to cart instead of direct purchase
        const newCart = [...cart, { ...product, cartId: Date.now() }];
        setCart(newCart);
        storage.set(STORAGE_KEYS.CART, newCart);

        setToast({
            type: 'success',
            message: `${product.name} added to cart! Proceed to checkout to complete your purchase.`
        });
    };

    const categories = [
        { id: 'all', label: 'All' },
        { id: 'electronics', label: 'Electronics' },
        { id: 'fashion', label: 'Fashion' },
        { id: 'home', label: 'Home' },
        { id: 'beauty', label: 'Beauty' }
    ];

    // Helper function to render icons
    const renderIcon = (iconName, size = 20, className = '') => {
        const iconProps = { size, className };
        switch (iconName) {
            case 'smartphone': return <Smartphone {...iconProps} />;
            case 'credit-card': return <CreditCard {...iconProps} />;
            case 'banknote': return <CreditCard {...iconProps} />;
            case 'truck': return <Truck {...iconProps} />;
            case 'bus': return <Bus {...iconProps} />;
            default: return null;
        }
    };

    return (
        <div className="pb-24 dark:bg-gray-900 transition-colors">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 sticky top-0 z-40 pb-2 shadow-sm">
                <div className="p-4 space-y-4">
                    {/* Search */}
                    <div className="flex space-x-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                            <input
                                type="text"
                                placeholder="Search products, brands..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white dark:placeholder-gray-400"
                            />
                        </div>
                        <button
                            onClick={() => setIsScanPayOpen(true)}
                            className="bg-gray-900 dark:bg-gray-700 text-white p-3 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors shadow-sm"
                            title="Scan to Pay"
                        >
                            <Scan size={24} />
                        </button>
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
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-0">
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
                        <Sparkles size={28} className="text-yellow-500" />
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
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
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

                        {/* Payment Method Selection */}
                        <div className="border-t pt-4">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Payment Method</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {paymentMethods.map(method => (
                                    <button
                                        key={method.id}
                                        onClick={() => setPaymentMethod(method.id)}
                                        className={`flex items-center space-x-2 p-3 rounded-lg border-2 transition-all ${paymentMethod === method.id
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                                            : 'border-gray-200 dark:border-gray-600 hover:border-emerald-300'
                                            }`}
                                    >
                                        <div className="text-gray-700 dark:text-gray-300">
                                            {renderIcon(method.icon, 20)}
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{method.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Delivery Transport Selection */}
                        <div className="border-t pt-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-gray-900 dark:text-white">Delivery Transport</h3>
                                {deliveryDistance && (
                                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full font-medium flex items-center space-x-1">
                                        <MapPin size={12} />
                                        <span>{deliveryDistance.toFixed(1)} km from {SHOP_LOCATION.name}</span>
                                    </span>
                                )}
                            </div>
                            {!deliveryLocation && !deliveryAddress && (
                                <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg flex items-start space-x-2">
                                    <Lightbulb size={16} className="text-amber-700 dark:text-amber-300 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-amber-700 dark:text-amber-300">
                                        Select delivery location first to see accurate pricing
                                    </p>
                                </div>
                            )}
                            <div className="space-y-2">
                                {deliveryOptionsWithPrices.map(option => (
                                    <button
                                        key={option.id}
                                        onClick={() => setDeliveryTransport(option.id)}
                                        disabled={!option.isAvailable}
                                        className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${!option.isAvailable
                                            ? 'opacity-50 cursor-not-allowed border-gray-100 bg-gray-50 dark:bg-gray-800 dark:border-gray-700'
                                            : deliveryTransport === option.id
                                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                                                : 'border-gray-200 dark:border-gray-600 hover:border-emerald-300'
                                            }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className={`text-gray-700 dark:text-gray-300 ${!option.isAvailable ? 'opacity-50' : ''}`}>
                                                {renderIcon(option.icon, 24)}
                                            </div>
                                            <div className="text-left">
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {option.name}
                                                    {!option.isAvailable && <span className="ml-2 text-xs text-red-500 font-normal">(Too far)</span>}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {deliveryDistance ? option.estimatedTime : option.time}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="font-bold text-emerald-600 block">TZS {option.price.toLocaleString()}</span>
                                            {deliveryDistance && (
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {option.fixedPrice ? '(Fixed Price)' : `(${option.pricePerKm}/km)`}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Delivery Address */}
                        <div className="border-t pt-4">
                            <div className="flex items-center space-x-2 mb-3">
                                <MapPin size={20} className="text-emerald-600" />
                                <h3 className="font-bold text-gray-900 dark:text-white">Delivery Location</h3>
                            </div>
                            <div className="space-y-3">
                                {/* Map Picker Button */}
                                <button
                                    onClick={() => setIsLocationPickerOpen(true)}
                                    className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
                                >
                                    <div className="flex items-center space-x-3">
                                        <MapPin size={20} />
                                        <span className="font-medium">
                                            {deliveryLocation ? 'Change Location on Map' : 'Pick Location on Map'}
                                        </span>
                                    </div>
                                    <span className="text-blue-200">→</span>
                                </button>

                                {/* Selected Location Display */}
                                {deliveryLocation && (
                                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 border-2 border-emerald-200 dark:border-emerald-700 rounded-xl">
                                        <div className="flex items-start space-x-2">
                                            <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <MapPin size={12} className="text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">Selected Location</p>
                                                <p className="text-sm text-gray-700 dark:text-gray-300 break-words">
                                                    {deliveryLocation.address}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Or Text Input */}
                                <div className="relative">
                                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center">
                                        <span className="px-3 bg-white dark:bg-gray-800 text-xs text-gray-400">or type address</span>
                                    </div>
                                    <div className="border-t border-gray-200 dark:border-gray-600"></div>
                                </div>

                                <textarea
                                    value={deliveryAddress}
                                    onChange={(e) => setDeliveryAddress(e.target.value)}
                                    placeholder="Enter your full delivery address (e.g., Street name, Area, City)..."
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all dark:text-white dark:placeholder-gray-400 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                                    rows={2}
                                    disabled
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Use the map for accurate location or type your address manually
                                </p>
                            </div>
                        </div>

                        {/* Phone Number */}
                        <div className="border-t pt-4">
                            <div className="flex items-center space-x-2 mb-3">
                                <Phone size={20} className="text-emerald-600" />
                                <h3 className="font-bold text-gray-900 dark:text-white">Contact Phone Number</h3>
                            </div>
                            <div className="space-y-2">
                                <div className="relative">
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="0712345678 or +255712345678"
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all dark:text-white dark:placeholder-gray-400"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Enter your Tanzanian phone number for delivery coordination
                                </p>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                                <span className="font-bold text-gray-900 dark:text-white">TZS {cartTotal.toLocaleString()}</span>
                            </div>
                            {referralDiscount > 0 && (
                                <div className="flex justify-between text-sm text-blue-600">
                                    <span>Referral Bonus (10%)</span>
                                    <span className="font-bold">- TZS {referralDiscount.toLocaleString()}</span>
                                </div>
                            )}
                            {deliveryCost > 0 && (
                                <div className="flex justify-between text-sm text-orange-600">
                                    <span>Delivery ({selectedDelivery?.name})</span>
                                    <span className="font-bold">+ TZS {deliveryCost.toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm text-green-600">
                                <span>Est. Cashback</span>
                                <span className="font-bold">+ TZS {potentialCashback.toLocaleString()}</span>
                            </div>

                            <div className="border-t pt-2 mt-2">
                                <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                                    <span>Total</span>
                                    <span className="text-emerald-600">TZS {finalTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Authentication Warning */}
                            {!user && (
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-500 rounded-lg space-y-2">
                                    <div className="flex items-start space-x-2">
                                        <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                                                Authentication Required
                                            </p>
                                            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                                                You need to create an account or sign in to track your orders and earn cashback.
                                            </p>
                                            <button
                                                onClick={() => router.push('/auth')}
                                                className="mt-2 text-xs font-semibold text-amber-800 dark:text-amber-200 underline hover:text-amber-900 dark:hover:text-amber-100"
                                            >
                                                Sign In or Register →
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleCheckout}
                                disabled={isCheckingOut || !paymentMethod || !deliveryTransport || (!deliveryLocation && !deliveryAddress.trim())}
                                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold mt-4 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                title={selectedProduct?.name || 'Product Details'}
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

            {/* Cashback Allocation Modal */}
            <CashbackAllocationModal
                isOpen={isCashbackModalOpen}
                onClose={() => setIsCashbackModalOpen(false)}
                amount={earnedCashback}
                onInvest={handleInvestCashback}
                onWithdraw={handleWithdrawCashback}
            />

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

            {/* Location Picker Modal */}
            <LocationPicker
                isOpen={isLocationPickerOpen}
                onClose={() => setIsLocationPickerOpen(false)}
                onSelectLocation={(location) => {
                    setDeliveryLocation(location);
                    setDeliveryAddress(location.address);
                    setIsLocationPickerOpen(false);
                }}
                initialLocation={deliveryLocation}
            />

            {/* Toast Notification */}
            {
                toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )
            }

            {/* QR Code Modal */}
            <QRCodeModal
                isOpen={isQROpen}
                product={qrProduct}
                onClose={() => setIsQROpen(false)}
            />

            {/* Scan to Pay Modal */}
            {
                isScanPayOpen && (
                    <ScanPayModal
                        isOpen={isScanPayOpen}
                        onClose={() => setIsScanPayOpen(false)}
                        onConfirmPayment={(product) => {
                            handleScanPayment(product);
                        }}
                    />
                )
            }

            {/* Processing Payment Loader */}
            {isProcessingPayment && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl px-8 py-6 shadow-2xl flex items-center space-x-4">
                        <div className="w-8 h-8 border-4 border-gray-300 border-t-emerald-600 rounded-full animate-spin"></div>
                        <span className="text-gray-800 dark:text-white text-lg font-medium">Processing payment...</span>
                    </div>
                </div>
            )}

            {/* Order Success Modal */}
            {orderSuccessOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl max-w-md w-full">
                        {/* Success Checkmark */}
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                <svg className="w-12 h-12 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>

                        {/* Success Message */}
                        <div className="text-center space-y-4">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Thank you for purchasing from RewaMart!
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                Your order has been received successfully. You can track your product status from your dashboard.
                            </p>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                Keep shopping, explore investment options, and don't forget to invite your friends to earn exciting bonuses!!!!
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
}
