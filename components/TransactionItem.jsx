'use client';

import { ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp } from 'lucide-react';

export default function TransactionItem({ transaction }) {
    const isDebit = transaction.isDebit;

    const getIcon = () => {
        if (transaction.type === 'investment') return <TrendingUp size={18} className="text-blue-600" />;
        if (transaction.type === 'withdrawal') return <ArrowUpRight size={18} className="text-red-600" />;
        if (transaction.type === 'deposit') return <ArrowDownLeft size={18} className="text-green-600" />;
        if (transaction.type === 'cashback') return <Wallet size={18} className="text-emerald-600" />;
        if (transaction.type === 'commission') return <Users size={18} className="text-orange-600" />;
        return <Wallet size={18} className="text-gray-600" />;
    };

    const getBgColor = () => {
        if (transaction.type === 'investment') return 'bg-blue-100 dark:bg-blue-900';
        if (transaction.type === 'withdrawal') return 'bg-red-100 dark:bg-red-900';
        if (transaction.type === 'deposit') return 'bg-green-100 dark:bg-green-900';
        if (transaction.type === 'cashback') return 'bg-emerald-100 dark:bg-emerald-900';
        if (transaction.type === 'commission') return 'bg-orange-100 dark:bg-orange-900';
        return 'bg-gray-100 dark:bg-gray-700';
    };

    return (
        <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getBgColor()}`}>
                    {getIcon()}
                </div>
                <div>
                    <p className="font-medium text-sm text-gray-800 dark:text-gray-200 capitalize">{transaction.type}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{transaction.date.split('T')[0]}</p>
                </div>
            </div>
            <div className="text-right">
                <p className={`font-bold text-sm ${isDebit ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                    {isDebit ? '-' : '+'} TZS {transaction.amount.toLocaleString()}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">{transaction.description}</p>
            </div>
        </div>
    );
}
