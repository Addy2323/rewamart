'use client';

import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, Download, Settings, Wallet as WalletIcon } from 'lucide-react';
import TransactionItem from '../../components/TransactionItem';
import StatsCard from '../../components/StatsCard';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';
import { getWallet, getTransactions, deductFunds, toggleAutoInvest } from '../../lib/wallet';

export default function WalletPage() {
    const [wallet, setWallet] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [filter, setFilter] = useState('all');
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [withdrawPhone, setWithdrawPhone] = useState('');
    const [toast, setToast] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setWallet(getWallet());
        setTransactions(getTransactions());
    };

    const filteredTransactions = transactions.filter(t => {
        if (filter === 'all') return true;
        return t.type === filter;
    });

    const handleWithdraw = (e) => {
        e.preventDefault();
        const amount = Number(withdrawAmount);
        const fee = amount * 0.02;
        const total = amount + fee;

        if (total > wallet.balance) {
            setToast({ type: 'error', message: 'Insufficient balance including fees' });
            return;
        }

        const result = deductFunds(total, `Withdrawal to ${withdrawPhone}`, 'withdrawal');

        if (result.success) {
            setToast({ type: 'success', message: `Withdrawal of TZS ${amount.toLocaleString()} processed` });
            setIsWithdrawModalOpen(false);
            setWithdrawAmount('');
            setWithdrawPhone('');
            loadData();
        } else {
            setToast({ type: 'error', message: result.error });
        }
    };

    const handleAutoInvestToggle = () => {
        const newState = toggleAutoInvest(!wallet.autoInvestEnabled);
        setWallet({ ...wallet, autoInvestEnabled: newState.autoInvestEnabled });
        setToast({
            type: 'success',
            message: `Auto-invest ${newState.autoInvestEnabled ? 'enabled' : 'disabled'}`
        });
    };

    if (!wallet) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="p-4 space-y-6 pb-24 animate-fade-in dark:bg-gray-900 transition-colors">
            {/* Balance Card */}
            <div className="bg-gray-900 dark:bg-gray-950 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600 rounded-full filter blur-3xl opacity-20 -mr-10 -mt-10"></div>

                <p className="text-gray-400 text-sm mb-1">Available Balance</p>
                <h2 className="text-4xl font-bold mb-6">TZS {wallet.balance.toLocaleString()}</h2>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setIsWithdrawModalOpen(true)}
                        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <ArrowUpRight size={20} />
                        <span>Withdraw</span>
                    </button>
                    <button className="bg-gray-800 dark:bg-gray-700 text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors">
                        <ArrowDownLeft size={20} />
                        <span>Deposit</span>
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 dark:bg-gray-900">
                <StatsCard
                    title="Total Cashback"
                    value={`TZS ${wallet.cashbackTotal.toLocaleString()}`}
                    icon={WalletIcon}
                    color="emerald"
                />
                <StatsCard
                    title="Referral Bonus"
                    value={`TZS ${wallet.bonusTotal.toLocaleString()}`}
                    icon={ArrowDownLeft}
                    color="orange"
                />
            </div>

            {/* Auto-Invest Setting */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg">
                        <Settings size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800 dark:text-white">Auto-Invest</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Invest {wallet.autoInvestPercent}% of cashback</p>
                    </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={wallet.autoInvestEnabled}
                        onChange={handleAutoInvestToggle}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
            </div>

            {/* Transactions */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">History</h3>
                    <button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                        <Download size={20} />
                    </button>
                </div>

                {/* Filters */}
                <div className="flex space-x-2 overflow-x-auto pb-4 scrollbar-hide">
                    {['all', 'deposit', 'withdrawal', 'investment', 'cashback'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${filter === f
                                ? 'bg-gray-900 dark:bg-gray-700 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                <div className="space-y-3">
                    {filteredTransactions.length > 0 ? (
                        filteredTransactions.map(t => (
                            <TransactionItem key={t.id} transaction={t} />
                        ))
                    ) : (
                        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                            No transactions found
                        </div>
                    )}
                </div>
            </div>

            {/* Withdraw Modal */}
            <Modal
                isOpen={isWithdrawModalOpen}
                onClose={() => setIsWithdrawModalOpen(false)}
                title="Withdraw Funds"
            >
                <form onSubmit={handleWithdraw} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (TZS)</label>
                        <input
                            type="number"
                            required
                            min="1000"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            className="w-full p-3 bg-gray-50 dark:bg-gray-700 dark:text-white rounded-xl border-none focus:ring-2 focus:ring-emerald-500 dark:placeholder-gray-400"
                            placeholder="Min. 1,000"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                        <input
                            type="tel"
                            required
                            value={withdrawPhone}
                            onChange={(e) => setWithdrawPhone(e.target.value)}
                            className="w-full p-3 bg-gray-50 dark:bg-gray-700 dark:text-white rounded-xl border-none focus:ring-2 focus:ring-emerald-500 dark:placeholder-gray-400"
                            placeholder="07..."
                        />
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900 p-3 rounded-lg text-xs text-yellow-800 dark:text-yellow-200">
                        <p>Note: A 2% withdrawal fee applies.</p>
                        {withdrawAmount && (
                            <div className="mt-1 font-bold">
                                Fee: TZS {(Number(withdrawAmount) * 0.02).toLocaleString()}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors"
                    >
                        Confirm Withdrawal
                    </button>
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
