'use client';

import { useState, useEffect } from 'react';
import { X, Download, Copy, Check } from 'lucide-react';
import dynamic from 'next/dynamic';

const QRCode = dynamic(() => import('qrcode.react'), { ssr: false });

export default function QRCodeModal({ isOpen, onClose, product }) {
    const [copied, setCopied] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen || !product || !mounted) return null;

    const qrValue = JSON.stringify({
        productId: product.id,
        productName: product.name,
        price: product.price,
        vendor: product.vendor,
        timestamp: new Date().toISOString()
    });

    const handleDownload = () => {
        const qrElement = document.getElementById('qr-code');
        const canvas = qrElement?.querySelector('canvas');
        if (canvas) {
            const url = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = url;
            link.download = `${product.name}-qr.png`;
            link.click();
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(qrValue);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">QR Code Purchase</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="space-y-2">
                    <p className="text-sm text-gray-600">Product: <span className="font-bold">{product.name}</span></p>
                    <p className="text-sm text-gray-600">Price: <span className="font-bold text-emerald-600">TZS {product.price.toLocaleString()}</span></p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg flex justify-center" id="qr-code">
                    <QRCode
                        value={qrValue}
                        size={256}
                        level="H"
                        includeMargin={true}
                        fgColor="#047857"
                        bgColor="#ffffff"
                        imageSettings={{
                            src: "/images/logo2.png",
                            height: 50,
                            width: 50,
                            excavate: true,
                        }}
                    />
                </div>

                <div className="space-y-2">
                    <button
                        onClick={handleDownload}
                        className="w-full flex items-center justify-center space-x-2 bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                    >
                        <Download size={18} />
                        <span>Download QR Code</span>
                    </button>
                    <button
                        onClick={handleCopy}
                        className="w-full flex items-center justify-center space-x-2 bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                        {copied ? (
                            <>
                                <Check size={18} />
                                <span>Copied!</span>
                            </>
                        ) : (
                            <>
                                <Copy size={18} />
                                <span>Copy QR Data</span>
                            </>
                        )}
                    </button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                    Scan this QR code to quickly add this product to your cart
                </p>
            </div>
        </div>
    );
}
