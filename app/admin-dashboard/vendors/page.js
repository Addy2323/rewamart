'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Search, User, Mail, Phone, Shield } from 'lucide-react';
import { getCurrentUser } from '../../../lib/auth';
import Toast from '../../../components/Toast';
import Modal from '../../../components/Modal';

export default function VendorManagementPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [toast, setToast] = useState(null);

    // New vendor form state
    const [newVendor, setNewVendor] = useState({
        name: '',
        email: '',
        phone: '',
        password: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const currentUser = getCurrentUser();
            if (!currentUser || currentUser.role !== 'admin') {
                router.push('/auth');
                return;
            }
            setUser(currentUser);
            fetchVendors();
        };
        checkAuth();
    }, [router]);

    const fetchVendors = async () => {
        try {
            const response = await fetch('/api/admin/vendors', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('rewamart_token')}`
                }
            });
            const data = await response.json();
            if (data.success) {
                setVendors(data.vendors);
            } else {
                setToast({ type: 'error', message: data.message || 'Failed to fetch vendors' });
            }
        } catch (error) {
            console.error('Error fetching vendors:', error);
            setToast({ type: 'error', message: 'Error loading vendors' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddVendor = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/admin/vendors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('rewamart_token')}`
                },
                body: JSON.stringify(newVendor)
            });

            const data = await response.json();

            if (data.success) {
                setToast({ type: 'success', message: 'Vendor added successfully' });
                setVendors([data.vendor, ...vendors]);
                setIsAddModalOpen(false);
                setNewVendor({ name: '', email: '', phone: '', password: '' });
            } else {
                setToast({ type: 'error', message: data.message || 'Failed to add vendor' });
            }
        } catch (error) {
            console.error('Error adding vendor:', error);
            setToast({ type: 'error', message: 'Error adding vendor' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteVendor = async (vendorId) => {
        if (!confirm('Are you sure you want to remove this vendor? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/vendors?id=${vendorId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('rewamart_token')}`
                }
            });

            const data = await response.json();

            if (data.success) {
                setToast({ type: 'success', message: 'Vendor removed successfully' });
                setVendors(vendors.filter(v => v.id !== vendorId));
            } else {
                setToast({ type: 'error', message: data.message || 'Failed to remove vendor' });
            }
        } catch (error) {
            console.error('Error removing vendor:', error);
            setToast({ type: 'error', message: 'Error removing vendor' });
        }
    };

    const filteredVendors = vendors.filter(vendor =>
        vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-gray-900">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/admin-dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft size={20} className="text-gray-600" />
                        </Link>
                        <h1 className="text-xl font-bold text-gray-900">Manage Vendors</h1>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center space-x-2"
                    >
                        <Plus size={20} />
                        <span>Add Vendor</span>
                    </button>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search vendors by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                </div>

                {/* Vendors List */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {filteredVendors.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {filteredVendors.map(vendor => (
                                <div key={vendor.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                            <User size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{vendor.name}</h3>
                                            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                                <div className="flex items-center space-x-1">
                                                    <Mail size={14} />
                                                    <span>{vendor.email}</span>
                                                </div>
                                                {vendor.phone && (
                                                    <div className="flex items-center space-x-1">
                                                        <Phone size={14} />
                                                        <span>{vendor.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-right hidden sm:block">
                                            <span className="text-xs text-gray-400 block">Joined</span>
                                            <span className="text-sm font-medium text-gray-700">
                                                {new Date(vendor.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteVendor(vendor.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Remove Vendor"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            No vendors found matching your search.
                        </div>
                    )}
                </div>
            </div>

            {/* Add Vendor Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add New Vendor"
            >
                <form onSubmit={handleAddVendor} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
                        <input
                            type="text"
                            required
                            value={newVendor.name}
                            onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="Business or person name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            required
                            value={newVendor.email}
                            onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="vendor@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                            type="tel"
                            value={newVendor.phone}
                            onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="Optional"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            value={newVendor.password}
                            onChange={(e) => setNewVendor({ ...newVendor, password: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="Set initial password"
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-emerald-600 text-white py-2 rounded-lg font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? 'Adding Vendor...' : 'Add Vendor'}
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
