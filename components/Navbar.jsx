'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getWallet } from '../lib/wallet';
import { getCurrentUser } from '../lib/auth';
import { Wallet, ShoppingBag, TrendingUp, Users, User, LayoutDashboard, Search, Menu } from 'lucide-react';

export default function Navbar() {
    const [user, setUser] = useState(null);
    const pathname = usePathname();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const currentUser = getCurrentUser();
        setUser(currentUser);
    }, []);

    const navItems = [
        { name: 'All', href: '/shop' },
        { name: 'Deals', href: '/shop?category=deals' },
        { name: 'Invest', href: '/invest' },
        { name: 'New Releases', href: '/new-releases' },
        { name: 'Customer Service', href: '/contact' },
        { name: 'Best Sales', href: '/best-sellers' },
    ];

    return (
        <header className="bg-[#047857] text-white sticky top-0 z-50 shadow-md">
            {/* Top Row: Logo & User Actions */}
            <div className="px-4 py-2 flex items-center justify-between max-w-6xl mx-auto">
                <Link href="/" className="flex items-center space-x-2">
                    <div className="relative w-24 h-8">
                        {/* Using text as logo placeholder if image doesn't fit well, or keep image */}
                        <img
                            src="/images/logo.png"
                            alt="RewaMart"
                            className="w-full h-full object-contain brightness-0 invert"
                        />
                    </div>
                </Link>

                <div className="flex items-center space-x-4">
                    <Link href={user ? (user.role === 'admin' ? '/admin-dashboard' : user.role === 'vendor' ? '/vendor-dashboard' : '/user-dashboard') : '/auth'} className="flex items-center space-x-1">
                        <div className="text-xs text-right hidden sm:block">
                            <p className="font-normal">Hello, {user ? user.name.split(' ')[0] : 'Sign in'}</p>
                            <p className="font-bold">Account & Lists</p>
                        </div>
                        <User className="h-8 w-8 sm:hidden" />
                    </Link>

                    <Link href="/cart" className="relative flex items-end">
                        <div className="relative">
                            <ShoppingBag size={28} />
                            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">0</span>
                        </div>
                        <span className="font-bold text-sm hidden sm:block mb-1 ml-1">Cart</span>
                    </Link>
                </div>
            </div>

            {/* Middle Row: Search Bar */}
            <div className="px-4 pb-3 max-w-6xl mx-auto">
                <div className="flex bg-white rounded-lg overflow-hidden h-10 shadow-sm">
                    <div className="bg-gray-100 px-3 flex items-center border-r border-gray-300 text-gray-600 text-xs font-medium cursor-pointer hover:bg-gray-200 transition-colors">
                        All <span className="ml-1">▼</span>
                    </div>
                    <input
                        type="text"
                        className="flex-1 px-3 text-gray-900 outline-none text-sm"
                        placeholder="Search RewaMart"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="bg-orange-400 hover:bg-orange-500 px-4 flex items-center justify-center transition-colors">
                        <Search size={20} className="text-gray-900" />
                    </button>
                </div>
            </div>

            {/* Bottom Row: Secondary Nav */}
            <div className="bg-[#065f46] px-4 py-2 overflow-x-auto no-scrollbar">
                <div className="max-w-6xl mx-auto flex items-center space-x-5 text-sm whitespace-nowrap">
                    <button className="flex items-center space-x-1 font-bold">
                        <Menu size={18} />
                        <span>All</span>
                    </button>
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="hover:underline hover:text-orange-200 transition-colors"
                        >
                            {item.name}
                        </Link>
                    ))}
                </div>
            </div>
        </header>
    );
}
