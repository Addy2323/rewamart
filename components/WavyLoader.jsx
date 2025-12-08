'use client';

export default function WavyLoader({ message = 'Processing...' }) {
    return (
        <div className="flex flex-col items-center justify-center p-8">
            {/* 3D Wavy Circle Loader */}
            <div className="wavy-loader-container">
                <div className="wavy-loader">
                    <div className="wave-circle"></div>
                    <div className="wave-circle"></div>
                    <div className="wave-circle"></div>
                    <div className="wave-circle"></div>
                    <div className="wave-circle"></div>
                </div>
            </div>

            {/* Loading Message */}
            {message && (
                <p className="mt-6 text-gray-600 font-medium animate-pulse">{message}</p>
            )}

            <style jsx>{`
                .wavy-loader-container {
                    perspective: 1000px;
                    width: 120px;
                    height: 120px;
                }

                .wavy-loader {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    transform-style: preserve-3d;
                    animation: rotate3d 3s linear infinite;
                }

                .wave-circle {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    border: 4px solid transparent;
                    border-top-color: #10b981;
                    border-right-color: #3b82f6;
                    opacity: 0.8;
                    animation: wave 2s ease-in-out infinite;
                }

                .wave-circle:nth-child(1) {
                    animation-delay: 0s;
                    border-top-color: #10b981;
                    border-right-color: #059669;
                }

                .wave-circle:nth-child(2) {
                    animation-delay: 0.2s;
                    border-top-color: #3b82f6;
                    border-right-color: #2563eb;
                    transform: rotateY(72deg);
                }

                .wave-circle:nth-child(3) {
                    animation-delay: 0.4s;
                    border-top-color: #8b5cf6;
                    border-right-color: #7c3aed;
                    transform: rotateY(144deg);
                }

                .wave-circle:nth-child(4) {
                    animation-delay: 0.6s;
                    border-top-color: #ec4899;
                    border-right-color: #db2777;
                    transform: rotateY(216deg);
                }

                .wave-circle:nth-child(5) {
                    animation-delay: 0.8s;
                    border-top-color: #f59e0b;
                    border-right-color: #d97706;
                    transform: rotateY(288deg);
                }

                @keyframes rotate3d {
                    0% {
                        transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg);
                    }
                    100% {
                        transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg);
                    }
                }

                @keyframes wave {
                    0%, 100% {
                        transform: scale(1) translateZ(0);
                        opacity: 0.8;
                    }
                    50% {
                        transform: scale(1.3) translateZ(50px);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
}
