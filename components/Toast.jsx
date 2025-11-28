'use client';

import { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: <CheckCircle className="text-green-500" size={20} />,
        error: <AlertCircle className="text-red-500" size={20} />,
        info: <Info className="text-blue-500" size={20} />
    };

    const bgColors = {
        success: 'bg-green-50',
        error: 'bg-red-50',
        info: 'bg-blue-50'
    };

    const borderColors = {
        success: 'border-green-100',
        error: 'border-red-100',
        info: 'border-blue-100'
    };

    return (
        <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-[110] flex items-center space-x-3 px-4 py-3 rounded-xl shadow-lg border ${bgColors[type]} ${borderColors[type]} min-w-[300px] max-w-sm animate-slide-up`}>
            {icons[type]}
            <p className="text-sm font-medium text-gray-800">{message}</p>
        </div>
    );
}
