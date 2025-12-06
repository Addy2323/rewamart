'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, Home, ShoppingBag, Wallet, TrendingUp, Settings, LogOut, Package, Users, BarChart3, Store, Heart, User } from 'lucide-react';
import { logoutUser } from '../lib/auth';

export default function Sidebar({ userRole = 'user' }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logoutUser();
        router.push('/auth');
    };

    const isActive = (path) => pathname === path;

    // Menu items based on user role
    const menuItems = userRole === 'vendor' ? [
        { label: 'Dashboard', icon: Home, href: '/vendor-dashboard' },
        { label: 'Products', icon: Package, href: '/vendor-dashboard' },
        { label: 'Analytics', icon: BarChart3, href: '/vendor-dashboard' },
        { label: 'Settings', icon: Settings, href: '/vendor-dashboard' },
    ] : [
        { label: 'Dashboard', icon: Home, href: '/user-dashboard' },
        { label: 'Shop', icon: ShoppingBag, href: '/shop' },

        { label: 'Invest', icon: TrendingUp, href: '/invest' },
        { label: 'Referrals', icon: Users, href: '/referrals' },
        { label: 'Favorites', icon: Heart, href: '/user-dashboard' },
        { label: 'Settings', icon: Settings, href: '/user-dashboard' },
    ];

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-50 md:hidden bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                    }`}
            >
                {/* Logo Section */}
                <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-800">
                    <Link href="/" className="flex items-center space-x-3 group">
                        <div className="relative w-50 h-45 sm:w-16 sm:h-16 flex-shrink-0 rounded-lg overflow-hidden shadow-md group-hover:shadow-lg transition-shadow duration-300">
                            <img
                                src="/images/logo.png"
                                alt="RewaMart Logo"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                        </div>
                        <div>
                            <h1 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white leading-tight">RewaMart</h1>
                            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Shop • Earn • Invest</p>
                        </div>
                    </Link>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${active
                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <Icon size={20} />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile Section */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                    <Link
                        href="/profile"
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <User size={20} />
                        <span className="font-medium">Profile</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main content should have margin on desktop */}
            <style jsx>{`
                @media (min-width: 768px) {
                    main {
                        margin-left: 16rem; /* 64 * 4 = 256px */
                    }
                }
            `}</style>
        </>
    );
}
