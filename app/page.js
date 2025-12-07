'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, TrendingUp, Users, ArrowRight, Wallet, LogIn } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import TransactionItem from '../components/TransactionItem';
import { getWallet, getTransactions } from '../lib/wallet';
import { getReferralData } from '../lib/referrals';
import { isAuthenticated } from '../lib/auth';

export default function Dashboard() {
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [referralData, setReferralData] = useState(null);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        // Check authentication
        setAuthenticated(isAuthenticated());

        // Load initial data asynchronously
        const loadData = async () => {
            try {
                const walletData = await getWallet();
                const transactionData = await getTransactions();
                const referral = getReferralData();

                setWallet(walletData);
                setTransactions(transactionData.slice(0, 5)); // Get last 5 transactions
                setReferralData(referral);
            } catch (error) {
                console.error('Error loading dashboard data:', error);
                // Set default values on error
                setWallet({
                    balance: 0,
                    totalEarned: 0,
                    totalInvested: 0,
                    cashbackTotal: 0,
                    bonusTotal: 0,
                    autoInvestEnabled: false,
                    autoInvestPercent: 10
                });
                setTransactions([]);
                setReferralData({ earnings: 0 });
            }
        };

        loadData();
    }, []);

    if (!wallet) return <div className="p-8 text-center text-gray-900 dark:text-white">Loading...</div>;

    return (
        <div className="space-y-6 transition-colors">
            {/* Login Banner */}
            {!authenticated && (
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 rounded-xl shadow-lg mx-4 mt-4 dark:from-emerald-700 dark:to-teal-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-lg">Create Your Account</h3>
                            <p className="text-sm opacity-90">Login to access your dashboard and manage your account</p>
                        </div>
                        <Link
                            href="/auth"
                            className="bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2 whitespace-nowrap"
                        >
                            <LogIn size={18} />
                            <span>Login / Register</span>
                        </Link>
                    </div>
                </div>
            )}

            <div className="p-4 mx-auto space-y-6 animate-fade-in max-w-md md:max-w-6xl transition-all duration-300">
                {/* Laptop Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                    {/* Left Column (Welcome & Stats) */}
                    <div className="md:col-span-8 space-y-6">
                        {/* Welcome Section */}
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <div>
                                    <p className="text-emerald-100 text-sm mb-1">Welcome back,</p>
                                    <h2 className="text-2xl font-bold mb-4 md:mb-0">Valued Customer</h2>
                                </div>


                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4 dark:bg-gray-900">
                            <StatsCard
                                title="Total Earned"
                                value={`TZS ${wallet.totalEarned.toLocaleString()}`}
                                icon={Wallet}
                                color="green"
                            />
                            <StatsCard
                                title="Invested"
                                value={`TZS ${wallet.totalInvested.toLocaleString()}`}
                                icon={TrendingUp}
                                color="blue"
                            />
                        </div>

                        {/* Recent Activity (Moved here for laptop layout flow) */}
                        <div className="hidden md:block">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-gray-800">Recent Activity</h3>
                            </div>

                            <div className="space-y-3">
                                {transactions.length > 0 ? (
                                    transactions.map(t => (
                                        <TransactionItem key={t.id} transaction={t} />
                                    ))
                                ) : (
                                    <div className="text-center py-8 bg-white rounded-xl border border-gray-100 text-gray-400 text-sm">
                                        No transactions yet
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Actions & Impact) */}
                    <div className="md:col-span-4 space-y-6">
                        {/* Quick Actions */}
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-white mb-3">Quick Actions</h3>
                            <div className="grid grid-cols-3 md:grid-cols-2 gap-3">
                                <Link href="/shop" className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center space-y-2 hover:border-emerald-200 dark:hover:border-emerald-600 transition-colors shadow-sm">
                                    <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                        <ShoppingBag size={20} />
                                    </div>
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Shop</span>
                                </Link>

                                <Link href="/invest" className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center space-y-2 hover:border-blue-200 dark:hover:border-blue-600 transition-colors shadow-sm">
                                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <TrendingUp size={20} />
                                    </div>
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Invest</span>
                                </Link>

                                <Link href="/referral" className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center space-y-2 hover:border-orange-200 dark:hover:border-orange-600 transition-colors shadow-sm md:col-span-2">
                                    <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400">
                                        <Users size={20} />
                                    </div>
                                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Refer & Earn</span>
                                </Link>
                            </div>
                        </div>

                        {/* Impact Card */}
                        <div className="bg-gray-900 dark:bg-gray-950 rounded-2xl p-5 text-white">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Your Impact</h3>
                                    <p className="text-gray-400 text-xs mb-4">See how you're growing financially</p>
                                </div>
                                <div className="bg-gray-800 dark:bg-gray-800 p-2 rounded-lg">
                                    <TrendingUp size={20} className="text-green-400" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Cashback Earned</span>
                                    <span className="font-medium">TZS {wallet.cashbackTotal.toLocaleString()}</span>
                                </div>
                                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-green-500 h-full rounded-full" style={{ width: '45%' }}></div>
                                </div>

                                <div className="flex justify-between text-sm pt-2">
                                    <span className="text-gray-400">Referral Bonus</span>
                                    <span className="font-medium">TZS {referralData?.earnings.toLocaleString() || 0}</span>
                                </div>
                                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-orange-500 h-full rounded-full" style={{ width: '20%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity (Mobile Only - kept for mobile layout) */}
                <div className="md:hidden">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-800">Recent Activity</h3>
                    </div>

                    <div className="space-y-3">
                        {transactions.length > 0 ? (
                            transactions.map(t => (
                                <TransactionItem key={t.id} transaction={t} />
                            ))
                        ) : (
                            <div className="text-center py-8 bg-white rounded-xl border border-gray-100 text-gray-400 text-sm">
                                No transactions yet
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
