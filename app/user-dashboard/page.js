'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, ShoppingBag, Wallet, Heart, Settings, User, TrendingUp } from 'lucide-react';
import { getCurrentUser, logoutUser, getUserById, updateUserProfile } from '../../lib/auth';
import { getWallet } from '../../lib/wallet';
import { storage, STORAGE_KEYS } from '../../lib/storage';
import Toast from '../../components/Toast';

export default function UserDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [wallet, setWallet] = useState(null);
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
        setWallet(getWallet());

        // Load user profile
        const userData = getUserById(currentUser.id);
        if (userData?.profile) {
            setProfile(userData.profile);
        }

        // Load orders from cart history (simulated)
        const cart = storage.get(STORAGE_KEYS.CART, []);
        if (cart.length > 0) {
            setOrders([
                {
                    id: 'ORD-001',
                    date: new Date().toLocaleDateString(),
                    items: cart.length,
                    total: cart.reduce((sum, item) => sum + item.price, 0),
                    status: 'Completed'
                }
            ]);
        }

        // Fetch recommended products
        const fetchRecommendedProducts = async () => {
            if (currentUser) {
                const response = await fetch(`/api/products/for-you?userId=${currentUser.id}`);
                if (response.ok) {
                    const data = await response.json();
                    setRecommendedProducts(data.products);
                }
            }
        };

        fetchRecommendedProducts();
    }, [router]);

    const handleLogout = () => {
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
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 sticky top-0 z-50 shadow-md">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link href="/shop" className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                            <span className="text-emerald-600 font-bold">R</span>
                        </div>
                        <h1 className="font-bold text-lg">RewaMart</h1>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                    >
                        <LogOut size={18} />
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
                    {/* Wallet Balance */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Wallet Balance</p>
                                <p className="text-2xl font-bold text-emerald-600 mt-2">
                                    TZS {wallet?.balance.toLocaleString() || 0}
                                </p>
                            </div>
                            <Wallet className="text-emerald-600" size={32} />
                        </div>
                    </div>

                    {/* Total Orders */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Orders</p>
                                <p className="text-2xl font-bold text-blue-600 mt-2">{orders.length}</p>
                            </div>
                            <ShoppingBag className="text-blue-600" size={32} />
                        </div>
                    </div>

                    {/* Cashback Earned */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Cashback Earned</p>
                                <p className="text-2xl font-bold text-green-600 mt-2">
                                    TZS {(wallet?.cashbackEarned || 0).toLocaleString()}
                                </p>
                            </div>
                            <TrendingUp className="text-green-600" size={32} />
                        </div>
                    </div>

                    {/* Investments */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Investments</p>
                                <p className="text-2xl font-bold text-purple-600 mt-2">
                                    TZS {(wallet?.investedAmount || 0).toLocaleString()}
                                </p>
                            </div>
                            <Heart className="text-purple-600" size={32} />
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
                            <div className="space-y-3">
                                {orders.map(order => (
                                    <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-gray-900">{order.id}</p>
                                                <p className="text-sm text-gray-600">{order.date}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-emerald-600">TZS {order.total.toLocaleString()}</p>
                                                <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium mt-1">
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-2">{order.items} items</p>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        href="/shop"
                        className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center"
                    >
                        <ShoppingBag className="text-emerald-600 mx-auto mb-3" size={32} />
                        <h3 className="font-bold text-gray-900">Continue Shopping</h3>
                        <p className="text-sm text-gray-600 mt-1">Browse our products</p>
                    </Link>

                    <Link
                        href="/wallet"
                        className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center"
                    >
                        <Wallet className="text-blue-600 mx-auto mb-3" size={32} />
                        <h3 className="font-bold text-gray-900">Manage Wallet</h3>
                        <p className="text-sm text-gray-600 mt-1">View transactions</p>
                    </Link>

                    <Link
                        href="/invest"
                        className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center"
                    >
                        <TrendingUp className="text-purple-600 mx-auto mb-3" size={32} />
                        <h3 className="font-bold text-gray-900">Investments</h3>
                        <p className="text-sm text-gray-600 mt-1">Grow your wealth</p>
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
