'use client';

import { useState, useEffect } from 'react';
import SplashScreen from './SplashScreen';
import { CartProvider } from '../context/CartContext';
import TawkTo from './TawkTo';

export default function AppWrapper({ children }) {
    const [showSplash, setShowSplash] = useState(true);
    const [isFirstLoad, setIsFirstLoad] = useState(true);

    useEffect(() => {
        // Check if we've already shown splash this session
        const hasSeenSplash = sessionStorage.getItem('rewamart_splash_shown');

        if (hasSeenSplash) {
            setShowSplash(false);
            setIsFirstLoad(false);
        }
    }, []);

    const handleSplashComplete = () => {
        setShowSplash(false);
        sessionStorage.setItem('rewamart_splash_shown', 'true');
    };

    // Show splash only on first load of the session
    if (showSplash && isFirstLoad) {
        return <SplashScreen onComplete={handleSplashComplete} />;
    }

    return (
        <CartProvider>
            {children}
            <TawkTo />
        </CartProvider>
    );
}
