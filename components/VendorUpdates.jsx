'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

export default function VendorUpdates() {
    const [currentUpdate, setCurrentUpdate] = useState(null);

    useEffect(() => {
        const vendors = ['TechHub TZ', 'SportZone TZ', 'Beauty Corner', 'Electronics Plus', 'iStore Tanzania', 'Fashion Hub'];
        const messages = [
            'New stock arrived!',
            'Flash sale 20% off!',
            'Limited time offer',
            'Price reduced',
            'New product added',
            'Special promotion'
        ];

        // Show initial update
        const showRandomUpdate = () => {
            const vendor = vendors[Math.floor(Math.random() * vendors.length)];
            const message = messages[Math.floor(Math.random() * messages.length)];
            
            setCurrentUpdate({
                id: Date.now(),
                vendor,
                message
            });

            // Auto-hide after 2 seconds
            setTimeout(() => {
                setCurrentUpdate(null);
            }, 2000);
        };

        // Show first update after 1 second
        const initialTimer = setTimeout(showRandomUpdate, 1000);

        // Show updates every 8 seconds (2 second display + 6 second wait)
        const interval = setInterval(showRandomUpdate, 8000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, []);

    if (!currentUpdate) return null;

    return (
        <div className="fixed top-20 left-4 right-4 max-w-sm mx-auto z-50 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg shadow-lg p-4 flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                    <Bell size={20} className="animate-bounce" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">{currentUpdate.vendor}</p>
                    <p className="text-sm opacity-90">{currentUpdate.message}</p>
                </div>
            </div>
        </div>
    );
}
