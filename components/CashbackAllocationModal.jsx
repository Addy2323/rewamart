import { useState, useEffect } from 'react';
import { X, CheckCircle, TrendingUp, Wallet, ArrowRight, Percent } from 'lucide-react';
import { INVESTMENT_PROVIDERS, UTT_AMISS_FUNDS } from '../lib/investments';

export default function CashbackAllocationModal({ isOpen, onClose, amount, onAllocate }) {
    const [step, setStep] = useState('allocation'); // allocation, details, success
    const [sliderValue, setSliderValue] = useState(50); // 0 = 100% withdraw, 100 = 100% invest
    const [provider, setProvider] = useState(amount >= 10000 ? INVESTMENT_PROVIDERS.UTT_AMISS : INVESTMENT_PROVIDERS.M_WEKEZA);
    const [details, setDetails] = useState({
        phoneNumber: '', // For withdrawal
        accountNumber: '', // For investment
        fundId: UTT_AMISS_FUNDS[0].id // For investment
    });
    const [loading, setLoading] = useState(false);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setStep('allocation');
            setSliderValue(50);
            setLoading(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const investAmount = Math.round((amount * sliderValue) / 100);
    const withdrawAmount = amount - investAmount;
    const canInvest = investAmount >= 1000 || investAmount === 0; // Minimum investment check, unless 0

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        await onAllocate({
            investAmount,
            withdrawAmount,
            investDetails: investAmount > 0 ? {
                provider,
                accountNumber: details.accountNumber,
                fundId: details.fundId
            } : null,
            withdrawDetails: withdrawAmount > 0 ? {
                phoneNumber: details.phoneNumber
            } : null
        });

        setLoading(false);
        setStep('success');
    };

    const renderAllocationStep = () => {
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="text-emerald-600" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Cashback Earned!</h3>
                    <p className="text-gray-600 mt-2">Total Amount</p>
                    <p className="text-3xl font-bold text-emerald-600 mt-1">TZS {amount.toLocaleString()}</p>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between text-sm font-medium text-gray-600">
                        <span>Withdraw</span>
                        <span>Invest</span>
                    </div>

                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={sliderValue}
                        onChange={(e) => setSliderValue(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div className={`p-4 rounded-xl border-2 transition-colors ${withdrawAmount > 0 ? 'border-blue-100 bg-blue-50' : 'border-gray-100 bg-gray-50 opacity-50'}`}>
                            <div className="flex items-center space-x-2 mb-1">
                                <Wallet className="text-blue-600" size={20} />
                                <span className="font-bold text-blue-900">Withdraw</span>
                            </div>
                            <p className="text-lg font-bold text-blue-700">TZS {withdrawAmount.toLocaleString()}</p>
                            <p className="text-xs text-blue-600">{100 - sliderValue}%</p>
                        </div>

                        <div className={`p-4 rounded-xl border-2 transition-colors ${investAmount > 0 ? 'border-emerald-100 bg-emerald-50' : 'border-gray-100 bg-gray-50 opacity-50'}`}>
                            <div className="flex items-center space-x-2 mb-1">
                                <TrendingUp className="text-emerald-600" size={20} />
                                <span className="font-bold text-emerald-900">Invest</span>
                            </div>
                            <p className="text-lg font-bold text-emerald-700">TZS {investAmount.toLocaleString()}</p>
                            <p className="text-xs text-emerald-600">{sliderValue}%</p>
                        </div>
                    </div>

                    {!canInvest && investAmount > 0 && (
                        <p className="text-xs text-center text-red-500">
                            Minimum investment amount is TZS 1,000. Please increase the investment portion.
                        </p>
                    )}
                </div>

                <button
                    onClick={() => setStep('details')}
                    disabled={!canInvest}
                    className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Continue
                </button>
            </div>
        );
    };

    const renderDetailsStep = () => (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-gray-900">Confirm Details</h3>
                <button
                    type="button"
                    onClick={() => setStep('allocation')}
                    className="text-sm text-gray-500 hover:text-gray-700"
                >
                    Back
                </button>
            </div>

            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                {/* Withdrawal Details */}
                {withdrawAmount > 0 && (
                    <div className="space-y-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <div className="flex items-center space-x-2 text-blue-800 mb-2">
                            <Wallet size={20} />
                            <h4 className="font-bold">Withdrawal (TZS {withdrawAmount.toLocaleString()})</h4>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Money Number</label>
                            <input
                                type="tel"
                                value={details.phoneNumber}
                                onChange={(e) => setDetails({ ...details, phoneNumber: e.target.value })}
                                placeholder="e.g., 0712345678"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                required
                            />
                        </div>
                    </div>
                )}

                {/* Investment Details */}
                {investAmount > 0 && (
                    <div className="space-y-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                        <div className="flex items-center space-x-2 text-emerald-800 mb-2">
                            <TrendingUp size={20} />
                            <h4 className="font-bold">Investment (TZS {investAmount.toLocaleString()})</h4>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Provider</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setProvider(INVESTMENT_PROVIDERS.UTT_AMISS)}
                                    disabled={investAmount < 10000}
                                    className={`py-2 px-3 rounded-lg text-sm font-medium border relative ${provider === INVESTMENT_PROVIDERS.UTT_AMISS
                                        ? 'bg-emerald-600 text-white border-emerald-600'
                                        : investAmount < 10000
                                            ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    UTT AMIS
                                    {investAmount < 10000 && (
                                        <span className="block text-[10px] font-normal mt-0.5">Min. 10,000</span>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setProvider(INVESTMENT_PROVIDERS.M_WEKEZA)}
                                    className={`py-2 px-3 rounded-lg text-sm font-medium border ${provider === INVESTMENT_PROVIDERS.M_WEKEZA
                                        ? 'bg-emerald-600 text-white border-emerald-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    M-Wekeza
                                </button>
                            </div>
                        </div>

                        {provider === INVESTMENT_PROVIDERS.UTT_AMISS ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">UTT Account Number</label>
                                    <input
                                        type="text"
                                        value={details.accountNumber}
                                        onChange={(e) => setDetails({ ...details, accountNumber: e.target.value })}
                                        placeholder="Enter UTT account number"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fund Name</label>
                                    <select
                                        value={details.fundId}
                                        onChange={(e) => setDetails({ ...details, fundId: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                                        required
                                    >
                                        {UTT_AMISS_FUNDS.map(fund => (
                                            <option key={fund.id} value={fund.id}>{fund.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        ) : (
                            // M-Wekeza uses phone number (same as withdrawal, but might be different account)
                            // If user is also withdrawing, we could pre-fill this, but let's keep it separate for clarity or use same state if desired.
                            // For simplicity, we'll use the same phone number field if they are withdrawing, OR ask for it if not.
                            // Actually, let's just ask for it again to be safe/clear, or if they want to use a different number.
                            // But wait, M-Wekeza is usually linked to the sim.
                            // Let's assume for now we don't need extra details for M-Wekeza other than confirmation.
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                Investment will be linked to your phone number.
                            </p>
                        )}
                    </div>
                )}
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
                {loading ? (
                    <span>Processing...</span>
                ) : (
                    <>
                        <span>Confirm Allocation</span>
                        <ArrowRight size={18} />
                    </>
                )}
            </button>
        </form>
    );

    const renderSuccessStep = () => (
        <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Allocation Confirmed!</h3>
            <div className="mt-4 space-y-2 text-sm text-gray-600">
                {investAmount > 0 && (
                    <p>Invested: <span className="font-bold text-emerald-600">TZS {investAmount.toLocaleString()}</span></p>
                )}
                {withdrawAmount > 0 && (
                    <p>Withdrawn: <span className="font-bold text-blue-600">TZS {withdrawAmount.toLocaleString()}</span></p>
                )}
            </div>
            <button
                onClick={onClose}
                className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors mt-6"
            >
                Done
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-6">
                    {step === 'allocation' && renderAllocationStep()}
                    {step === 'details' && renderDetailsStep()}
                    {step === 'success' && renderSuccessStep()}
                </div>
            </div>
        </div>
    );
}
