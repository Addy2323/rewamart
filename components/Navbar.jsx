'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getWallet } from '../lib/wallet';
import { getCurrentUser } from '../lib/auth';
import { Wallet, ShoppingBag, TrendingUp, Users, User, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
    const [balance, setBalance] = useState(0);
    const [user, setUser] = useState(null);
    const pathname = usePathname();

    useEffect(() => {
        // Initial load
        const wallet = getWallet();
        setBalance(wallet.balance);

        const currentUser = getCurrentUser();
        setUser(currentUser);

        // Poll for changes (simple way to keep in sync without complex state management)
        const interval = setInterval(() => {
            const w = getWallet();
            setBalance(w.balance);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <header className="gradient-bg text-white p-4 sticky top-0 z-50 shadow-md">
            <div className={`mx-auto flex items-center justify-between transition-all duration-300 ${pathname === '/' ? 'max-w-md md:max-w-6xl' : 'max-w-md'}`}>
                <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group">
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0">
                        <img
                            src="/images/logo.png"
                            alt="RewaMart Logo"
                            className="w-full h-full object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
                        />
                    </div>
                    {/* <div className="hidden sm:block">
                        <h1 className="font-bold text-base sm:text-lg leading-tight text-white">RewaMart</h1>
                        <p className="text-[9px] sm:text-[10px] opacity-90 font-medium">Shop • Earn • Invest</p>
                    </div> */}
                </Link>

                <div className="flex items-center space-x-3">
                    {user && (
                        <Link
                            href={user.role === 'admin' ? '/admin-dashboard' : user.role === 'vendor' ? '/vendor-dashboard' : '/user-dashboard'}
                            className="text-xs bg-white/10 px-2 py-1 rounded-lg backdrop-blur-sm hover:bg-white/20 transition-colors flex items-center space-x-1"
                        >
                            <LayoutDashboard size={14} />
                            <span>Dashboard</span>
                        </Link>
                    )}
                    {pathname === '/admin' && (
                        <Link href="/shop" className="text-xs bg-white/10 px-2 py-1 rounded-lg backdrop-blur-sm hover:bg-white/20 transition-colors">
                            Back to Shop
                        </Link>
                    )}
                    {/* {pathname !== '/admin' && !user && (
                        <Link href="/admin" className="text-xs bg-white/10 px-2 py-1 rounded-lg backdrop-blur-sm hover:bg-white/20 transition-colors">
                            Admin
                        </Link>
                    )} */}
                </div>
            </div>
        </header>
    );
}
