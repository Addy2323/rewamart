'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { X, Hourglass, ChevronRight, Sparkles, Clock } from 'lucide-react';

const PROMO_COLORS = {
    free_shipping: 'from-emerald-500 to-teal-600',
    discount_percent: 'from-emerald-500 to-teal-600',
    discount_fixed: 'from-emerald-500 to-teal-600',
    campaign: 'from-emerald-500 to-teal-600'
};

export default function PromoPopup({ vendorName }) {
    const router = useRouter();
    const [promotion, setPromotion] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    // Fetch promotion
    useEffect(() => {
        const fetchPromotion = async () => {
            try {
                // If vendorName is provided, fetch for that vendor. 
                // Otherwise, fetch the most recent active promotion for the home page.
                const url = vendorName
                    ? `/api/promotions?vendor=${encodeURIComponent(vendorName)}&active=true`
                    : `/api/promotions?active=true`;

                const response = await fetch(url);
                const data = await response.json();

                if (data.promotions && data.promotions.length > 0) {
                    setPromotion(data.promotions[0]); // Max 1 popup
                    setIsVisible(true);
                }
            } catch (error) {
                console.error('PromoPopup: Error fetching promotion:', error);
            }
        };

        fetchPromotion();
    }, [vendorName]);

    // Countdown timer
    useEffect(() => {
        if (!promotion) return;

        const updateCountdown = () => {
            const now = new Date();
            const end = new Date(promotion.endDate);
            const diff = end - now;

            if (diff <= 0) {
                setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setCountdown({ days, hours, minutes, seconds });
        };

        updateCountdown();
        const timer = setInterval(updateCountdown, 1000);

        return () => clearInterval(timer);
    }, [promotion]);

    const handleClose = useCallback(() => {
        setIsVisible(false);
    }, []);

    const handleAction = useCallback(() => {
        if (promotion?.targetProductId) {
            router.push(`/shop/${promotion.targetProductId}`);
        }
        handleClose();
    }, [promotion, router, handleClose]);

    // Handle backdrop click
    const handleBackdropClick = useCallback((e) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    }, [handleClose]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                handleClose();
            }
        };

        if (isVisible) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isVisible, handleClose]);

    if (!promotion || !isVisible) return null;

    const gradientColor = PROMO_COLORS[promotion.type] || PROMO_COLORS.campaign;

    const getPromoMessage = () => {
        switch (promotion.type) {
            case 'free_shipping':
                return 'FREE shipping';
            case 'discount_percent':
                return `${promotion.discountValue}% OFF`;
            case 'discount_fixed':
                return `Save ${promotion.discountValue.toLocaleString()} TSh`;
            case 'campaign':
            default:
                return promotion.title || 'Special offer';
        }
    };

    return (
        <div
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-4 animate-fade-in"
            onClick={handleBackdropClick}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Popup Container */}
            <div className="relative w-full max-w-[320px] transform animate-slide-up flex flex-col items-center">

                {/* Floating Hourglass Icon */}
                <div className="absolute -top-12 z-10 animate-float-gentle">
                    <div className="bg-white p-3 rounded-2xl shadow-xl border border-emerald-100">
                        <Hourglass size={48} className="text-emerald-600 animate-hourglass" />
                    </div>
                </div>

                {/* Main Card */}
                <div className="relative w-full bg-white rounded-[32px] shadow-2xl overflow-hidden pt-12 pb-6 px-6 text-center">

                    {/* Content */}
                    <div className="relative z-10">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                            Don't miss out
                        </h3>

                        <div className="mb-4">
                            <span className={`text-3xl font-black bg-gradient-to-r ${gradientColor} bg-clip-text text-transparent uppercase tracking-tight`}>
                                {getPromoMessage()}
                            </span>
                        </div>

                        {/* Countdown */}
                        <div className="flex items-center justify-center gap-1.5 text-emerald-600 font-medium text-sm mb-8">
                            <Clock size={16} />
                            <span>
                                {countdown.days > 0
                                    ? `${countdown.days} days left`
                                    : `${String(countdown.hours).padStart(2, '0')}:${String(countdown.minutes).padStart(2, '0')}:${String(countdown.seconds).padStart(2, '0')}`
                                }
                            </span>
                        </div>
                    </div>

                    {/* Wavy Background & Button Section */}
                    <div className="relative -mx-6 -mb-6 mt-4 h-32 flex items-end justify-center pb-6">
                        {/* Wavy SVG */}
                        <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1440 320" preserveAspectRatio="none">
                            <path fill="#059669" fillOpacity="1" d="M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,197.3C1248,213,1344,203,1392,197.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                        </svg>

                        {/* Button */}
                        <button
                            onClick={handleAction}
                            className={`relative z-20 w-[85%] py-3.5 bg-gradient-to-r ${gradientColor} text-white font-bold rounded-full shadow-lg transform transition-all hover:scale-105 active:scale-95`}
                        >
                            Source now
                        </button>
                    </div>
                </div>

                {/* External Close Button */}
                <button
                    onClick={handleClose}
                    className="mt-6 w-10 h-10 rounded-full border-2 border-white/50 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                    aria-label="Close"
                >
                    <X size={24} />
                </button>
            </div>
        </div>
    );
}
