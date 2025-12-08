'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Users, Package, TrendingUp, Settings, BarChart3, Shield } from 'lucide-react';
import { getCurrentUser, logoutUser, getAllVendors, getAllCustomers } from '../../lib/auth';
import { getAllProducts } from '../../lib/products';
import Toast from '../../components/Toast';

export default function AdminDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [vendors, setVendors] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const loadDashboardData = async () => {
            const currentUser = getCurrentUser();
            if (!currentUser || currentUser.role !== 'admin') {
                router.push('/auth');
                return;
            }
            setUser(currentUser);

            try {
                // Fetch all data in parallel
                const [vendorsData, customersData, productsData] = await Promise.all([
                    getAllVendors(),
                    getAllCustomers(),
                    getAllProducts()
                ]);

                setVendors(vendorsData || []);
                setCustomers(customersData || []);
                setProducts(productsData || []);
            } catch (error) {
                console.error('Error loading dashboard data:', error);
                setToast({ type: 'error', message: 'Failed to load dashboard data' });
                // Initialize with empty arrays to prevent crashes
                setVendors([]);
                setCustomers([]);
                setProducts([]);
            }
        };

        loadDashboardData();
    }, []); // Run once on mount

    const handleLogout = () => {
        logoutUser();
        setToast({ type: 'success', message: 'Logged out successfully' });
        setTimeout(() => router.push('/auth'), 1000);
    };

    if (!user) {
        return <div className="min-h-screen flex items-center justify-center text-gray-900 dark:text-white">Loading...</div>;
    }

    const totalRevenue = products.reduce((sum, p) => sum + p.price, 0);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header - positioned right after Navbar */}
            <header className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 shadow-md">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link href="/shop" className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                            <Shield className="text-red-600" size={24} />
                        </div>
                        <h1 className="font-bold text-lg">RewaMart Admin</h1>
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
                    <h2 className="text-2xl font-bold text-gray-900">Welcome, {user.name}! 🛡️</h2>
                    <p className="text-gray-600 mt-2">Manage platform, users, and content</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Total Users */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Users</p>
                                <p className="text-2xl font-bold text-blue-600 mt-2">
                                    {vendors.length + customers.length}
                                </p>
                            </div>
                            <Users className="text-blue-600" size={32} />
                        </div>
                    </div>

                    {/* Total Vendors */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Vendors</p>
                                <p className="text-2xl font-bold text-green-600 mt-2">{vendors.length}</p>
                            </div>
                            <Package className="text-green-600" size={32} />
                        </div>
                    </div>

                    {/* Total Customers */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Customers</p>
                                <p className="text-2xl font-bold text-purple-600 mt-2">{customers.length}</p>
                            </div>
                            <Users className="text-purple-600" size={32} />
                        </div>
                    </div>

                    {/* Total Products */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Products</p>
                                <p className="text-2xl font-bold text-orange-600 mt-2">{products.length}</p>
                            </div>
                            <Package className="text-orange-600" size={32} />
                        </div>
                    </div>
                </div>

                {/* Management Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Vendors Management */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                                <Package size={24} className="text-green-600" />
                                <span>Vendors</span>
                            </h3>
                            <Link
                                href="/admin-dashboard/vendors"
                                className="text-sm text-emerald-600 font-medium hover:underline"
                            >
                                Manage Vendors →
                            </Link>
                        </div>
                        {vendors.length > 0 ? (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {vendors.map(vendor => (
                                    <div key={vendor.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-gray-900">{vendor.name}</p>
                                                <p className="text-sm text-gray-600">{vendor.email}</p>
                                            </div>
                                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                                                Active
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p>No vendors registered yet</p>
                            </div>
                        )}
                    </div>

                    {/* Customers Management */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                            <Users size={24} className="text-purple-600" />
                            <span>Customers</span>
                        </h3>
                        {customers.length > 0 ? (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {customers.map(customer => (
                                    <div key={customer.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-gray-900">{customer.name}</p>
                                                <p className="text-sm text-gray-600">{customer.email}</p>
                                            </div>
                                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                                                Active
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p>No customers registered yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Products Overview */}
                <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                            <Package size={24} className="text-orange-600" />
                            <span>Products Overview</span>
                        </h3>
                        <Link
                            href="/admin-dashboard/products"
                            className="text-sm text-orange-600 font-medium hover:underline"
                        >
                            Manage Products →
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                            <p className="text-gray-600 text-sm">Total Products</p>
                            <p className="text-3xl font-bold text-orange-600 mt-2">{products.length}</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                            <p className="text-gray-600 text-sm">Total Platform Value</p>
                            <p className="text-3xl font-bold text-green-600 mt-2">
                                TZS {totalRevenue.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Admin Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                        href="/admin"
                        className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center"
                    >
                        <Settings className="text-red-600 mx-auto mb-3" size={32} />
                        <h3 className="font-bold text-gray-900">Manage Cashback</h3>
                        <p className="text-sm text-gray-600 mt-1">Edit product cashback rates</p>
                    </Link>

                    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center">
                        <BarChart3 className="text-blue-600 mx-auto mb-3" size={32} />
                        <h3 className="font-bold text-gray-900">Analytics</h3>
                        <p className="text-sm text-gray-600 mt-1">View platform statistics</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center">
                        <Shield className="text-red-600 mx-auto mb-3" size={32} />
                        <h3 className="font-bold text-gray-900">Security</h3>
                        <p className="text-sm text-gray-600 mt-1">Manage platform security</p>
                    </div>
                </div>

                {/* System Info */}
                <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl shadow-md p-6 border border-red-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">System Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <p className="text-gray-600">Platform Status</p>
                            <p className="font-bold text-green-600 mt-1">✓ Operational</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Last Backup</p>
                            <p className="font-bold text-gray-900 mt-1">{new Date().toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Active Sessions</p>
                            <p className="font-bold text-gray-900 mt-1">{vendors.length + customers.length + 1}</p>
                        </div>
                    </div>
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
