'use client';

import { useEffect } from 'react';
import Script from 'next/script';

/**
 * Tawk.to Live Chat Component
 * Integrates Tawk.to chat widget with Next.js using afterInteractive loading strategy
 */
export default function TawkTo() {
    const propertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID || '695ada8279755a198313a185';
    const widgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID || '1je5eb3mm';

    useEffect(() => {
        // Initialize Tawk_API
        window.Tawk_API = window.Tawk_API || {};
        window.Tawk_LoadStart = new Date();

        // Optional: Customize visitor information when user is logged in
        // You can pass user data to Tawk.to for better support
        window.Tawk_API.onLoad = function () {
            // You can set visitor attributes here
            // window.Tawk_API.setAttributes({
            //     name: 'User Name',
            //     email: 'user@email.com',
            // }, function(error) {});
        };
    }, []);

    return (
        <Script
            id="tawkto-widget"
            src={`https://embed.tawk.to/${propertyId}/${widgetId}`}
            strategy="afterInteractive"
            crossOrigin="anonymous"
        />
    );
}
