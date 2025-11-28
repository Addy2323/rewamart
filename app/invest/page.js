'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Info, CheckCircle, AlertCircle } from 'lucide-react';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';
import { INVESTMENT_TYPES, calculateInvestmentCost, validateInvestment, addInvestment, getInvestments } from '../../lib/investments';
import { deductFunds, getWallet } from '../../lib/wallet';

export default function InvestPage() {
    const [activeTab, setActiveTab] = useState('all');
    const [selectedType, setSelectedType] = useState(null);
    const [amount, setAmount] = useState('');
    const [costPreview, setCostPreview] = useState(null);
    const [toast, setToast] = useState(null);
    const [portfolio, setPortfolio] = useState([]);
    const [wallet, setWallet] = useState(null);

    useEffect(() => {
        setPortfolio(getInvestments());
        setWallet(getWallet());
    }, []);

    useEffect(() => {
        if (selectedType && amount) {
            setCostPreview(calculateInvestmentCost(selectedType.id, Number(amount)));
        } else {
            setCostPreview(null);
        }
    }, [selectedType, amount]);

    const handleInvest = (e) => {
        e.preventDefault();
        const investAmount = Number(amount);

        // Validate
        const validation = validateInvestment(selectedType.id, investAmount);
        if (!validation.valid) {
            setToast({ type: 'error', message: validation.error });
            return;
        }

        // Check funds
        const totalCost = costPreview.total;
        if (wallet.balance < totalCost) {
            setToast({ type: 'error', message: `Insufficient funds. You need TZS ${totalCost.toLocaleString()}` });
            return;
        }

        // Process transaction
        const result = deductFunds(totalCost, `Investment in ${selectedType.name}`, 'investment');

        if (result.success) {
            addInvestment({
                typeId: selectedType.id,
                typeName: selectedType.name,
                amount: investAmount,
                fee: costPreview.fee,
                returnRate: selectedType.options?.[0]?.return || 'Market Based'
            });

            setToast({ type: 'success', message: 'Investment successful!' });
            setSelectedType(null);
            setAmount('');
            setPortfolio(getInvestments());
            setWallet(getWallet());
        } else {
            setToast({ type: 'error', message: result.error });
        }
    };

    return (
        <div className="p-4 pb-24 space-y-6 animate-fade-in dark:bg-gray-900 transition-colors">
            {/* Portfolio Summary */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 rounded-2xl p-6 text-white shadow-lg">
                <p className="text-blue-100 text-sm mb-1">Total Portfolio Value</p>
                <h2 className="text-3xl font-bold mb-4">
                    TZS {portfolio.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}
                </h2>
                <div className="flex items-center space-x-2 text-sm bg-white/10 w-fit px-3 py-1 rounded-full">
                    <TrendingUp size={16} className="text-green-400" />
                    <span>+12.5% Annual Return (Avg)</span>
                </div>
            </div>

            {/* Investment Options */}
            <div>
                <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4">Investment Opportunities</h3>
                <div className="grid grid-cols-1 gap-4">
                    {Object.values(INVESTMENT_TYPES).map((type) => (
                        <div
                            key={type.id}
                            onClick={() => setSelectedType(type)}
                            className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all cursor-pointer"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg">
                                    <TrendingUp size={24} />
                                </div>
                                <span className="text-xs font-bold bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">
                                    Min. TZS {type.minAmount.toLocaleString()}
                                </span>
                            </div>
                            <h4 className="font-bold text-gray-800 dark:text-white mb-1">{type.name}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{type.description}</p>

                            <div className="space-y-1">
                                {type.options.slice(0, 2).map((opt, idx) => (
                                    <div key={idx} className="flex justify-between text-xs">
                                        <span className="text-gray-600 dark:text-gray-400">{opt.name}</span>
                                        <span className="font-medium text-green-600 dark:text-green-400">{opt.return || opt.price}</span>
                                    </div>
                                ))}
                                {type.options.length > 2 && (
                                    <p className="text-xs text-blue-500 dark:text-blue-400 font-medium pt-1">
                                        +{type.options.length - 2} more options
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Active Investments */}
            {portfolio.length > 0 && (
                <div>
                    <h3 className="font-bold text-lg text-gray-800 dark:text-white mb-4">Your Portfolio</h3>
                    <div className="space-y-3">
                        {portfolio.map((inv) => (
                            <div key={inv.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold text-sm text-gray-800 dark:text-white">{inv.typeName}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(inv.date).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-sm text-gray-800 dark:text-white">TZS {inv.amount.toLocaleString()}</p>
                                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">{inv.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Investment Modal */}
            <Modal
                isOpen={!!selectedType}
                onClose={() => {
                    setSelectedType(null);
                    setAmount('');
                }}
                title={`Invest in ${selectedType?.name}`}
            >
                {selectedType && (
                    <form onSubmit={handleInvest} className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800">
                            <div className="flex items-start space-x-2">
                                <Info size={16} className="mt-0.5 flex-shrink-0" />
                                <p>{selectedType.description}</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Invest</label>
                            <input
                                type="number"
                                required
                                min={selectedType.minAmount}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
                                placeholder={`Min. ${selectedType.minAmount.toLocaleString()}`}
                            />
                        </div>

                        {costPreview && (
                            <div className="space-y-2 text-sm border-t pt-3">
                                <div className="flex justify-between text-gray-600">
                                    <span>Investment Amount</span>
                                    <span>TZS {costPreview.amount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Platform Fee (1%)</span>
                                    <span>TZS {costPreview.fee.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between font-bold text-gray-900 pt-1">
                                    <span>Total Cost</span>
                                    <span>TZS {costPreview.total.toLocaleString()}</span>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                        >
                            Confirm Investment
                        </button>
                    </form>
                )}
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
