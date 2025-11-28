'use client';

import { useEffect } from 'react';
import { initTheme } from '../lib/theme';

export default function ThemeProvider({ children }) {
    useEffect(() => {
        // Initialize theme on mount
        initTheme();
    }, []);

    return children;
}
