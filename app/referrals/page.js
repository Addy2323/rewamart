'use client';

import { useState, useEffect, useRef } from 'react';
import { Share2, Users, Award, Info, CheckCircle, Copy, Check } from 'lucide-react';
import Image from 'next/image';
import QRCode from 'qrcode';
import { getCurrentUser } from '../../lib/auth';
import { getReferralData, initializeReferralCode, validateReferralCode, registerReferralCode } from '../../lib/referrals';
import { storage, STORAGE_KEYS } from '../../lib/storage';
import Toast from '../../components/Toast';

export default function ReferralsPage() {
    const [user, setUser] = useState(null);
    const [referralData, setReferralData] = useState(null);
    const [enteredCode, setEnteredCode] = useState('');
    const [toast, setToast] = useState(null);
    const [appliedCode, setAppliedCode] = useState(null);
    const [hasMadePurchase, setHasMadePurchase] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [copied, setCopied] = useState(false);
    const canvasRef = useRef(null);

    useEffect(() => {
        const currentUser = getCurrentUser();
        setUser(currentUser);

        if (currentUser) {
            const code = initializeReferralCode(currentUser.name);
            // Register code for referrer lookup
            registerReferralCode(code, currentUser);
            const data = getReferralData();
            setReferralData(data);

            // Generate QR code
            const referralLink = `${window.location.origin}/referrals?ref=${code}`;
            QRCode.toDataURL(referralLink, { width: 200, margin: 2 })
                .then(url => setQrCodeUrl(url))
                .catch(err => console.error(err));

            // Check applied referral code status
            const applied = storage.get(STORAGE_KEYS.APPLIED_REFERRAL_CODE);
            const purchaseStatus = storage.get(STORAGE_KEYS.HAS_MADE_PURCHASE);
            setAppliedCode(applied);
            setHasMadePurchase(purchaseStatus);
        }
    }, []);

    // Copy code to clipboard
    const handleCopy = () => {
        navigator.clipboard.writeText(referralData.code);
        setCopied(true);
        setToast({ type: 'success', message: 'Code copied! / Namba imenakiliwa!' });
        setTimeout(() => setCopied(false), 2000);
    };

    // WhatsApp share (most popular in Tanzania)
    const handleWhatsAppShare = () => {
        const message = `Karibuni RewaMart! 🎉\n\nTumia code yangu ${referralData.code} kupata bonus ya 10% kwenye ununuzi wako wa kwanza!\n\nWelcome to RewaMart! Use my code ${referralData.code} to get 10% bonus on your first purchase!`;
        const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    // SMS share
    const handleSMSShare = () => {
        const message = `Karibu RewaMart! Tumia code ${referralData.code} kupata 10% bonus. Welcome! Use code ${referralData.code} for 10% bonus.`;
        window.location.href = `sms:?body=${encodeURIComponent(message)}`;
    };

    // Telegram share
    const handleTelegramShare = () => {
        const message = `Karibu RewaMart! 🎁 Tumia code yangu ${referralData.code} kupata 10% bonus!`;
        const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.origin + '/referrals?ref=' + referralData.code)}&text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    // Generic share fallback
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Join me on RewaMart!',
                text: `Tumia code yangu ${referralData.code} kupata 10% bonus! Use my code ${referralData.code} to get a 10% bonus!`,
                url: window.location.href
            }).catch(err => console.error('Share failed:', err));
        } else {
            handleCopy();
        }
    };

    const handleApplyCode = () => {
        if (!enteredCode.trim()) {
            setToast({ type: 'error', message: 'Please enter a referral code' });
            return;
        }

        if (!validateReferralCode(enteredCode)) {
            setToast({ type: 'error', message: 'Invalid referral code format' });
            return;
        }

        // Prevent self-referral
        if (enteredCode === referralData.code) {
            setToast({ type: 'error', message: 'You cannot use your own referral code' });
            return;
        }

        // Check if user already made a purchase
        if (hasMadePurchase) {
            setToast({ type: 'error', message: 'Referral bonus only available for first purchase' });
            return;
        }

        // Apply the referral code
        storage.set(STORAGE_KEYS.APPLIED_REFERRAL_CODE, enteredCode);
        setAppliedCode(enteredCode);
        setToast({ type: 'success', message: 'Referral code applied! Get 10% bonus on your first purchase!' });
        setEnteredCode('');
    };

    if (!user || !referralData) {
        return <div className="min-h-screen flex items-center justify-center text-gray-900 dark:text-white">Loading...</div>;
    }

    return (
        <div className="p-4 pb-24 space-y-6 animate-fade-in dark:bg-gray-900">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Referral Program</h1>
                <p className="text-gray-600 dark:text-gray-300">Earn 5% from every referral's first purchase</p>
            </div>

            {/* Hero Image */}
            <div
                className="w-full h-48 md:h-64 rounded-2xl shadow-lg bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center"
                style={{
                    backgroundImage: 'url(/images/referral-hero.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            >
                <div className="bg-black/30 w-full h-full rounded-2xl flex items-center justify-center">
                    <div className="text-center text-white p-6">
                        <h2 className="text-3xl md:text-4xl font-bold mb-2">Share & Earn!</h2>
                        <p className="text-lg md:text-xl">Invite friends and get rewarded</p>
                    </div>
                </div>
            </div>

            {/* How It Works */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800">
                <div className="flex items-start space-x-3 mb-4">
                    <Info className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" size={24} />
                    <div>
                        <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">How to Get Referral Bonuses</h3>
                        <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-2 list-decimal list-inside">
                            <li><strong>Share your code</strong> below with friends</li>
                            <li>Your friend <strong>applies the code</strong> before their first purchase</li>
                            <li>When they checkout:
                                <ul className="ml-6 mt-1 space-y-1 list-disc list-inside">
                                    <li>They get <strong>10% bonus</strong> added to their wallet</li>
                                    <li>You earn <strong>5% commission</strong> on their purchase</li>
                                </ul>
                            </li>
                        </ol>
                    </div>
                </div>
            </div>

            {/* Applied Code Status */}
            {appliedCode && !hasMadePurchase && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border-2 border-green-200 dark:border-green-800">
                    <div className="flex items-center space-x-2">
                        <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
                        <div>
                            <p className="font-bold text-green-900 dark:text-green-100">Referral Code Active!</p>
                            <p className="text-sm text-green-700 dark:text-green-300">
                                Code <span className="font-mono font-bold">{appliedCode}</span> will give you 10% bonus on your first purchase
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Your Referral Code */}
            {/* Your Referral Code & Sharing */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-6 text-white shadow-lg space-y-6">
                <div className="text-center space-y-2">
                    <p className="font-bold text-lg">Your Referral Code / Namba Yako</p>
                    <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl border border-white/30 flex flex-col items-center space-y-4">
                        <p className="text-3xl font-bold tracking-widest font-mono">{referralData.code}</p>

                        <button
                            onClick={handleCopy}
                            className="flex items-center space-x-2 bg-white text-blue-600 px-6 py-2 rounded-full font-bold text-sm hover:bg-blue-50 transition-colors"
                        >
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                        </button>
                    </div>
                </div>

                {/* QR Code */}
                {qrCodeUrl && (
                    <div className="flex flex-col items-center space-y-2 bg-white/10 p-4 rounded-xl">
                        <p className="text-sm font-medium opacity-90">Scan to Join / Changanua Kujiunga</p>
                        <div className="bg-white p-2 rounded-lg">
                            <img src={qrCodeUrl} alt="Referral QR Code" width={150} height={150} className="rounded" />
                        </div>
                    </div>
                )}

                {/* Sharing Buttons */}
                <div className="space-y-3">
                    <p className="text-center text-sm font-medium opacity-90">Share via / Shiriki kupitia:</p>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={handleWhatsAppShare} className="flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold transition-colors shadow-sm">
                            <Share2 size={18} />
                            <span>WhatsApp</span>
                        </button>
                        <button onClick={handleSMSShare} className="flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-bold transition-colors shadow-sm">
                            <Share2 size={18} />
                            <span>SMS</span>
                        </button>
                        <button onClick={handleTelegramShare} className="flex items-center justify-center space-x-2 bg-sky-500 hover:bg-sky-600 text-white py-3 rounded-xl font-bold transition-colors shadow-sm col-span-2">
                            <Share2 size={18} />
                            <span>Telegram</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border dark:border-gray-700 shadow-sm">
                    <p className="text-2xl font-bold text-blue-600">{referralData.totalReferrals}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Referrals / Walioalikwa</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center border dark:border-gray-700 shadow-sm">
                    <p className="text-2xl font-bold text-green-600">TZS {referralData.earnings.toLocaleString()}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Earnings / Mapato</p>
                </div>
            </div>

            {/* Have a Referral Code? */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border dark:border-gray-700 shadow-sm space-y-3">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Have a Referral Code? / Una Namba ya Mwaliko?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Enter a friend's code to get 10% bonus on your first purchase / Ingiza namba ya rafiki kupata bonus ya 10%</p>
                <input
                    type="text"
                    value={enteredCode}
                    onChange={(e) => setEnteredCode(e.target.value.toUpperCase())}
                    placeholder="Enter referral code / Ingiza namba"
                    className="w-full px-4 py-3 border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button onClick={handleApplyCode} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors">
                    Apply Code / Tumia Namba
                </button>
            </div>

            {/* Recent Referrals */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border dark:border-gray-700 shadow-sm">
                <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Recent Referrals</h3>
                {referralData.history.length > 0 ? (
                    <div className="space-y-3">
                        {referralData.history.map(ref => (
                            <div key={ref.id} className="flex justify-between items-center">
                                <div>
                                    <p className="font-medium dark:text-gray-200">Commission Earned</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(ref.date).toLocaleDateString()}</p>
                                </div>
                                <p className="font-bold text-green-600">+ TZS {ref.amount.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-6">
                        <Users size={40} className="mx-auto mb-2" />
                        <p>No referrals yet</p>
                    </div>
                )}
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}
