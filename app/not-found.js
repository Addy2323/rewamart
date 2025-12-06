import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
            <div className="space-y-6">
                {/* Icon */}
                <div className="relative w-32 h-32 mx-auto mb-8 animate-float">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-pulse"></div>
                    <svg
                        className="relative w-full h-full text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                </div>

                <h1 className="text-6xl font-bold text-gray-900 dark:text-white animate-fade-in-up">404</h1>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 animate-fade-in-up delay-100">Page Not Found</h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto animate-fade-in-up delay-200">
                    Oops! The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>

                <div className="animate-fade-in-up delay-300">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white transition-all duration-200 bg-primary rounded-full hover:bg-primary-dark hover:shadow-lg transform hover:-translate-y-1"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
