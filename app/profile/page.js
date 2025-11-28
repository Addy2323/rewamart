'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Settings, HelpCircle, LogOut, ChevronRight, Bell, Shield, LayoutDashboard, Smartphone, Shirt, Home, HeartPulse } from 'lucide-react';
import { getCurrentUser, logoutUser, updateUserProfile } from '../../lib/auth';
import { getTheme, setTheme } from '../../lib/theme';
import Toast from '../../components/Toast';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [toast, setToast] = useState(null);
    const [activeModal, setActiveModal] = useState(null);
    const [profileData, setProfileData] = useState({ phone: '', address: '', city: '' });
    const [notificationSettings, setNotificationSettings] = useState({
        orders: true,
        promotions: true,
        updates: true
    });
    const [appSettings, setAppSettings] = useState({
        darkMode: false,
        notifications: true,
        autoSave: true
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    const CATEGORIES = [
        { id: 'electronics', name: 'Electronics', icon: Smartphone },
        { id: 'fashion', name: 'Fashion', icon: Shirt },
        { id: 'home', name: 'Home & Garden', icon: Home },
        { id: 'health', name: 'Health & Beauty', icon: HeartPulse },
    ];

    const [preferredCategories, setPreferredCategories] = useState(['electronics', 'health']);

    useEffect(() => {
        const currentUser = getCurrentUser();
        setUser(currentUser);
        if (currentUser?.profile) {
            setProfileData(currentUser.profile);
        }

        // Initialize dark mode setting
        const currentTheme = getTheme();
        setAppSettings(prev => ({
            ...prev,
            darkMode: currentTheme === 'dark'
        }));
    }, []);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Go to Dashboard', action: 'dashboard' },
        { icon: User, label: 'Edit Profile', action: 'profile' },
        { icon: Bell, label: 'Notifications', action: 'notifications' },
        { icon: Shield, label: 'Privacy & Security', action: 'privacy' },
        { icon: Settings, label: 'App Settings', action: 'settings' },
        { icon: HelpCircle, label: 'Help & Support', action: 'help' },
    ];

    const handleMenuClick = (action) => {
        if (action === 'dashboard') {
            handleDashboard();
        } else {
            setActiveModal(action);
        }
    };

    const handleCategoryChange = (categoryId) => {
        setPreferredCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const handleSavePreferences = () => {
        if (!user) {
            setToast({ type: 'error', message: 'You must be logged in to save preferences.' });
            return;
        }

        const result = updateUserProfile(user.id, { preferredCategories });

        if (result.success) {
            setToast({ type: 'success', message: 'Preferences saved successfully!' });
        } else {
            setToast({ type: 'error', message: result.error });
        }
    };

    const handleDashboard = () => {
        if (!user) {
            router.push('/auth');
            return;
        }
        if (user.role === 'admin') {
            router.push('/admin-dashboard');
        } else if (user.role === 'vendor') {
            router.push('/vendor-dashboard');
        } else {
            router.push('/user-dashboard');
        }
    };

    const handleSaveProfile = () => {
        setToast({ type: 'success', message: 'Profile updated successfully!' });
        setActiveModal(null);
    };

    const handleSaveSettings = () => {
        // Apply dark mode theme
        const newTheme = appSettings.darkMode ? 'dark' : 'light';
        setTheme(newTheme);
        
        setToast({ type: 'success', message: 'Settings saved successfully!' });
        setActiveModal(null);
    };

    const handleChangePassword = () => {
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setToast({ type: 'error', message: 'Please fill in all password fields' });
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setToast({ type: 'error', message: 'New passwords do not match' });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setToast({ type: 'error', message: 'New password must be at least 6 characters' });
            return;
        }

        // In a real app, verify current password against stored password
        if (passwordData.currentPassword !== user?.password) {
            setToast({ type: 'error', message: 'Current password is incorrect' });
            return;
        }

        setToast({ type: 'success', message: 'Password changed successfully!' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordForm(false);
    };

    const handleLogout = () => {
        logoutUser();
        setToast({ type: 'success', message: 'Logged out successfully' });
        setTimeout(() => router.push('/auth'), 1500);
    };

    return (
        <div className="p-4 pb-24 space-y-6 animate-fade-in dark:bg-gray-900 transition-colors">
            {/* Profile Header */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center space-x-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                    <User size={32} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">{user?.name || 'User Profile'}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email || 'Not logged in'}</p>
                    {user && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                    )}
                </div>
            </div>

            {/* Preferred Categories */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Preferred Categories</h3>
                <div className="grid grid-cols-2 gap-4">
                    {CATEGORIES.map((category) => {
                        const Icon = category.icon;
                        return (
                            <label key={category.id} className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={preferredCategories.includes(category.id)}
                                    onChange={() => handleCategoryChange(category.id)}
                                    className="h-5 w-5 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
                                />
                                <Icon className="h-6 w-6 text-gray-500" />
                                <span className="font-medium text-gray-700 dark:text-gray-300">{category.name}</span>
                            </label>
                        );
                    })}
                </div>
                <button
                    onClick={handleSavePreferences}
                    className="w-full mt-4 bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors"
                >
                    Save Preferences
                </button>
            </div>

            {/* Menu */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                {menuItems.map((item, idx) => {
                    const Icon = item.icon;
                    const isHighlighted = item.action === 'dashboard';
                    return (
                        <button
                            key={idx}
                            onClick={() => handleMenuClick(item.action)}
                            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-50 dark:border-gray-700 last:border-none"
                        >
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg ${isHighlighted ? 'bg-emerald-50 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400' : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                                    <Icon size={20} />
                                </div>
                                <span className={`font-medium ${isHighlighted ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}`}>{item.label}</span>
                            </div>
                            <ChevronRight size={20} className="text-gray-400 dark:text-gray-600" />
                        </button>
                    );
                })}
            </div>

            {/* Logout */}
            <button
                onClick={handleLogout}
                className="w-full bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-400 p-4 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-red-100 dark:hover:bg-red-800 transition-colors"
            >
                <LogOut size={20} />
                <span>Log Out</span>
            </button>

            {/* App Info */}
            <div className="text-center text-gray-400 dark:text-gray-600 text-xs">
                <p>RewaMart v2.1.0</p>
                <p>Built for Tanzania 🇹🇿</p>
            </div>

            {/* Edit Profile Modal */}
            {activeModal === 'profile' && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end pb-20">
                    <div className="bg-white dark:bg-gray-800 w-full rounded-t-2xl p-6 space-y-4 animate-in slide-in-from-bottom">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Profile</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                                <input
                                    type="tel"
                                    value={profileData.phone}
                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                    placeholder="Enter phone number"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Address</label>
                                <input
                                    type="text"
                                    value={profileData.address}
                                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                                    placeholder="Enter address"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">City</label>
                                <input
                                    type="text"
                                    value={profileData.city}
                                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                                    placeholder="Enter city"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none mt-1"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 pt-4 border-t border-gray-200">
                            <button
                                onClick={handleSaveProfile}
                                className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors"
                            >
                                Save Changes
                            </button>
                            <button
                                onClick={() => setActiveModal(null)}
                                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notifications Modal */}
            {activeModal === 'notifications' && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end pb-20">
                    <div className="bg-white w-full rounded-t-2xl p-6 space-y-4 animate-in slide-in-from-bottom">
                        <h2 className="text-xl font-bold text-gray-900">Notification Settings</h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="font-medium text-gray-700">Order Updates</span>
                                <input
                                    type="checkbox"
                                    checked={notificationSettings.orders}
                                    onChange={(e) => setNotificationSettings({ ...notificationSettings, orders: e.target.checked })}
                                    className="w-5 h-5 text-emerald-600 rounded"
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="font-medium text-gray-700">Promotions & Offers</span>
                                <input
                                    type="checkbox"
                                    checked={notificationSettings.promotions}
                                    onChange={(e) => setNotificationSettings({ ...notificationSettings, promotions: e.target.checked })}
                                    className="w-5 h-5 text-emerald-600 rounded"
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="font-medium text-gray-700">App Updates</span>
                                <input
                                    type="checkbox"
                                    checked={notificationSettings.updates}
                                    onChange={(e) => setNotificationSettings({ ...notificationSettings, updates: e.target.checked })}
                                    className="w-5 h-5 text-emerald-600 rounded"
                                />
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setToast({ type: 'success', message: 'Notification settings updated!' });
                                setActiveModal(null);
                            }}
                            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors mt-4 border-t border-gray-200 pt-4"
                        >
                            Save Settings
                        </button>
                    </div>
                </div>
            )}

            {/* Privacy & Security Modal */}
            {activeModal === 'privacy' && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end pb-20">
                    <div className="bg-white w-full rounded-t-2xl p-6 space-y-4 animate-in slide-in-from-bottom max-h-[70vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-gray-900">Privacy & Security</h2>
                        <div className="space-y-3">
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                                <p className="text-sm text-gray-600 mt-1">Add an extra layer of security to your account</p>
                                <button className="mt-3 text-emerald-600 font-medium text-sm hover:text-emerald-700">Enable 2FA</button>
                            </div>
                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                <p className="font-medium text-gray-900">✓ Password Protected</p>
                                <p className="text-sm text-gray-600 mt-1">Your account is secured with a strong password</p>
                            </div>
                            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                <p className="font-medium text-gray-900">Change Password</p>
                                <p className="text-sm text-gray-600 mt-1">Update your password regularly for better security</p>
                                <button 
                                    onClick={() => setShowPasswordForm(true)}
                                    className="mt-3 text-emerald-600 font-medium text-sm hover:text-emerald-700 transition-colors"
                                >
                                    Change Password
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={() => setActiveModal(null)}
                            className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300 transition-colors mt-4 border-t border-gray-200 pt-4"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* App Settings Modal */}
            {activeModal === 'settings' && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end pb-20">
                    <div className="bg-white w-full rounded-t-2xl p-6 space-y-4 animate-in slide-in-from-bottom">
                        <h2 className="text-xl font-bold text-gray-900">App Settings</h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="font-medium text-gray-700">Dark Mode</span>
                                <input
                                    type="checkbox"
                                    checked={appSettings.darkMode}
                                    onChange={(e) => setAppSettings({ ...appSettings, darkMode: e.target.checked })}
                                    className="w-5 h-5 text-emerald-600 rounded"
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="font-medium text-gray-700">Push Notifications</span>
                                <input
                                    type="checkbox"
                                    checked={appSettings.notifications}
                                    onChange={(e) => setAppSettings({ ...appSettings, notifications: e.target.checked })}
                                    className="w-5 h-5 text-emerald-600 rounded"
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="font-medium text-gray-700">Auto-Save</span>
                                <input
                                    type="checkbox"
                                    checked={appSettings.autoSave}
                                    onChange={(e) => setAppSettings({ ...appSettings, autoSave: e.target.checked })}
                                    className="w-5 h-5 text-emerald-600 rounded"
                                />
                            </div>
                        </div>
                        <button
                            onClick={handleSaveSettings}
                            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors mt-4 border-t border-gray-200 pt-4"
                        >
                            Save Settings
                        </button>
                    </div>
                </div>
            )}

            {/* Help & Support Modal */}
            {activeModal === 'help' && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end pb-20">
                    <div className="bg-white w-full rounded-t-2xl p-6 space-y-4 animate-in slide-in-from-bottom max-h-[70vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-gray-900">Help & Support</h2>
                        <div className="space-y-3">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="font-medium text-gray-900">How do I reset my password?</p>
                                <p className="text-sm text-gray-600 mt-2">Go to Privacy & Security settings and click "Change Password"</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="font-medium text-gray-900">How do I contact support?</p>
                                <p className="text-sm text-gray-600 mt-2">Email us at support@rewamart.com or call +255 7XX XXX XXX</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="font-medium text-gray-900">How do I delete my account?</p>
                                <p className="text-sm text-gray-600 mt-2">Contact our support team for account deletion requests</p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <p className="font-medium text-gray-900">What payment methods are accepted?</p>
                                <p className="text-sm text-gray-600 mt-2">We accept M-Pesa, Airtel Money, and bank transfers</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setActiveModal(null)}
                            className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300 transition-colors mt-4 border-t border-gray-200 pt-4"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {showPasswordForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-end pb-20">
                    <div className="bg-white w-full rounded-t-2xl p-6 space-y-4 animate-in slide-in-from-bottom">
                        <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Current Password</label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                    placeholder="Enter current password"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    placeholder="Enter new password (min 6 characters)"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    placeholder="Confirm new password"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none mt-1"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 pt-4 border-t border-gray-200">
                            <button
                                onClick={handleChangePassword}
                                className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors"
                            >
                                Change Password
                            </button>
                            <button
                                onClick={() => {
                                    setShowPasswordForm(false);
                                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                }}
                                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
