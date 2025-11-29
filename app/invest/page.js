'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Info, CheckCircle, AlertCircle, BookOpen, Lightbulb, Award, X, Cog } from 'lucide-react';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';
import { INVESTMENT_TYPES, calculateInvestmentCost, validateInvestment, addInvestment, getInvestments } from '../../lib/investments';
import { deductFunds, getWallet } from '../../lib/wallet';
import { storage, STORAGE_KEYS } from '../../lib/storage';

export default function InvestPage() {
    const [activeTab, setActiveTab] = useState('all');
    const [selectedType, setSelectedType] = useState(null);
    const [amount, setAmount] = useState('');
    const [costPreview, setCostPreview] = useState(null);
    const [toast, setToast] = useState(null);
    const [portfolio, setPortfolio] = useState([]);
    const [wallet, setWallet] = useState(null);
    const [uttAccountNumber, setUttAccountNumber] = useState('');
    const [selectedFund, setSelectedFund] = useState('');
    const [mPesaNumber, setMPesaNumber] = useState('');
    const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
    const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
    const [autoInvestEnabled, setAutoInvestEnabled] = useState(false);
    const [autoInvestPercentage, setAutoInvestPercentage] = useState(10);

    const successStories = [
        { name: 'Sarah', location: 'Dar es Salaam', initial: 5000, final: 150000, years: 2 },
        { name: 'John', location: 'Arusha', initial: 10000, final: 250000, years: 3 },
        { name: 'Fatima', location: 'Mwanza', initial: 7000, final: 180000, years: 2.5 },
        { name: 'David', location: 'Dodoma', initial: 3000, final: 120000, years: 4 },
        { name: 'Grace', location: 'Zanzibar', initial: 15000, final: 300000, years: 3 },
        { name: 'Peter', location: 'Morogoro', initial: 8000, final: 200000, years: 2 },
        { name: 'Mary', location: 'Tanga', initial: 6000, final: 160000, years: 3.5 },
        { name: 'Joseph', location: 'Iringa', initial: 4000, final: 130000, years: 2 },
        { name: 'Esther', location: 'Mbeya', initial: 12000, final: 280000, years: 4 },
        { name: 'Michael', location: 'Singida', initial: 9000, final: 220000, years: 3 },
        { name: 'Anna', location: 'Kigoma', initial: 5500, final: 170000, years: 2.5 },
        { name: 'James', location: 'Lindi', initial: 7500, final: 190000, years: 3 },
        { name: 'Rose', location: 'Ruvuma', initial: 3500, final: 110000, years: 4.5 },
        { name: 'Daniel', location: 'Pwani', initial: 11000, final: 260000, years: 2 },
        { name: 'Catherine', location: 'Manyara', initial: 8500, final: 210000, years: 3 },
    ];

    useEffect(() => {
        setPortfolio(getInvestments());
        setWallet(getWallet());

        // Load auto-invest settings
        const savedSettings = storage.get(STORAGE_KEYS.AUTO_INVEST_SETTINGS, { enabled: false, percentage: 10 });
        setAutoInvestEnabled(savedSettings.enabled);
        setAutoInvestPercentage(savedSettings.percentage);
    }, []);

    useEffect(() => {
        if (selectedType && amount) {
            setCostPreview(calculateInvestmentCost(selectedType.id, Number(amount)));
        } else {
            setCostPreview(null);
        }
    }, [selectedType, amount]);

    useEffect(() => {
        const storyInterval = setInterval(() => {
            setCurrentStoryIndex(prevIndex => (prevIndex + 1) % successStories.length);
        }, 5000);

        return () => clearInterval(storyInterval);
    }, [successStories.length]);

    const handleAutoInvestToggle = () => {
        const newEnabledState = !autoInvestEnabled;
        setAutoInvestEnabled(newEnabledState);
        storage.set(STORAGE_KEYS.AUTO_INVEST_SETTINGS, { enabled: newEnabledState, percentage: autoInvestPercentage });
        setToast({
            type: 'success',
            message: `Auto-Invest ${newEnabledState ? 'Enabled' : 'Disabled'}`
        });
    };

    const handleInvest = (e) => {
        e.preventDefault();
        const investAmount = Number(amount);

        // Validate UTT-specific fields
        if (selectedType.id === 'utt') {
            if (!uttAccountNumber.trim()) {
                setToast({ type: 'error', message: 'Please enter your UTT account number' });
                return;
            }
            if (!selectedFund) {
                setToast({ type: 'error', message: 'Please select a fund' });
                return;
            }
        }

        // Validate M-Wekeza specific fields
        if (selectedType.id === 'mwekeza') {
            const mPesaRegex = /^255[67]\d{8}$/;
            if (!mPesaNumber.trim()) {
                setToast({ type: 'error', message: 'Please enter your M-Pesa number' });
                return;
            }
            if (!mPesaRegex.test(mPesaNumber)) {
                setToast({ type: 'error', message: 'Invalid M-Pesa number format. Use 255xxxxxxxxx' });
                return;
            }
        }

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
                returnRate: selectedType.options?.[0]?.return || 'Market Based',
                ...(selectedType.id === 'utt' && { uttAccountNumber, selectedFund }),
                ...(selectedType.id === 'mwekeza' && { mPesaNumber })
            });

            setToast({ type: 'success', message: 'Investment successful!' });
            setSelectedType(null);
            setAmount('');
            setUttAccountNumber('');
            setSelectedFund('');
            setMPesaNumber('');
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

            {/* Auto-Invest Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 text-gray-900 dark:text-white shadow-lg flex items-center justify-between border dark:border-gray-700">
                <div className="flex items-center space-x-3">
                    <div className="bg-blue-600 p-2 rounded-lg">
                        <Cog size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold dark:text-white">Auto-Invest</h3>
                        <p className="text-sm text-gray-400">Invest {autoInvestPercentage}% of cashback</p>
                    </div>
                </div>
                <button onClick={handleAutoInvestToggle} className={`w-12 h-6 rounded-full flex items-center transition-colors ${autoInvestEnabled ? 'bg-green-500' : 'bg-gray-600'}`}>
                    <span className={`inline-block w-5 h-5 bg-white rounded-full transform transition-transform ${autoInvestEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>

            {/* Financial Education Section */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center space-x-3 mb-3">
                    <BookOpen size={28} />
                    <h3 className="text-xl font-bold">Financial Education</h3>
                </div>
                <p className="text-blue-100 mb-4">Learn how to make your money work for you</p>
                <button onClick={() => setIsEducationModalOpen(true)} className="w-full bg-white/20 hover:bg-white/30 p-3 rounded-lg font-medium transition-colors">
                    View Tips & Education
                </button>
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
                    setUttAccountNumber('');
                    setSelectedFund('');
                    setMPesaNumber('');
                }}
                title={`${selectedType?.name} Investment`}
            >
                {selectedType && (
                    <form onSubmit={handleInvest} className="space-y-4">
                        {/* Fee Info */}
                        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-xl text-sm">
                            <p className="text-blue-700 dark:text-blue-300 font-semibold">
                                Investment Fee: 1% of amount
                            </p>
                        </div>

                        {/* Investment Amount */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Investment Amount</label>
                            <input
                                type="number"
                                required
                                min={selectedType.minAmount}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                placeholder={`Minimum TZS ${selectedType.minAmount.toLocaleString()}`}
                            />
                        </div>

                        {/* UTT-specific fields */}
                        {selectedType.id === 'utt' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">UTT Account Number</label>
                                    <input
                                        type="text"
                                        required
                                        value={uttAccountNumber}
                                        onChange={(e) => setUttAccountNumber(e.target.value)}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                        placeholder="Enter UTT account number"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fund Name</label>
                                    <select
                                        required
                                        value={selectedFund}
                                        onChange={(e) => setSelectedFund(e.target.value)}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                    >
                                        <option value="">Select Fund</option>
                                        {selectedType.options.map((opt) => (
                                            <option key={opt.id} value={opt.id}>
                                                {opt.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}

                        {/* M-Wekeza-specific fields */}
                        {selectedType.id === 'mwekeza' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">M-Pesa Number</label>
                                <input
                                    type="text"
                                    required
                                    value={mPesaNumber}
                                    onChange={(e) => setMPesaNumber(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                    placeholder="255712345678"
                                />
                            </div>
                        )}

                        {/* Cost Preview */}
                        {costPreview && (
                            <div className="space-y-2 text-sm border-t dark:border-gray-600 pt-3">
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Investment Amount</span>
                                    <span>TZS {costPreview.amount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Platform Fee (1%)</span>
                                    <span>TZS {costPreview.fee.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between font-bold text-gray-900 dark:text-white pt-1">
                                    <span>Total Cost</span>
                                    <span>TZS {costPreview.total.toLocaleString()}</span>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-green-600 dark:bg-green-700 text-white py-3 rounded-xl font-bold hover:bg-green-700 dark:hover:bg-green-800 transition-colors"
                        >
                            Invest Now
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

            {/* Education Modal */}
            {isEducationModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-end">
                    <div className="bg-gray-50 dark:bg-gray-900 w-full rounded-t-2xl p-4 space-y-4 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom pb-20">
                        <div className="flex items-center justify-between pb-2 border-b dark:border-gray-700">
                            <div className="flex items-center space-x-2">
                                <Lightbulb className="text-yellow-500" size={24} />
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Financial Tips & Education</h2>
                            </div>
                            <button onClick={() => setIsEducationModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                <X size={24} />
                            </button>
                        </div>

                        {/* This Week's Tip */}
                        <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-xl p-4 text-white">
                            <h3 className="font-bold">This Week's Tip</h3>
                            <p className="text-sm mt-1">The 50/30/20 rule: Spend 50% on needs, 30% on wants, and save/invest 20% of your income for a secure financial future.</p>
                        </div>

                        {/* Other Tips */}
                        <div className="space-y-3 pt-2">
                            <div className="flex items-start space-x-3">
                                <div className="w-1.5 h-10 bg-blue-500 rounded-full"></div>
                                <div>
                                    <h4 className="font-bold text-gray-800 dark:text-gray-200">Start Small, Think Big</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Even TZS 1,000 invested monthly can grow to over TZS 100,000 in 5 years with compound interest!</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-1.5 h-10 bg-green-500 rounded-full"></div>
                                <div>
                                    <h4 className="font-bold text-gray-800 dark:text-gray-200">Diversify Your Investments</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Don't put all your money in one place. Mix UTT funds, bonds, and stocks to reduce risk.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-1.5 h-10 bg-blue-500 rounded-full"></div>
                                <div>
                                    <h4 className="font-bold text-gray-800 dark:text-gray-200">Emergency Fund First</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Before investing, save 3-6 months of expenses in your wallet for emergencies.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="w-1.5 h-10 bg-orange-500 rounded-full"></div>
                                <div>
                                    <h4 className="font-bold text-gray-800 dark:text-gray-200">Use Auto-Invest</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Set up auto-invest to automatically invest a portion of your rewards. It's the easiest way to build wealth!</p>
                                </div>
                            </div>
                        </div>

                        {/* Success Story */}
                        <div className="bg-yellow-50 dark:bg-yellow-900/50 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mt-4">
                            <div className="flex items-center space-x-2">
                                <Award className="text-yellow-600 dark:text-yellow-500" size={20} />
                                <h4 className="font-bold text-yellow-800 dark:text-yellow-300">Success Story</h4>
                            </div>
                            <p className="text-sm text-yellow-700 dark:text-yellow-200 mt-2 italic">
                                {`"I started with just TZS ${successStories[currentStoryIndex].initial.toLocaleString()} from my RewaMart rewards. After ${successStories[currentStoryIndex].years} years of consistent investing, I now have over TZS ${successStories[currentStoryIndex].final.toLocaleString()}!" - ${successStories[currentStoryIndex].name}, ${successStories[currentStoryIndex].location}`}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
