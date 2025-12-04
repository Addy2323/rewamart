'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Calendar, Download, ArrowLeft, Package, Users } from 'lucide-react';
import { storage, STORAGE_KEYS } from '../../lib/storage';

export default function AnalyticsPage() {
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [timeRange, setTimeRange] = useState('week'); // week, month, all
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        totalProducts: 0
    });

    useEffect(() => {
        loadAnalyticsData();
    }, [timeRange]);

    const loadAnalyticsData = () => {
        const allOrders = storage.get(STORAGE_KEYS.ORDERS, []);

        // Filter by time range
        const now = new Date();
        const filteredOrders = allOrders.filter(order => {
            const orderDate = new Date(order.createdAt);
            const daysDiff = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));

            if (timeRange === 'week') return daysDiff <= 7;
            if (timeRange === 'month') return daysDiff <= 30;
            return true;
        });

        setOrders(filteredOrders);

        // Calculate stats
        const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.totalAmount || order.total || 0), 0);
        const totalOrders = filteredOrders.length;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        const totalProducts = filteredOrders.reduce((sum, order) => sum + 1, 0);

        setStats({
            totalRevenue,
            totalOrders,
            avgOrderValue,
            totalProducts
        });
    };

    const getDailySales = () => {
        const salesByDay = {};
        orders.forEach(order => {
            const date = new Date(order.createdAt).toLocaleDateString();
            salesByDay[date] = (salesByDay[date] || 0) + (order.totalAmount || order.total || 0);
        });
        return Object.entries(salesByDay).map(([date, amount]) => ({ date, amount }));
    };

    const getTopProducts = () => {
        const productCount = {};
        orders.forEach(order => {
            const name = order.product.name;
            productCount[name] = (productCount[name] || 0) + 1;
        });
        return Object.entries(productCount)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    };

    const exportData = () => {
        const data = {
            stats,
            orders: orders.map(o => ({
                id: o.id,
                product: o.product.name,
                total: o.totalAmount || o.total || 0,
                status: o.status,
                date: new Date(o.createdAt).toLocaleString()
            }))
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${new Date().toISOString()}.json`;
        a.click();
    };

    const dailySales = getDailySales();
    const topProducts = getTopProducts();
    const maxSale = Math.max(...dailySales.map(d => d.amount), 1);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.back()}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={24} className="text-gray-600 dark:text-gray-300" />
                            </button>
                            <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                                    <BarChart3 size={24} className="text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">View sales reports</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={exportData}
                            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                            <Download size={20} />
                            <span>Export</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                {/* Time Range Filter */}
                <div className="flex items-center space-x-2">
                    {['week', 'month', 'all'].map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${timeRange === range
                                ? 'bg-emerald-600 text-white'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                        >
                            {range === 'week' ? 'Last 7 Days' : range === 'month' ? 'Last 30 Days' : 'All Time'}
                        </button>
                    ))}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                <DollarSign size={24} className="text-green-600 dark:text-green-400" />
                            </div>
                            <TrendingUp size={20} className="text-green-600" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Revenue</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            TZS {stats.totalRevenue.toLocaleString()}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                <ShoppingBag size={24} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <TrendingUp size={20} className="text-blue-600" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Orders</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalOrders}</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                <TrendingUp size={24} className="text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Avg Order Value</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            TZS {Math.round(stats.avgOrderValue).toLocaleString()}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                                <Package size={24} className="text-orange-600 dark:text-orange-400" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Products Sold</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalProducts}</p>
                    </div>
                </div>

                {/* Sales Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Daily Sales</h2>
                    {dailySales.length > 0 ? (
                        <div className="space-y-3">
                            {dailySales.map((day, index) => (
                                <div key={index} className="space-y-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">{day.date}</span>
                                        <span className="font-bold text-gray-900 dark:text-white">
                                            TZS {day.amount.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-emerald-600 h-2 rounded-full transition-all"
                                            style={{ width: `${(day.amount / maxSale) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">No sales data available</p>
                    )}
                </div>

                {/* Top Products */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Top Selling Products</h2>
                    {topProducts.length > 0 ? (
                        <div className="space-y-4">
                            {topProducts.map((product, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                                {index + 1}
                                            </span>
                                        </div>
                                        <span className="font-medium text-gray-900 dark:text-white">{product.name}</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400">
                                        {product.count} sold
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">No product data available</p>
                    )}
                </div>

                {/* Recent Orders */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Recent Orders</h2>
                    {orders.length > 0 ? (
                        <div className="space-y-3">
                            {orders.slice(0, 10).map(order => (
                                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 dark:text-white">{order.product.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(order.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-emerald-600 dark:text-emerald-400">
                                            TZS {(order.totalAmount || order.total || 0).toLocaleString()}
                                        </p>
                                        <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'completed'
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">No orders yet</p>
                    )}
                </div>
            </div>
        </div>
    );
}
