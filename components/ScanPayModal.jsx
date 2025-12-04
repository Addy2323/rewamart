'use client';

import { useState, useEffect } from 'react';
import { X, Camera, Check, Loader } from 'lucide-react';
import Image from 'next/image';
import { getAllProducts } from '../lib/products';

export default function ScanPayModal({ isOpen, onClose, onConfirmPayment }) {
    const [scanState, setScanState] = useState('scanning'); // scanning, processing, scanned, success
    const [scannedProduct, setScannedProduct] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setScanState('scanning');
            setScannedProduct(null);
        }
    }, [isOpen]);

    const simulateScan = () => {
        setScanState('processing');

        // Simulate camera processing delay
        setTimeout(() => {
            const products = getAllProducts();
            const randomProduct = products[Math.floor(Math.random() * products.length)];
            setScannedProduct(randomProduct);
            setScanState('scanned');
        }, 1500);
    };

    const handleConfirm = () => {
        if (scannedProduct) {
            onConfirmPayment(scannedProduct);
            setScanState('success');
            setTimeout(() => {
                onClose();
            }, 1500);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-200">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors z-10"
                >
                    <X size={20} />
                </button>

                {/* Content based on state */}
                <div className="p-6">
                    {scanState === 'scanning' && (
                        <div className="flex flex-col items-center justify-center py-8 space-y-6">
                            <div className="relative w-64 h-64 border-4 border-emerald-500/50 rounded-3xl flex items-center justify-center overflow-hidden bg-gray-900">
                                <div className="absolute inset-0 border-4 border-emerald-500 rounded-3xl animate-pulse"></div>
                                <Camera size={64} className="text-emerald-500/50" />
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent animate-scan"></div>
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Scan QR Code</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Point your camera at a product QR code
                                </p>
                            </div>
                            <button
                                onClick={simulateScan}
                                className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-emerald-500/25"
                            >
                                Simulate Scan
                            </button>
                        </div>
                    )}

                    {scanState === 'processing' && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <Loader size={48} className="text-emerald-600 animate-spin" />
                            <p className="font-medium text-gray-600 dark:text-gray-300">Processing QR Code...</p>
                        </div>
                    )}

                    {scanState === 'scanned' && scannedProduct && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check size={32} className="text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Product Found!</h3>
                            </div>

                            {/* Product Image - Large Display */}
                            <div className="relative w-full h-48 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                <Image
                                    src={scannedProduct.image}
                                    alt={scannedProduct.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            {/* Product Details */}
                            <div className="space-y-3">
                                <div>
                                    <h4 className="font-bold text-lg text-gray-900 dark:text-white">{scannedProduct.name}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{scannedProduct.vendor}</p>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">Price</span>
                                        <span className="font-bold text-gray-900 dark:text-white">TZS {scannedProduct.price.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                                        <span>Cashback ({scannedProduct.cashbackRate}%)</span>
                                        <span className="font-bold">+ TZS {Math.floor(scannedProduct.price * (scannedProduct.cashbackRate / 100)).toLocaleString()}</span>
                                    </div>
                                    <div className="border-t border-gray-200 dark:border-gray-600 pt-2 flex justify-between font-bold text-lg">
                                        <span className="text-gray-900 dark:text-white">Total</span>
                                        <span className="text-emerald-600 dark:text-emerald-400">TZS {scannedProduct.price.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleConfirm}
                                className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center space-x-2 text-lg"
                            >
                                <span>Confirm to Pay</span>
                                <span className="bg-white/20 px-2 py-0.5 rounded text-sm">Instant</span>
                            </button>
                        </div>
                    )}

                    {scanState === 'success' && (
                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                                <Check size={40} className="text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Successful!</h3>
                            <p className="text-gray-500 dark:text-gray-400">Redirecting...</p>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes scan {
                    0% { top: 0; opacity: 0; }
                    50% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .animate-scan {
                    animation: scan 2s linear infinite;
                }
            `}</style>
        </div>
    );
}
