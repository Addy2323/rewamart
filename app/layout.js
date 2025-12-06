import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import ThemeProvider from '../components/ThemeProvider';
import AppWrapper from '../components/AppWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'RewaMart - Shop, Earn, Invest',
    description: 'Tanzania\'s premier shopping and investment platform',
    manifest: '/manifest.json',
    themeColor: '#9333ea',
    viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
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
