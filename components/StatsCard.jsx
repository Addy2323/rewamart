'use client';

export default function StatsCard({ title, value, icon: Icon, color = 'emerald', subtext }) {
    const colorClasses = {
        emerald: 'bg-emerald-50 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400',
        green: 'bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-400',
        blue: 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400',
        orange: 'bg-orange-50 dark:bg-orange-900 text-orange-600 dark:text-orange-400',
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-start justify-between mb-2">
                <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                    <Icon size={20} />
                </div>
                {subtext && <span className="text-[10px] text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-full">{subtext}</span>}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">{title}</p>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">{value}</h3>
        </div>
    );
}
