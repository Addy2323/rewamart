'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Gift, Truck, Percent, Tag, Calendar, X, Check } from 'lucide-react';
import Modal from './Modal';
import Toast from './Toast';

const PROMO_TYPES = [
    { value: 'free_shipping', label: 'Free Shipping', icon: Truck, color: 'bg-blue-500' },
    { value: 'discount_percent', label: 'Discount %', icon: Percent, color: 'bg-green-500' },
    { value: 'discount_fixed', label: 'Fixed Discount', icon: Tag, color: 'bg-purple-500' },
    { value: 'campaign', label: 'Campaign', icon: Gift, color: 'bg-orange-500' }
];

export default function PromotionConfigForm({ vendorName, categories = [] }) {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState(null);
    const [vendorProducts, setVendorProducts] = useState([]);
    const [toast, setToast] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'free_shipping',
        discountValue: '',
        minOrderAmount: '',
        startDate: '',
        endDate: '',
        isActive: true,
        targetCategory: '',
        targetProductId: ''
    });

    // Fetch existing promotions
    useEffect(() => {
        fetchPromotions();
        fetchVendorProducts();
    }, [vendorName]);

    const fetchPromotions = async () => {
        try {
            const response = await fetch(`/api/promotions?vendor=${encodeURIComponent(vendorName)}&active=false`);
            const data = await response.json();
            if (data.promotions) {
                setPromotions(data.promotions);
            }
        } catch (error) {
            console.error('Error fetching promotions:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchVendorProducts = async () => {
        try {
            const response = await fetch(`/api/products?vendor=${encodeURIComponent(vendorName)}`);
            const data = await response.json();
            if (data.products) {
                setVendorProducts(data.products);
            }
        } catch (error) {
            console.error('Error fetching vendor products:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const openCreateModal = () => {
        setEditingPromo(null);
        setFormData({
            title: '',
            description: '',
            type: 'free_shipping',
            discountValue: '',
            minOrderAmount: '',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            isActive: true,
            targetCategory: '',
            targetProductId: ''
        });
        setModalOpen(true);
    };

    const openEditModal = (promo) => {
        setEditingPromo(promo);
        setFormData({
            title: promo.title,
            description: promo.description || '',
            type: promo.type,
            discountValue: promo.discountValue?.toString() || '',
            minOrderAmount: promo.minOrderAmount?.toString() || '',
            startDate: new Date(promo.startDate).toISOString().split('T')[0],
            endDate: new Date(promo.endDate).toISOString().split('T')[0],
            isActive: promo.isActive,
            targetCategory: promo.targetCategory?.toString() || '',
            targetProductId: promo.targetProductId?.toString() || ''
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            vendorName,
            title: formData.title,
            description: formData.description || null,
            type: formData.type,
            discountValue: formData.discountValue ? parseFloat(formData.discountValue) : null,
            minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : null,
            startDate: formData.startDate,
            endDate: formData.endDate,
            isActive: formData.isActive,
            targetCategory: formData.targetCategory ? parseInt(formData.targetCategory) : null,
            targetProductId: formData.targetProductId ? parseInt(formData.targetProductId) : null
        };

        console.log('Submitting promotion payload:', payload);

        try {
            const url = editingPromo
                ? `/api/promotions/${editingPromo.id}`
                : '/api/promotions';

            const response = await fetch(url, {
                method: editingPromo ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setToast({ type: 'success', message: editingPromo ? 'Promotion updated!' : 'Promotion created!' });
                setModalOpen(false);
                fetchPromotions();
            } else {
                const error = await response.json();
                setToast({ type: 'error', message: error.details ? `${error.error}: ${error.details}` : (error.error || 'Failed to save promotion') });
            }
        } catch (error) {
            console.error('Error saving promotion:', error);
            setToast({ type: 'error', message: 'Failed to save promotion' });
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this promotion?')) return;

        try {
            const response = await fetch(`/api/promotions/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                setToast({ type: 'success', message: 'Promotion deleted!' });
                fetchPromotions();
            } else {
                setToast({ type: 'error', message: 'Failed to delete promotion' });
            }
        } catch (error) {
            console.error('Error deleting promotion:', error);
            setToast({ type: 'error', message: 'Failed to delete promotion' });
        }
    };

    const getPromoTypeInfo = (type) => {
        return PROMO_TYPES.find(t => t.value === type) || PROMO_TYPES[0];
    };

    const getDaysRemaining = (endDate) => {
        const now = new Date();
        const end = new Date(endDate);
        const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        return diff;
    };

    const isPromoActive = (promo) => {
        if (!promo) return false;

        const now = new Date();
        const start = new Date(promo.startDate);
        const end = new Date(promo.endDate);

        // Set start to beginning of day and end to end of day (local time)
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        // Ensure isActive is treated as a boolean (handles "true", 1, etc.)
        const isActive = promo.isActive === true || promo.isActive === 'true' || promo.isActive === 1;

        const isStarted = now >= start;
        const isNotExpired = now <= end;

        const active = isActive && isStarted && isNotExpired;

        return active;
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Promotions</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Configure promotional popups for your customers
                    </p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-emerald-500/25"
                >
                    <Plus size={18} />
                    <span>Add Promotion</span>
                </button>
            </div>

            {/* Promotions List */}
            {promotions.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <Gift size={48} className="mx-auto text-gray-400 mb-4" />
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">No Promotions Yet</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Create your first promotion to attract more customers
                    </p>
                    <button
                        onClick={openCreateModal}
                        className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
                    >
                        Create Promotion →
                    </button>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {promotions.map((promo) => {
                        const typeInfo = getPromoTypeInfo(promo.type);
                        const TypeIcon = typeInfo.icon;
                        const daysRemaining = getDaysRemaining(promo.endDate);
                        const active = isPromoActive(promo);

                        return (
                            <div
                                key={promo.id}
                                className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border-2 transition-all ${active
                                    ? 'border-emerald-500 shadow-emerald-500/10'
                                    : 'border-transparent opacity-75'
                                    }`}
                            >
                                {/* Status badge */}
                                <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold ${active
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                    }`}>
                                    {active ? 'Active' : daysRemaining < 0 ? 'Expired' : 'Inactive'}
                                </div>

                                <div className="p-5">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 ${typeInfo.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                            <TypeIcon size={24} className="text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-800 dark:text-white truncate">
                                                {promo.title}
                                            </h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                                {promo.description || typeInfo.label}
                                            </p>

                                            {/* Promo details */}
                                            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
                                                {promo.discountValue && (
                                                    <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-1 rounded">
                                                        {promo.type === 'discount_percent' ? `${promo.discountValue}% OFF` : `${promo.discountValue.toLocaleString()} TSh OFF`}
                                                    </span>
                                                )}
                                                {promo.minOrderAmount && (
                                                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded">
                                                        Min: {promo.minOrderAmount.toLocaleString()} TSh
                                                    </span>
                                                )}
                                                {daysRemaining > 0 && (
                                                    <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-1 rounded flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        {daysRemaining} days left
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                        <button
                                            onClick={() => openEditModal(promo)}
                                            className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 text-sm font-medium transition-colors"
                                        >
                                            <Edit2 size={14} />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(promo.id)}
                                            className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 text-sm font-medium transition-colors"
                                        >
                                            <Trash2 size={14} />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create/Edit Modal */}
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingPromo ? 'Edit Promotion' : 'Create Promotion'}
            >
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Promotion Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Promotion Type
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {PROMO_TYPES.map((type) => {
                                const TypeIcon = type.icon;
                                return (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                                        className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${formData.type === type.value
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className={`w-8 h-8 ${type.color} rounded flex items-center justify-center`}>
                                            <TypeIcon size={16} className="text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {type.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Title *
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="e.g., Holiday Special Offer"
                            required
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Describe your promotion..."
                            rows={2}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Discount Value (for discount types) */}
                    {(formData.type === 'discount_percent' || formData.type === 'discount_fixed') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Discount Value {formData.type === 'discount_percent' ? '(%)' : '(TSh)'} *
                            </label>
                            <input
                                type="number"
                                name="discountValue"
                                value={formData.discountValue}
                                onChange={handleInputChange}
                                placeholder={formData.type === 'discount_percent' ? 'e.g., 10' : 'e.g., 5000'}
                                required={formData.type === 'discount_percent' || formData.type === 'discount_fixed'}
                                min="0"
                                max={formData.type === 'discount_percent' ? '100' : undefined}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>
                    )}

                    {/* Minimum Order Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Minimum Order Amount (TSh)
                        </label>
                        <input
                            type="number"
                            name="minOrderAmount"
                            value={formData.minOrderAmount}
                            onChange={handleInputChange}
                            placeholder="e.g., 50000 (optional)"
                            min="0"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Start Date *
                            </label>
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                End Date *
                            </label>
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleInputChange}
                                required
                                min={formData.startDate}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Target Category */}
                    {categories.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Target Category
                            </label>
                            <select
                                name="targetCategory"
                                value={formData.targetCategory}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Target Product */}
                    {vendorProducts.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Target Product
                            </label>
                            <select
                                name="targetProductId"
                                value={formData.targetProductId}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            >
                                <option value="">No Specific Product</option>
                                {vendorProducts.map(prod => (
                                    <option key={prod.id} value={prod.id}>{prod.name}</option>
                                ))}
                            </select>
                            <p className="text-[10px] text-gray-500 mt-1">
                                If selected, clicking the popup will navigate directly to this product.
                            </p>
                        </div>
                    )}

                    {/* Active Toggle */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <div>
                            <p className="font-medium text-gray-700 dark:text-gray-300">Enable Promotion</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Show this promotion to customers</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleInputChange}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-500 peer-checked:bg-emerald-600"></div>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/25"
                    >
                        <Check size={18} />
                        {editingPromo ? 'Update Promotion' : 'Create Promotion'}
                    </button>
                </form>
            </Modal>

            {/* Toast */}
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
