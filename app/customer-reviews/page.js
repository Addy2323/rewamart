'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Truck, Trash2, ArrowLeft, Search, Filter, CheckCircle, XCircle, Clock, Package, MapPin, Phone } from 'lucide-react';
import { storage, STORAGE_KEYS } from '../../lib/storage';
import { getOrderStatusLabel, getOrderStatusColor, ORDER_STATUS, updateOrderStatus } from '../../lib/orders';
import Image from 'next/image';

export default function CustomerOrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        totalRevenue: 0
    });

    useEffect(() => {
        loadOrders();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [searchQuery, filterStatus, orders]);

    const loadOrders = () => {
        const allOrders = storage.get(STORAGE_KEYS.ORDERS, []);

        // Calculate stats
        const total = allOrders.length;
        const pending = allOrders.filter(o => o.status === ORDER_STATUS.PENDING).length;
        const processing = allOrders.filter(o => o.status === ORDER_STATUS.PROCESSING).length;
        const shipped = allOrders.filter(o => o.status === ORDER_STATUS.SHIPPED).length;
        const delivered = allOrders.filter(o => o.status === ORDER_STATUS.DELIVERED).length;
        const totalRevenue = allOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        setStats({ total, pending, processing, shipped, delivered, totalRevenue });
        setOrders(allOrders);
    };

    const applyFilters = () => {
        let filtered = [...orders];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(o =>
                o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                o.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (o.deliveryInfo?.phone || '').includes(searchQuery) ||
                (o.deliveryInfo?.address || '').toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Status filter
        if (filterStatus !== 'all') {
            filtered = filtered.filter(o => o.status === filterStatus);
        }

        // Sort by date (newest first)
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        setFilteredOrders(filtered);
    };

    const handleUpdateStatus = (orderId, newStatus) => {
        const result = updateOrderStatus(orderId, newStatus);
        if (result.success) {
            loadOrders();
        }
    };

    const handleDeleteOrder = (orderId) => {
        if (confirm('Are you sure you want to delete this order?')) {
            const allOrders = storage.get(STORAGE_KEYS.ORDERS, []);
            const updatedOrders = allOrders.filter(o => o.id !== orderId);
            storage.set(STORAGE_KEYS.ORDERS, updatedOrders);
            loadOrders();
        }
    };

    const getStatusActions = (order) => {
        const actions = [];

        if (order.status === ORDER_STATUS.PENDING) {
            actions.push({ label: 'Process', status: ORDER_STATUS.PROCESSING, color: 'blue' });
        }
        if (order.status === ORDER_STATUS.PROCESSING) {
            actions.push({ label: 'Ship', status: ORDER_STATUS.SHIPPED, color: 'purple' });
        }
        if (order.status === ORDER_STATUS.SHIPPED) {
            actions.push({ label: 'Deliver', status: ORDER_STATUS.DELIVERED, color: 'green' });
        }

        return actions;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={24} className="text-gray-600 dark:text-gray-300" />
                        </button>
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                                <Users size={24} className="text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Orders</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Manage customer orders</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Total Orders</p>
                            <Package size={16} className="text-blue-600" />
                        </div>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
                            <Clock size={16} className="text-yellow-600" />
                        </div>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Processing</p>
                            <Package size={16} className="text-blue-600" />
                        </div>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.processing}</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Shipped</p>
                            <Truck size={16} className="text-purple-600" />
                        </div>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.shipped}</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Delivered</p>
                            <CheckCircle size={16} className="text-green-600" />
                        </div>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.delivered}</p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400">Revenue</p>
                            <Package size={16} className="text-emerald-600" />
                        </div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">TZS {stats.totalRevenue.toLocaleString()}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search orders, products, phone, address..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-purple-500 outline-none dark:text-white dark:placeholder-gray-400"
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border-none rounded-lg focus:ring-2 focus:ring-purple-500 outline-none dark:text-white"
                        >
                            <option value="all">All Status</option>
                            <option value={ORDER_STATUS.PENDING}>Pending</option>
                            <option value={ORDER_STATUS.PROCESSING}>Processing</option>
                            <option value={ORDER_STATUS.SHIPPED}>Shipped</option>
                            <option value={ORDER_STATUS.DELIVERED}>Delivered</option>
                        </select>
                    </div>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    {filteredOrders.length > 0 ? (
                        filteredOrders.map(order => (
                            <div key={order.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                                {/* Order Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h3 className="font-bold text-gray-900 dark:text-white">
                                                Order #{order.id.slice(-8).toUpperCase()}
                                            </h3>
                                            <span className={`text-xs px-3 py-1 rounded-full font-medium ${getOrderStatusColor(order.status)}`}>
                                                {getOrderStatusLabel(order.status)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(order.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                                            TZS {(order.totalAmount || 0).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Product Info */}
                                <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-4">
                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white">
                                        <Image
                                            src={order.product.image}
                                            alt={order.product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-900 dark:text-white">{order.product.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{order.product.vendor}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900 dark:text-white">
                                            TZS {order.product.price.toLocaleString()}
                                        </p>
                                        {order.cashbackEarned > 0 && (
                                            <p className="text-xs text-green-600 dark:text-green-400">
                                                +{order.cashbackEarned.toLocaleString()} cashback
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Delivery Info */}
                                {order.deliveryInfo && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        <div className="space-y-2">
                                            <div className="flex items-start space-x-2">
                                                <MapPin size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Delivery Address</p>
                                                    <p className="text-sm text-gray-900 dark:text-white">
                                                        {order.deliveryInfo.address || 'Not provided'}
                                                    </p>
                                                    {order.deliveryInfo.distance && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {order.deliveryInfo.distance.toFixed(1)} km away
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-start space-x-2">
                                                <Phone size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Phone Number</p>
                                                    <p className="text-sm text-gray-900 dark:text-white">
                                                        {order.deliveryInfo.phone || 'Not provided'}
                                                    </p>
                                                </div>
                                            </div>
                                            {order.deliveryInfo.transport && (
                                                <div className="flex items-start space-x-2">
                                                    <Truck size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Delivery Method</p>
                                                        <p className="text-sm text-gray-900 dark:text-white capitalize">
                                                            {order.deliveryInfo.transport}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    {getStatusActions(order).map(action => (
                                        <button
                                            key={action.status}
                                            onClick={() => handleUpdateStatus(order.id, action.status)}
                                            className={`flex items-center space-x-1 px-4 py-2 bg-${action.color}-600 text-white rounded-lg hover:bg-${action.color}-700 transition-colors text-sm font-medium`}
                                            style={{
                                                backgroundColor: action.color === 'blue' ? '#2563eb' :
                                                    action.color === 'purple' ? '#9333ea' :
                                                        action.color === 'green' ? '#16a34a' : '#6b7280'
                                            }}
                                        >
                                            {action.status === ORDER_STATUS.PROCESSING && <Package size={16} />}
                                            {action.status === ORDER_STATUS.SHIPPED && <Truck size={16} />}
                                            {action.status === ORDER_STATUS.DELIVERED && <CheckCircle size={16} />}
                                            <span>{action.label}</span>
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => handleDeleteOrder(order.id)}
                                        className="flex items-center space-x-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                    >
                                        <Trash2 size={16} />
                                        <span>Delete</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 shadow-sm text-center">
                            <Users size={48} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">No orders found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
