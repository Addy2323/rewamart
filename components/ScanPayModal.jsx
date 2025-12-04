'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Camera, Check, Loader } from 'lucide-react';
import Image from 'next/image';
import { getAllProducts } from '../lib/products';

export default function ScanPayModal({ isOpen, onClose, onConfirmPayment }) {
    const [scanState, setScanState] = useState('scanning'); // scanning, processing, scanned, success
    const [scannedProduct, setScannedProduct] = useState(null);
    const [cameraActive, setCameraActive] = useState(false);
    const [scanningMessage, setScanningMessage] = useState('Point camera at QR code');
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const scanIntervalRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setScanState('scanning');
            setScannedProduct(null);
            startCamera();
        } else {
            stopCamera();
        }
    }, [isOpen]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setCameraActive(true);
                startQRScanning();
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            setCameraActive(false);
            setScanningMessage('Camera access denied. Use Simulate Scan.');
        }
    };

    const stopCamera = () => {
        if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
        }
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            setCameraActive(false);
        }
    };

    const startQRScanning = () => {
        if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
        }
        setScanningMessage('Camera ready. Click Capture to scan QR code.');
    };

    const processQRCode = (qrData) => {
        setScanState('processing');

        // Try to find product by QR code data
        const products = getAllProducts();
        let foundProduct = null;

        // Check if QR data matches a product ID
        foundProduct = products.find(p => p.id === qrData);

        // If not found by ID, try to match by name or other properties
        if (!foundProduct) {
            foundProduct = products.find(p =>
                p.name.toLowerCase().includes(qrData.toLowerCase()) ||
                p.id.includes(qrData)
            );
        }

        // If still not found, use random product
        if (!foundProduct) {
            foundProduct = products[Math.floor(Math.random() * products.length)];
        }

        setTimeout(() => {
            setScannedProduct(foundProduct);
            setScanState('scanned');
        }, 1500);
    };

    const captureFrame = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

            setScanningMessage('Frame captured! Analyzing...');
            stopCamera();

            // Simulate QR code detection with validation
            setTimeout(() => {
                // Simulate 70% chance of QR code not being detected (real image)
                const hasQRCode = Math.random() > 0.7; // Most captures won't have valid QR

                if (hasQRCode) {
                    // QR code detected - find product
                    const products = getAllProducts();
                    const randomProduct = products[Math.floor(Math.random() * products.length)];
                    setScannedProduct(randomProduct);
                    setScanState('scanned');
                } else {
                    // No QR code detected
                    setScanningMessage('❌ No QR code detected! Please scan a valid QR code.');
                    setScanState('scanning');
                    // Restart camera after 2 seconds
                    setTimeout(() => {
                        startCamera();
                    }, 2000);
                }
            }, 1500);
        }
    };

    const simulateScan = () => {
        setScanState('processing');
        setScanningMessage('Simulating scan...');

        // Simulate camera processing delay with QR validation
        setTimeout(() => {
            // Simulate 30% chance of valid QR code being present
            const hasValidQR = Math.random() > 0.7;

            if (hasValidQR) {
                // Valid QR code - show product
                const products = getAllProducts();
                const randomProduct = products[Math.floor(Math.random() * products.length)];
                setScannedProduct(randomProduct);
                setScanState('scanned');
            } else {
                // No valid QR code detected
                setScanningMessage('❌ Invalid or no QR code detected! Please point at a valid product QR code.');
                setScanState('scanning');
                setTimeout(() => {
                    setScanningMessage('Point camera at QR code');
                }, 2500);
            }
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
                        <div className="flex flex-col items-center justify-center py-8 space-y-6 bg-gradient-to-b from-gray-900 to-black rounded-xl">
                            {/* Camera Feed */}
                            <div className="relative w-80 h-80 border-4 border-emerald-400 rounded-3xl flex items-center justify-center overflow-hidden bg-black shadow-2xl shadow-emerald-500/50">
                                {cameraActive ? (
                                    <>
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            className="w-full h-full object-cover"
                                        />
                                        <canvas
                                            ref={canvasRef}
                                            width={320}
                                            height={320}
                                            className="hidden"
                                        />
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center space-y-4">
                                        <Camera size={80} className="text-emerald-400" />
                                        <p className="text-white text-sm">Camera not available</p>
                                    </div>
                                )}

                                {/* Scanning overlay */}
                                <div className="absolute inset-0 border-4 border-emerald-400 rounded-3xl animate-pulse pointer-events-none"></div>
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent animate-scan pointer-events-none"></div>

                                {/* Corner markers */}
                                <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-emerald-400 pointer-events-none"></div>
                                <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-emerald-400 pointer-events-none"></div>
                                <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-emerald-400 pointer-events-none"></div>
                                <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-emerald-400 pointer-events-none"></div>
                            </div>

                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-bold text-white">Scan QR Code</h3>
                                <p className="text-base text-gray-300">
                                    {scanningMessage}
                                </p>
                            </div>

                            <div className="flex gap-4">
                                {cameraActive && (
                                    <button
                                        onClick={captureFrame}
                                        className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-blue-500/50 text-lg"
                                    >
                                        Capture
                                    </button>
                                )}
                                <button
                                    onClick={simulateScan}
                                    className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-emerald-500/50 text-lg"
                                >
                                    Simulate Scan
                                </button>
                            </div>
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
