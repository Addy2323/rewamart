'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, Wallet, Heart, Settings, User, TrendingUp, Truck, CheckCircle, Clock, AlertCircle, BarChart3, Users } from 'lucide-react';
import { getCurrentUser, getUserById, updateUserProfile } from '../../lib/auth';
import { getWallet } from '../../lib/wallet';
import { storage, STORAGE_KEYS } from '../../lib/storage';
import { getOrdersByUser, getOrderStatusLabel, getOrderStatusColor, ORDER_STATUS } from '../../lib/orders';
import { getInvestmentStats } from '../../lib/investments';
import { getTotalWithdrawn } from '../../lib/withdrawals';
import Toast from '../../components/Toast';

export default function UserDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [investmentStats, setInvestmentStats] = useState({ totalInvested: 0, totalCurrentValue: 0 });
    const [totalWithdrawn, setTotalWithdrawn] = useState(0);
    const [orders, setOrders] = useState([]);
    const [toast, setToast] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
        phone: '',
        address: '',
        city: ''
    });
    const [recommendedProducts, setRecommendedProducts] = useState([]);

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            router.push('/auth');
            return;
        }
        setUser(currentUser);

        // This part of the useEffect should only run if currentUser is available
        // The instruction seems to imply moving the `if (!currentUser) return;` inside the effect,
        // but it's already handled by the early return above.
        // The main change is the dependency array.

        const loadData = async () => {
            // Load investment stats
            const stats = await getInvestmentStats(currentUser.id);
            setInvestmentStats(stats);

            // Load withdrawals
            const withdrawn = await getTotalWithdrawn(currentUser.id);
            setTotalWithdrawn(withdrawn);

            // Load user profile
            const userData = getUserById(currentUser.id);
            if (userData?.profile) {
                setProfile(userData.profile);
            }

            // Load orders from API
            const userOrders = await getOrdersByUser(currentUser.id);
            setOrders(userOrders);

            // Fetch recommended products
            if (currentUser) {
                const response = await fetch(`/api/products/for-you?userId=${currentUser.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setRecommendedProducts(data.products);
                }
            }
        };

        loadData();

        // Polling for new products
        const pollInterval = setInterval(async () => {
            try {
                const lastCheck = localStorage.getItem('lastUserCheck') || new Date().toISOString();
                const response = await fetch(`/api/notifications/check?type=new_products&since=${lastCheck}`);

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.data.hasNew) {
                        setToast({
                            type: 'success',
                            message: data.data.latestItem.message
                        });
                        // Update last check time
                        localStorage.setItem('lastUserCheck', new Date().toISOString());
                        // Refresh recommended products
                        const recResponse = await fetch(`/api/products/for-you?userId=${currentUser.id}`);
                        if (recResponse.ok) {
                            const recData = await recResponse.json();
                            setRecommendedProducts(recData.products);
                        }
                    }
                }
            } catch (error) {
                console.error('Notification poll error:', error);
            }
        }, 15000); // Check every 15 seconds

        // Initialize last check time if not set
        if (!localStorage.getItem('lastUserCheck')) {
            localStorage.setItem('lastUserCheck', new Date().toISOString());
        }

        return () => clearInterval(pollInterval);
    }, [currentUser?.id, router]); // Added currentUser?.id to dependencies, kept router as it's used for push


    const handleLogout = () => {
        const { logoutUser } = require('../../lib/auth');
        logoutUser();
        setToast({ type: 'success', message: 'Logged out successfully' });
        setTimeout(() => router.push('/auth'), 1000);
    };

    const handleUpdateProfile = () => {
        const result = updateUserProfile(user.id, profile);
        if (result.success) {
            setToast({ type: 'success', message: 'Profile updated successfully' });
            setIsEditing(false);
        } else {
            setToast({ type: 'error', message: result.error });
        }
    };

    if (!user) {
        return <div className="min-h-screen flex items-center justify-center text-gray-900 dark:text-white">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header - positioned right after Navbar */}
            <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 shadow-md">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors ml-auto"
                    >
                        <span>Logout</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto p-4 space-y-6 pb-20">
                {/* Welcome Section */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-2xl font-bold text-gray-900">Welcome, {user.name}! 👋</h2>
                    <p className="text-gray-600 mt-2">Manage your account, orders, and wallet</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Total Invested */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Invested</p>
                                <p className="text-2xl font-bold text-emerald-600 mt-2">
                                    TZS {investmentStats.totalInvested.toLocaleString()}
                                </p>
                            </div>
                            <TrendingUp className="text-emerald-600" size={32} />
                        </div>
                    </div>

                    {/* Current Value */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Current Value</p>
                                <p className="text-2xl font-bold text-purple-600 mt-2">
                                    TZS {Math.round(investmentStats.totalCurrentValue).toLocaleString()}
                                </p>
                            </div>
                            <Heart className="text-purple-600" size={32} />
                        </div>
                    </div>

                    {/* Total Withdrawn */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Withdrawn</p>
                                <p className="text-2xl font-bold text-blue-600 mt-2">
                                    TZS {totalWithdrawn.toLocaleString()}
                                </p>
                            </div>
                            <Wallet className="text-blue-600" size={32} />
                        </div>
                    </div>

                    {/* Total Orders */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Orders</p>
                                <p className="text-2xl font-bold text-orange-600 mt-2">{orders.length}</p>
                            </div>
                            <ShoppingBag className="text-orange-600" size={32} />
                        </div>
                    </div>
                </div>

                {/* For You Section */}
                {recommendedProducts.length > 0 && (
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">For You</h3>
                        <div className="flex overflow-x-auto space-x-4 pb-4">
                            {recommendedProducts.map(product => (
                                <div key={product.id} className="flex-shrink-0 w-48 bg-gray-50 rounded-lg p-3">
                                    <img src={product.image} alt={product.name} className="w-full h-24 object-cover rounded-md mb-2" />
                                    <p className="font-bold text-sm text-gray-800 truncate">{product.name}</p>
                                    <p className="text-emerald-600 font-semibold">TZS {product.price.toLocaleString()}</p>
                                    <button className="w-full mt-2 bg-emerald-600 text-white text-xs py-1 rounded-md hover:bg-emerald-700 transition-colors">Add to Cart</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Profile & Orders Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Section */}
                    <div className="lg:col-span-1 bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                                <User className="text-emerald-600" size={32} />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">{user.name}</p>
                                <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                        </div>

                        {!isEditing ? (
                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-600">Phone</p>
                                    <p className="font-medium text-gray-900">{profile.phone || 'Not set'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">Address</p>
                                    <p className="font-medium text-gray-900">{profile.address || 'Not set'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">City</p>
                                    <p className="font-medium text-gray-900">{profile.city || 'Not set'}</p>
                                </div>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="w-full mt-4 bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2"
                                >
                                    <Settings size={18} />
                                    <span>Edit Profile</span>
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-gray-600">Phone</label>
                                    <input
                                        type="tel"
                                        value={profile.phone}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-600">Address</label>
                                    <input
                                        type="text"
                                        value={profile.address}
                                        onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-600">City</label>
                                    <input
                                        type="text"
                                        value={profile.city}
                                        onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleUpdateProfile}
                                        className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Orders Section */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Orders</h3>
                        {orders.length > 0 ? (
                            <div className="space-y-4">
                                {orders.map(order => (
                                    <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                                        {/* Order Header */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h4 className="font-bold text-gray-900">Order #{order.id.slice(-8).toUpperCase()}</h4>
                                                <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-emerald-600 mb-1">
                                                    TZS {order.totalAmount?.toLocaleString()}
                                                </p>
                                                <span className={`text-xs px-3 py-1 rounded-full font-medium inline-block ${getOrderStatusColor(order.status)}`}>
                                                    {getOrderStatusLabel(order.status)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex items-center space-x-3 mb-3 pb-3 border-b border-gray-100">
                                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                <img src={order.product.image} alt={order.product.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 text-sm truncate">{order.product.name}</p>
                                                <p className="text-xs text-gray-500">{order.product.vendor}</p>
                                            </div>
                                        </div>

                                        {/* Order Status Progress */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-gray-600">Delivery Progress</span>
                                                <span className="text-gray-500">Est. {new Date(order.estimatedDelivery).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {/* Status Timeline */}
                                                <div className="flex-1 flex items-center space-x-1">
                                                    {/* Pending */}
                                                    <div className="flex flex-col items-center flex-1">
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${order.status === ORDER_STATUS.PENDING || order.status === ORDER_STATUS.PROCESSING || order.status === ORDER_STATUS.SHIPPED || order.status === ORDER_STATUS.DELIVERED ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                                            {order.status === ORDER_STATUS.PENDING || order.status === ORDER_STATUS.PROCESSING || order.status === ORDER_STATUS.SHIPPED || order.status === ORDER_STATUS.DELIVERED ? '✓' : '1'}
                                                        </div>
                                                        <span className="text-xs text-gray-600 mt-1">Pending</span>
                                                    </div>

                                                    {/* Processing */}
                                                    <div className={`flex-1 h-1 ${order.status === ORDER_STATUS.PROCESSING || order.status === ORDER_STATUS.SHIPPED || order.status === ORDER_STATUS.DELIVERED ? 'bg-emerald-600' : 'bg-gray-200'}`}></div>
                                                    <div className="flex flex-col items-center flex-1">
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${order.status === ORDER_STATUS.PROCESSING || order.status === ORDER_STATUS.SHIPPED || order.status === ORDER_STATUS.DELIVERED ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                                            {order.status === ORDER_STATUS.PROCESSING || order.status === ORDER_STATUS.SHIPPED || order.status === ORDER_STATUS.DELIVERED ? '✓' : '2'}
                                                        </div>
                                                        <span className="text-xs text-gray-600 mt-1">Processing</span>
                                                    </div>

                                                    {/* Shipped */}
                                                    <div className={`flex-1 h-1 ${order.status === ORDER_STATUS.SHIPPED || order.status === ORDER_STATUS.DELIVERED ? 'bg-emerald-600' : 'bg-gray-200'}`}></div>
                                                    <div className="flex flex-col items-center flex-1">
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${order.status === ORDER_STATUS.SHIPPED || order.status === ORDER_STATUS.DELIVERED ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                                            {order.status === ORDER_STATUS.SHIPPED || order.status === ORDER_STATUS.DELIVERED ? '✓' : '3'}
                                                        </div>
                                                        <span className="text-xs text-gray-600 mt-1">Shipped</span>
                                                    </div>

                                                    {/* Delivered */}
                                                    <div className={`flex-1 h-1 ${order.status === ORDER_STATUS.DELIVERED ? 'bg-emerald-600' : 'bg-gray-200'}`}></div>
                                                    <div className="flex flex-col items-center flex-1">
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${order.status === ORDER_STATUS.DELIVERED ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                                            {order.status === ORDER_STATUS.DELIVERED ? '✓' : '4'}
                                                        </div>
                                                        <span className="text-xs text-gray-600 mt-1">Delivered</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Cashback Info */}
                                        {order.cashbackEarned > 0 && (
                                            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                                                <span className="text-xs text-gray-600">Cashback Earned</span>
                                                <span className="text-sm font-bold text-green-600">+ TZS {order.cashbackEarned.toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <ShoppingBag size={48} className="mx-auto mb-3 opacity-50" />
                                <p>No orders yet</p>
                                <Link href="/shop" className="text-emerald-600 hover:text-emerald-700 font-medium mt-2 inline-block">
                                    Start Shopping
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link
                        href="/shop"
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center group"
                    >
                        <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                            <ShoppingBag className="text-emerald-600 dark:text-emerald-400" size={28} />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Continue Shopping</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Browse our products</p>
                    </Link>



                    <Link
                        href="/invest"
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center group"
                    >
                        <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                            <TrendingUp className="text-purple-600 dark:text-purple-400" size={28} />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Investments</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Grow your wealth</p>
                    </Link>

                    <Link
                        href="/referral"
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center group"
                    >
                        <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                            <Heart className="text-orange-600 dark:text-orange-400" size={28} />
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Referrals</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Invite friends & earn</p>
                    </Link>
                </div>
            </div>

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
