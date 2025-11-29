'use client';

import { useState, useEffect } from 'react';
import { Copy, Share2, Users, Gift } from 'lucide-react';
import StatsCard from '../../components/StatsCard';
import Toast from '../../components/Toast';
import { initializeReferralCode, getReferralData } from '../../lib/referrals';
import { getWallet } from '../../lib/wallet';

export default function ReferralPage() {
    const [referralCode, setReferralCode] = useState('');
    const [data, setData] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        // Initialize code if not exists
        const wallet = getWallet(); // Using wallet to get user name if available, but for now we'll just use 'USER'
        const code = initializeReferralCode('USER');
        setReferralCode(code);
        setData(getReferralData());
    }, []);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralCode);
        setToast({ type: 'success', message: 'Referral code copied!' });
    };

    const shareCode = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Join RewaMart',
                text: `Use my code ${referralCode} to get a 10% bonus on your first purchase!`,
                url: 'https://rewamart.com'
            });
        } else {
            copyToClipboard();
        }
    };

    if (!data) return <div className="p-8 text-center text-gray-900 dark:text-white">Loading...</div>;

    return (
        <div className="p-4 pb-24 space-y-6 animate-fade-in">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white text-center shadow-lg">
                <Gift size={48} className="mx-auto mb-3 text-yellow-300" />
                <h2 className="text-2xl font-bold mb-2">Invite Friends & Earn</h2>
                <p className="text-orange-100 text-sm mb-6">
                    Get 5% commission on their first purchase. They get a 10% welcome bonus!
                </p>

                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between border border-white/30">
                    <div className="text-left">
                        <p className="text-xs text-orange-100 uppercase tracking-wider">Your Code</p>
                        <p className="text-2xl font-mono font-bold tracking-widest">{referralCode}</p>
                    </div>
                    <button
                        onClick={copyToClipboard}
                        className="p-2 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
                    >
                        <Copy size={20} />
                    </button>
                </div>

                <button
                    onClick={shareCode}
                    className="mt-4 w-full bg-white text-orange-600 py-3 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-orange-50 transition-colors"
                >
                    <Share2 size={20} />
                    <span>Share Now</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
                <StatsCard
                    title="Total Earnings"
                    value={`TZS ${data.earnings.toLocaleString()}`}
                    icon={Gift}
                    color="orange"
                />
                <StatsCard
                    title="Friends Invited"
                    value={data.totalReferrals}
                    icon={Users}
                    color="emerald"
                />
            </div>

            {/* How it Works */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4">How it Works</h3>
                <div className="space-y-6 relative">
                    <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-100"></div>

                    <div className="relative flex items-start space-x-4">
                        <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-xs font-bold z-10">1</div>
                        <div>
                            <h4 className="font-bold text-sm text-gray-800">Share your code</h4>
                            <p className="text-xs text-gray-500">Send your unique code to friends via WhatsApp or SMS.</p>
                        </div>
                    </div>

                    <div className="relative flex items-start space-x-4">
                        <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-xs font-bold z-10">2</div>
                        <div>
                            <h4 className="font-bold text-sm text-gray-800">Friend signs up</h4>
                            <p className="text-xs text-gray-500">They use your code when creating their account.</p>
                        </div>
                    </div>

                    <div className="relative flex items-start space-x-4">
                        <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-xs font-bold z-10">3</div>
                        <div>
                            <h4 className="font-bold text-sm text-gray-800">You both earn</h4>
                            <p className="text-xs text-gray-500">After their first purchase, you get 5% and they get 10% bonus!</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Referral History */}
            <div>
                <h3 className="font-bold text-gray-800 mb-3">Referral History</h3>
                <div className="space-y-3">
                    {data.history.length > 0 ? (
                        data.history.map((item) => (
                            <div key={item.id} className="bg-white p-3 rounded-xl border border-gray-100 flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
                                        <Gift size={20} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm text-gray-800">Commission Earned</p>
                                        <p className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span className="font-bold text-green-600">+ TZS {item.amount.toLocaleString()}</span>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-400 text-sm bg-white rounded-xl border border-gray-100">
                            No referrals yet. Start sharing!
                        </div>
                    )}
                </div>
            </div>

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
