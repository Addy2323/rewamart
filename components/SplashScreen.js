'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag, TrendingUp, Wallet } from 'lucide-react';

export default function SplashScreen({ onComplete }) {
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState(1); // 1: logo, 2: loading, 3: icons, 4: fade out
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Phase 1: Show logo (0.8s)
        const phase1Timer = setTimeout(() => setPhase(2), 800);

        // Phase 2: Progress bar animation (slower for 5 seconds)
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + 1; // Slower increment
            });
        }, 40); // 40ms * 100 = 4 seconds for progress

        // Phase 3: Show icons (after 3s)
        const phase3Timer = setTimeout(() => setPhase(3), 3000);

        // Phase 4: Fade out and complete (after 5s)
        const phase4Timer = setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => onComplete?.(), 600);
        }, 5000);

        return () => {
            clearTimeout(phase1Timer);
            clearTimeout(phase3Timer);
            clearTimeout(phase4Timer);
            clearInterval(progressInterval);
        };
    }, [onComplete]);

    return (
        <div
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'
                }`}
        >
            {/* Animated Background Circles */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-white/10 rounded-full animate-pulse" />
                <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-white/10 rounded-full animate-pulse delay-300" />
                <div className="absolute top-1/4 right-10 w-40 h-40 bg-white/5 rounded-full animate-bounce-slow" />
                <div className="absolute bottom-1/4 left-10 w-32 h-32 bg-white/5 rounded-full animate-bounce-slow delay-500" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center">
                {/* Logo Container with Glow Effect */}
                <div className={`relative transform transition-all duration-700 ${phase >= 1 ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
                    {/* Glow Ring */}
                    <div className="absolute inset-0 bg-white/30 rounded-full blur-xl animate-pulse scale-150" />

                    {/* Logo Circle */}
                    <div className="relative w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl animate-logo-bounce">
                        <div className="text-emerald-600 flex flex-col items-center">
                            <ShoppingBag size={40} strokeWidth={2.5} />
                            <span className="text-xs font-bold mt-1 tracking-wider">REWAMART</span>
                        </div>
                    </div>
                </div>

                {/* Brand Name */}
                <div className={`mt-8 transform transition-all duration-500 delay-300 ${phase >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                    <h1 className="text-4xl font-bold text-white tracking-wide">
                        Rewa<span className="text-yellow-300">Mart</span>
                    </h1>
                    <p className="text-center text-white/80 text-sm mt-2 font-light tracking-widest">
                        SHOP • EARN • INVEST
                    </p>
                </div>

                {/* Loading Progress Bar */}
                <div className={`mt-12 w-64 transform transition-all duration-500 ${phase >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className="h-1.5 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm">
                        <div
                            className="h-full bg-gradient-to-r from-yellow-300 via-white to-yellow-300 rounded-full transition-all duration-100 ease-out relative"
                            style={{ width: `${progress}%` }}
                        >
                            {/* Shimmer Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
                        </div>
                    </div>
                    <p className="text-center text-white/70 text-xs mt-3 font-medium">
                        {progress < 30 && 'Connecting...'}
                        {progress >= 30 && progress < 60 && 'Loading your wallet...'}
                        {progress >= 60 && progress < 90 && 'Preparing dashboard...'}
                        {progress >= 90 && 'Almost ready...'}
                    </p>
                </div>

                {/* Feature Icons */}
                <div className={`mt-12 flex items-center space-x-8 transform transition-all duration-700 ${phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    <div className="flex flex-col items-center animate-fade-in-up delay-100">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-2 border border-white/30">
                            <ShoppingBag className="text-white" size={24} />
                        </div>
                        <span className="text-white/90 text-xs font-medium">Shop</span>
                    </div>
                    <div className="flex flex-col items-center animate-fade-in-up delay-200">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-2 border border-white/30">
                            <Wallet className="text-white" size={24} />
                        </div>
                        <span className="text-white/90 text-xs font-medium">Earn</span>
                    </div>
                    <div className="flex flex-col items-center animate-fade-in-up delay-300">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-2 border border-white/30">
                            <TrendingUp className="text-white" size={24} />
                        </div>
                        <span className="text-white/90 text-xs font-medium">Invest</span>
                    </div>
                </div>
            </div>

            {/* Bottom Brand Tag */}
            <div className={`absolute bottom-8 text-center transform transition-all duration-500 ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`}>
                <p className="text-white/60 text-xs tracking-wider">Tanzania's #1 Rewards Platform</p>
            </div>
        </div>
    );
}
