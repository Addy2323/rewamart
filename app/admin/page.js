'use client';

import { useState, useEffect } from 'react';
import { Save, X, Search } from 'lucide-react';
import Image from 'next/image';
import { getAllProducts, updateProductCashback } from '../../lib/products';
import Toast from '../../components/Toast';

export default function AdminPage() {
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editingValue, setEditingValue] = useState('');
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const allProducts = getAllProducts();
        setProducts(allProducts);
    }, []);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.vendor.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleEditClick = (product) => {
        setEditingId(product.id);
        setEditingValue(product.cashbackRate.toString());
    };

    const handleSave = (productId) => {
        const cashbackRate = parseInt(editingValue);
        
        if (isNaN(cashbackRate) || cashbackRate < 0 || cashbackRate > 100) {
            setToast({ type: 'error', message: 'Cashback must be between 0 and 100' });
            return;
        }

        updateProductCashback(productId, cashbackRate);
        
        // Update local state
        setProducts(products.map(p =>
            p.id === productId ? { ...p, cashbackRate } : p
        ));

        setEditingId(null);
        setToast({ type: 'success', message: 'Cashback updated successfully' });
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditingValue('');
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-24">
            <div className="max-w-6xl mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Cashback Management</h1>
                    <p className="text-gray-600">Manage cashback rates for all products</p>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Product</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Price</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Cashback %</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredProducts.map(product => (
                                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                                                    <Image
                                                        src={product.image}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                                                    <p className="text-xs text-gray-500">{product.vendor}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            TZS {product.price.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {editingId === product.id ? (
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        value={editingValue}
                                                        onChange={(e) => setEditingValue(e.target.value)}
                                                        className="w-20 px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                                    />
                                                    <span className="text-sm text-gray-600">%</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm font-bold text-emerald-600">{product.cashbackRate}%</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                {editingId === product.id ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleSave(product.id)}
                                                            className="flex items-center space-x-1 bg-emerald-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors"
                                                        >
                                                            <Save size={14} />
                                                            <span>Save</span>
                                                        </button>
                                                        <button
                                                            onClick={handleCancel}
                                                            className="flex items-center space-x-1 bg-gray-300 text-gray-700 px-3 py-1 rounded-lg text-xs font-medium hover:bg-gray-400 transition-colors"
                                                        >
                                                            <X size={14} />
                                                            <span>Cancel</span>
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => handleEditClick(product)}
                                                        className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredProducts.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <p>No products found</p>
                        </div>
                    )}
                </div>

                {/* Summary */}
                <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-600 text-sm">Total Products</p>
                            <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-600 text-sm">Average Cashback</p>
                            <p className="text-2xl font-bold text-emerald-600">
                                {products.length > 0 ? (products.reduce((sum, p) => sum + p.cashbackRate, 0) / products.length).toFixed(1) : 0}%
                            </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-600 text-sm">Highest Cashback</p>
                            <p className="text-2xl font-bold text-emerald-600">
                                {products.length > 0 ? Math.max(...products.map(p => p.cashbackRate)) : 0}%
                            </p>
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
