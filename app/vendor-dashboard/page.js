'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Package, TrendingUp, Users, Settings, Store, BarChart3, Plus, Edit2, Trash2, Search } from 'lucide-react';
import { getCurrentUser, logoutUser, getUserById, updateUserProfile } from '../../lib/auth';
import Toast from '../../components/Toast';
import Modal from '../../components/Modal';

export default function VendorDashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [toast, setToast] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [profile, setProfile] = useState({
        phone: '',
        address: '',
        city: ''
    });
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        image: '',
        vendor: '',
        inStock: true,
        rating: '4.5',
        cashback: '0',
    });

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (!currentUser || currentUser.role !== 'vendor') {
            router.push('/auth');
            return;
        }
        setUser(currentUser);

        // Load vendor profile
        const userData = getUserById(currentUser.id);
        if (userData?.profile) {
            setProfile(userData.profile);
        }

        // Fetch vendor products from API
        fetchVendorProducts();
    }, [router]);

    useEffect(() => {
        const filtered = products.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredProducts(filtered);
    }, [searchQuery, products]);

    const fetchVendorProducts = async () => {
        try {
            const response = await fetch('/api/vendor/products');
            const data = await response.json();
            setProducts(data.products || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

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

    const handleOpenProductModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData(product);
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                price: '',
                description: '',
                image: '',
                vendor: user?.name || '',
                inStock: true,
                rating: '4.5',
                cashback: '0',
            });
        }
        setIsProductModalOpen(true);
    };

    const handleCloseProductModal = () => {
        setIsProductModalOpen(false);
        setEditingProduct(null);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        try {
            const method = editingProduct ? 'PUT' : 'POST';
            const url = editingProduct
                ? `/api/vendor/products/${editingProduct.id}`
                : '/api/vendor/products';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setToast({
                    type: 'success',
                    message: editingProduct ? 'Product updated' : 'Product added',
                });
                handleCloseProductModal();
                fetchVendorProducts();
            } else {
                setToast({ type: 'error', message: 'Failed to save product' });
            }
        } catch (error) {
            console.error('Error saving product:', error);
            setToast({ type: 'error', message: 'Failed to save product' });
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!confirm('Delete this product?')) return;

        try {
            const response = await fetch(`/api/vendor/products/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setToast({ type: 'success', message: 'Product deleted' });
                fetchVendorProducts();
            } else {
                setToast({ type: 'error', message: 'Failed to delete product' });
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            setToast({ type: 'error', message: 'Failed to delete product' });
        }
    };

    if (!user) {
        return <div className="min-h-screen flex items-center justify-center text-gray-900 dark:text-white">Loading...</div>;
    }

    const totalSales = products.reduce((sum, p) => sum + p.price, 0);
    const totalProducts = products.length;
    const inStockProducts = products.filter(p => p.inStock).length;
    const totalCashback = products.reduce((sum, p) => sum + (p.cashback || 0), 0);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sticky top-0 z-50 shadow-md">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link href="/shop" className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-bold">R</span>
                        </div>
                        <h1 className="font-bold text-lg">RewaMart Vendor</h1>
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
                    <h2 className="text-2xl font-bold text-gray-900">Welcome, {user.name}</h2>
                    <p className="text-gray-600 mt-2">Manage your store, products, and sales</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Total Sales */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Sales</p>
                                <p className="text-2xl font-bold text-blue-600 mt-2">
                                    TZS {totalSales.toLocaleString()}
                                </p>
                            </div>
                            <TrendingUp className="text-blue-600" size={32} />
                        </div>
                    </div>

                    {/* Products Listed */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Products Listed</p>
                                <p className="text-2xl font-bold text-green-600 mt-2">{totalProducts}</p>
                            </div>
                            <Package className="text-green-600" size={32} />
                        </div>
                    </div>

                    {/* In Stock */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">In Stock</p>
                                <p className="text-2xl font-bold text-purple-600 mt-2">{inStockProducts}</p>
                            </div>
                            <Users className="text-purple-600" size={32} />
                        </div>
                    </div>

                    {/* Total Cashback */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm">Total Cashback</p>
                                <p className="text-2xl font-bold text-orange-600 mt-2">{totalCashback}%</p>
                            </div>
                            <Store className="text-orange-600" size={32} />
                        </div>
                    </div>
                </div>

                {/* Store Profile & Products */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Store Profile */}
                    <div className="lg:col-span-1 bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                <Store className="text-blue-600" size={32} />
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
                                    <p className="text-xs text-gray-600">Store Address</p>
                                    <p className="font-medium text-gray-900">{profile.address || 'Not set'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-600">City</p>
                                    <p className="font-medium text-gray-900">{profile.city || 'Not set'}</p>
                                </div>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                                >
                                    <Settings size={18} />
                                    <span>Edit Store Info</span>
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-600">Store Address</label>
                                    <input
                                        type="text"
                                        value={profile.address}
                                        onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-600">City</label>
                                    <input
                                        type="text"
                                        value={profile.city}
                                        onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleUpdateProfile}
                                        className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
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

                    {/* Products Section */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Your Products</h3>
                            <button
                                onClick={() => handleOpenProductModal()}
                                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus size={18} />
                                <span>Add Product</span>
                            </button>
                        </div>

                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 bg-white"
                                />
                            </div>
                        </div>

                        {filteredProducts.length > 0 ? (
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {filteredProducts.map(product => (
                                    <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-900">{product.name}</p>
                                                <p className="text-sm text-gray-600">{product.vendor}</p>
                                                <p className="text-xs text-gray-500 mt-1">{product.description}</p>
                                            </div>
                                            <div className="text-right ml-4">
                                                <p className="font-bold text-blue-600">TZS {product.price.toLocaleString()}</p>
                                                <p className="text-xs text-orange-600 font-medium mt-1">Cashback: {product.cashback || 0}%</p>
                                                <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${product.inStock
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {product.inStock ? 'In Stock' : 'Out'}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2 ml-4">
                                                <button
                                                    onClick={() => handleOpenProductModal(product)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProduct(product.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Package size={48} className="mx-auto mb-3 opacity-50" />
                                <p>{searchQuery ? 'No products found' : 'No products listed yet'}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center">
                        <Package className="text-blue-600 mx-auto mb-3" size={32} />
                        <h3 className="font-bold text-gray-900">Add Product</h3>
                        <p className="text-sm text-gray-600 mt-1">List new products</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center">
                        <BarChart3 className="text-green-600 mx-auto mb-3" size={32} />
                        <h3 className="font-bold text-gray-900">Analytics</h3>
                        <p className="text-sm text-gray-600 mt-1">View sales reports</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow text-center">
                        <Users className="text-purple-600 mx-auto mb-3" size={32} />
                        <h3 className="font-bold text-gray-900">Customers</h3>
                        <p className="text-sm text-gray-600 mt-1">Manage customer reviews</p>
                    </div>
                </div>
            </div>

            {/* Product Modal */}
            <Modal
                isOpen={isProductModalOpen}
                onClose={handleCloseProductModal}
                title={editingProduct ? 'Edit Product' : 'Add New Product'}
            >
                <form onSubmit={handleSaveProduct} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Enter product name"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price (TZS)</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cashback %</label>
                            <input
                                type="number"
                                name="cashback"
                                value={formData.cashback}
                                onChange={handleInputChange}
                                min="0"
                                max="100"
                                step="0.1"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                            <input
                                type="number"
                                name="rating"
                                value={formData.rating}
                                onChange={handleInputChange}
                                min="0"
                                max="5"
                                step="0.1"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Enter product description"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                        <input
                            type="url"
                            name="image"
                            value={formData.image}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="https://..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                        <input
                            type="text"
                            name="vendor"
                            value={formData.vendor}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Vendor name"
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            name="inStock"
                            checked={formData.inStock}
                            onChange={handleInputChange}
                            className="w-4 h-4 rounded"
                        />
                        <label className="text-sm font-medium text-gray-700">In Stock</label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            {editingProduct ? 'Update Product' : 'Add Product'}
                        </button>
                        <button
                            type="button"
                            onClick={handleCloseProductModal}
                            className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>

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
