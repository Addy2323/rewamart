'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function CollapsibleCategories({ 
    categories = [], 
    activeCategory = 'all',
    onCategoryChange = () => {}
}) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="space-y-2">
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-700 dark:to-gray-700 rounded-lg hover:from-emerald-100 hover:to-teal-100 dark:hover:from-gray-600 dark:hover:to-gray-600 transition-all border border-emerald-200 dark:border-gray-600"
            >
                <span className="font-semibold text-gray-900 dark:text-white">Categories</span>
                {isOpen ? (
                    <ChevronUp size={20} className="text-emerald-600 dark:text-emerald-400" />
                ) : (
                    <ChevronDown size={20} className="text-emerald-600 dark:text-emerald-400" />
                )}
            </button>

            {/* Collapsible Categories Container */}
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
                <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide px-1">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => onCategoryChange(cat.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat.id
                                ? 'bg-emerald-600 text-white shadow-md scale-105'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
