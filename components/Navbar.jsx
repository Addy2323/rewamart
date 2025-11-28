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
                <Link href="/" className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-emerald-600 font-bold text-lg">R</span>
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-tight">RewaMart</h1>
                        <p className="text-[10px] opacity-90 font-medium">Shop • Earn • Invest</p>
                    </div>
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
                    {pathname !== '/admin' && !user && (
                        <Link href="/admin" className="text-xs bg-white/10 px-2 py-1 rounded-lg backdrop-blur-sm hover:bg-white/20 transition-colors">
                            Admin
                        </Link>
                    )}
                    <Link href="/wallet" className="text-right bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm hover:bg-white/20 transition-colors">
                        <p className="text-[10px] opacity-90 uppercase tracking-wider">Wallet Balance</p>
                        <p className="font-bold text-lg leading-none">TZS {balance.toLocaleString()}</p>
                    </Link>
                </div>
            </div>
        </header>
    );
}
