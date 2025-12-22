import { Inter } from 'next/font/google';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import ThemeProvider from '../components/ThemeProvider';
import AppWrapper from '../components/AppWrapper';

const inter = Inter({ subsets: ['latin'] });

// Comprehensive SEO Metadata
export const metadata = {
    metadataBase: new URL('https://www.rewamart.co.tz'),
    title: {
        default: 'RewaMart - Shop, Earn, Invest | Tanzania E-Commerce Platform',
        template: '%s | RewaMart'
    },
    description: "Tanzania's premier e-commerce and investment platform. Shop quality products, earn cashback rewards, and invest for your future growth. Join thousands of Tanzanians building wealth through smart shopping.",
    keywords: [
        'online shopping Tanzania',
        'e-commerce Tanzania',
        'cashback shopping',
        'investment platform',
        'RewaMart',
        'Dar es Salaam shopping',
        'earn money shopping',
        'referral rewards',
        'Tanzania marketplace',
        'buy online Tanzania',
        'online store Tanzania',
        'shopping deals Tanzania'
    ],
    authors: [{ name: 'RewaMart' }],
    creator: 'RewaMart',
    publisher: 'RewaMart',
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    manifest: '/manifest.json',
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    openGraph: {
        type: 'website',
        locale: 'en_TZ',
        url: 'https://www.rewamart.co.tz',
        siteName: 'RewaMart',
        title: 'RewaMart - Shop, Earn, Invest | Tanzania E-Commerce Platform',
        description: "Tanzania's premier e-commerce and investment platform. Shop quality products, earn cashback rewards, and invest for your future.",
        images: [
            {
                url: '/images/og-image.png',
                width: 1200,
                height: 630,
                alt: 'RewaMart - Shop, Earn, Invest',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'RewaMart - Shop, Earn, Invest',
        description: "Tanzania's premier e-commerce and investment platform",
        images: ['/images/og-image.png'],
        creator: '@rewamart',
    },

    verification: {
        // Add your verification codes here after setting up:
        // google: 'your-google-site-verification-code',
        // bing: 'your-bing-verification-code',
    },
};

export const viewport = {
    themeColor: '#10b981',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <ThemeProvider>
                    <AppWrapper>
                        <Navbar />
                        <main className="min-h-screen pb-20 dark:bg-gray-900 dark:text-white transition-colors bg-white">
                            {children}
                        </main>
                        <BottomNav />
                    </AppWrapper>
                </ThemeProvider>
            </body>
        </html>
    );
}
