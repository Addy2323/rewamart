'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

export default function FirstOrderPopup({ vendorName }) {
    const router = useRouter();
    const [promotion, setPromotion] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    // Fetch promotion
    useEffect(() => {
        const fetchPromotion = async () => {
            try {
                const url = vendorName
                    ? `/api/promotions?vendor=${encodeURIComponent(vendorName)}&active=true`
                    : `/api/promotions?active=true`;

                const response = await fetch(url);
                const data = await response.json();

                if (data.promotions && data.promotions.length > 0) {
                    setPromotion(data.promotions[0]);
                    setIsVisible(true);
                }
            } catch (error) {
                console.error('FirstOrderPopup: Error fetching promotion:', error);
            }
        };

        fetchPromotion();
    }, [vendorName]);

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

    const getPromoMessage = () => {
        switch (promotion.type) {
            case 'free_shipping':
                return 'FREE Shipping!';
            case 'discount_percent':
                return `Enjoy ${promotion.discountValue}%+ off!`;
            case 'discount_fixed':
                return `Save ${promotion.discountValue?.toLocaleString()} TSh!`;
            case 'campaign':
            default:
                return promotion.title || 'Special Offer!';
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
            <div className="relative w-full max-w-[400px] transform animate-slide-up flex flex-col items-center">

                {/* Main Card */}
                <div
                    className="relative w-full rounded-3xl shadow-2xl mt-16"
                    style={{ background: 'linear-gradient(to bottom, #ffffff 0%, #d1fae5 100%)' }}
                >
                    {/* Animated GIF Icon */}
                    <img
                        src="https://gw.alicdn.com/imgextra/i4/O1CN01ulfzcJ1DWBQwWyp1G_!!6000000000223-1-tps-280-240.gif"
                        alt="Celebration"
                        className="absolute z-10 -top-16 left-1/2 -translate-x-1/2 h-[120px] pointer-events-none"
                    />

                    {/* Content */}
                    <div className="px-7 pt-16 pb-5 flex flex-col items-center">
                        {/* Text Content */}
                        <div className="w-full flex flex-col items-center mb-4">
                            <h2
                                className="w-full text-center text-[28px] leading-[38px] font-bold"
                                style={{ color: '#222222' }}
                            >
                                {getPromoMessage()}
                            </h2>
                            <p
                                className="w-full text-center text-xs leading-4 mt-1"
                                style={{ color: '#222222' }}
                            >
                                {promotion.description || 'Curated selection of hot items'}
                            </p>
                        </div>

                        {/* CTA Button */}
                        <button
                            onClick={handleAction}
                            className="w-full h-12 rounded-full text-white text-base font-semibold cursor-pointer flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
                            style={{ backgroundColor: '#059669' }}
                        >
                            Source now
                        </button>
                    </div>
                </div>

                {/* External Close Button */}
                <button
                    onClick={handleClose}
                    className="mt-5 cursor-pointer transition-all hover:scale-110 animate-bounce"
                    aria-label="Close"
                >
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="24" cy="24" r="22" stroke="rgba(255,255,255,0.7)" strokeWidth="2" fill="none" />
                        <path
                            d="M16 16L32 32M32 16L16 32"
                            stroke="rgba(255,255,255,0.9)"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
}
