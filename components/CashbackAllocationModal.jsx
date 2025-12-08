import { useState } from 'react';
import { X, CheckCircle, TrendingUp, Wallet, ArrowRight } from 'lucide-react';
import { INVESTMENT_PROVIDERS, UTT_AMISS_FUNDS } from '../lib/investments';

export default function CashbackAllocationModal({ isOpen, onClose, amount, onInvest, onWithdraw }) {
    const [step, setStep] = useState('selection'); // selection, details, success
    const [choice, setChoice] = useState(null); // invest, withdraw
    const [provider, setProvider] = useState(amount >= 10000 ? INVESTMENT_PROVIDERS.UTT_AMISS : INVESTMENT_PROVIDERS.M_WEKEZA);
    const [details, setDetails] = useState({
        phoneNumber: '',
        accountNumber: '',
        fundId: UTT_AMISS_FUNDS[0].id
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (choice === 'invest') {
            await onInvest(amount, provider, details);
        } else {
            await onWithdraw(amount, details.phoneNumber);
        }

        setLoading(false);
        setStep('success');
    };

    const renderSelectionStep = () => {
        const canInvest = amount >= 1000;

        return (
            <div className="space-y-6">
                <div className="text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="text-emerald-600" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Payment Successful!</h3>
                    <p className="text-gray-600 mt-2">You earned cashback of</p>
                    <p className="text-3xl font-bold text-emerald-600 mt-1">TZS {amount.toLocaleString()}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => { setChoice('invest'); setStep('details'); }}
                        disabled={!canInvest}
                        className={`p-4 border-2 rounded-xl transition-all text-center group ${canInvest
                                ? 'border-emerald-100 hover:border-emerald-500 hover:bg-emerald-50 cursor-pointer'
                                : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
                            }`}
                    >
                        <TrendingUp className={`mx-auto mb-2 transition-transform ${canInvest ? 'text-emerald-600 group-hover:scale-110' : 'text-gray-400'}`} size={24} />
                        <span className={`font-bold block ${canInvest ? 'text-gray-900' : 'text-gray-500'}`}>Invest</span>
                        <span className="text-xs text-gray-500">
                            {canInvest ? 'Grow your money' : 'Min. TZS 1,000'}
                        </span>
                    </button>

                    <button
                        onClick={() => { setChoice('withdraw'); setStep('details'); }}
                        className="p-4 border-2 border-blue-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-center group"
                    >
                        <Wallet className="mx-auto mb-2 text-blue-600 group-hover:scale-110 transition-transform" size={24} />
                        <span className="font-bold text-gray-900 block">Withdraw</span>
                        <span className="text-xs text-gray-500">To mobile money</span>
                    </button>
                </div>
                {!canInvest && (
                    <p className="text-xs text-center text-red-500">
                        Investment is only available for cashback amounts of TZS 1,000 or more.
                    </p>
                )}
            </div>
        );
    };

    const renderDetailsStep = () => (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-gray-900">
                    {choice === 'invest' ? 'Investment Details' : 'Withdrawal Details'}
                </h3>
                <button
                    type="button"
                    onClick={() => setStep('selection')}
                    className="text-sm text-gray-500 hover:text-gray-700"
                >
                    Back
                </button>
            </div>

            {choice === 'invest' && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Provider</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setProvider(INVESTMENT_PROVIDERS.UTT_AMISS)}
                                disabled={amount < 10000}
                                className={`py-2 px-3 rounded-lg text-sm font-medium border relative ${provider === INVESTMENT_PROVIDERS.UTT_AMISS
                                        ? 'bg-emerald-600 text-white border-emerald-600'
                                        : amount < 10000
                                            ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                UTT AMIS
                                {amount < 10000 && (
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
                            <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-lg text-sm font-medium mb-4">
                                Investment Fee: 1% of amount
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Investment Amount</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={`TZS ${amount.toLocaleString()}`}
                                        readOnly
                                        className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">UTT Account Number</label>
                                <input
                                    type="text"
                                    value={details.accountNumber}
                                    onChange={(e) => setDetails({ ...details, accountNumber: e.target.value })}
                                    placeholder="Enter UTT account number"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input
                                type="tel"
                                value={details.phoneNumber}
                                onChange={(e) => setDetails({ ...details, phoneNumber: e.target.value })}
                                placeholder="e.g., 0712345678"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                                required
                            />
                        </div>
                    )}
                </div>
            )}

            {choice === 'withdraw' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Money Number</label>
                    <input
                        type="tel"
                        value={details.phoneNumber}
                        onChange={(e) => setDetails({ ...details, phoneNumber: e.target.value })}
                        placeholder="e.g., 0712345678"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-2">
                        Funds will be sent directly to this number via mobile money.
                    </p>
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 mt-6"
            >
                {loading ? (
                    <span>Processing...</span>
                ) : (
                    <>
                        <span>Confirm {choice === 'invest' ? 'Investment' : 'Withdrawal'}</span>
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
            <h3 className="text-xl font-bold text-gray-900">
                {choice === 'invest' ? 'Investment Confirmed!' : 'Withdrawal Initiated!'}
            </h3>
            <p className="text-gray-600 mt-2 mb-6">
                {choice === 'invest'
                    ? `Your cashback of TZS ${amount.toLocaleString()} has been invested.`
                    : `TZS ${amount.toLocaleString()} has been sent to your mobile number.`
                }
            </p>
            <button
                onClick={onClose}
                className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
            >
                Done
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-6">
                    {step === 'selection' && renderSelectionStep()}
                    {step === 'details' && renderDetailsStep()}
                    {step === 'success' && renderSuccessStep()}
                </div>
            </div>
        </div>
    );
}
