'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Phone, MapPin, Eye, EyeOff } from 'lucide-react';
import { loginUser, registerUser } from '../../lib/auth';
import Toast from '../../components/Toast';

export default function AuthPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(false);

    const [loginForm, setLoginForm] = useState({
        email: '',
        password: ''
    });

    const [registerForm, setRegisterForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'customer'
    });

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!loginForm.email || !loginForm.password) {
            setToast({ type: 'error', message: 'Please fill in all fields' });
            setLoading(false);
            return;
        }

        try {
            const result = await loginUser(loginForm.email, loginForm.password);

            if (result.success) {
                setToast({ type: 'success', message: 'Login successful!' });
                setTimeout(() => {
                    if (result.user.role === 'admin') {
                        router.push('/admin-dashboard');
                    } else if (result.user.role === 'vendor') {
                        router.push('/vendor-dashboard');
                    } else {
                        router.push('/user-dashboard');
                    }
                }, 1500);
            } else {
                setToast({ type: 'error', message: result.error || 'Invalid email or password' });
            }
        } catch (error) {
            console.error('Login error:', error);
            setToast({ type: 'error', message: error.message || 'Login failed. Please try again.' });
        }

        setLoading(false);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!registerForm.name || !registerForm.email || !registerForm.password) {
            setToast({ type: 'error', message: 'Please fill in all fields' });
            setLoading(false);
            return;
        }

        if (registerForm.password !== registerForm.confirmPassword) {
            setToast({ type: 'error', message: 'Passwords do not match' });
            setLoading(false);
            return;
        }

        try {
            const result = await registerUser(registerForm.email, registerForm.password, registerForm.name, '', null);

            if (result.success) {
                setToast({ type: 'success', message: 'Account created! Please login.' });
                setTimeout(() => {
                    setIsLogin(true);
                    setRegisterForm({ name: '', email: '', password: '', confirmPassword: '', role: 'customer' });
                }, 1500);
            } else {
                setToast({ type: 'error', message: result.error || 'Registration failed' });
            }
        } catch (error) {
            console.error('Register error:', error);
            setToast({ type: 'error', message: error.message || 'Registration failed. Please try again.' });
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700">
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/30 via-pink-500/20 to-orange-500/30 animate-pulse"></div>
            </div>

            {/* Animated Background Shapes */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Large circle top-left */}
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-blob"></div>
                {/* Medium circle top-right */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-300/20 rounded-full blur-2xl animate-blob animation-delay-2000"></div>
                {/* Large circle bottom-right */}
                <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-400/15 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
                {/* Small circle bottom-left */}
                <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-teal-300/20 rounded-full blur-2xl animate-blob animation-delay-6000"></div>
            </div>

            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/40 rounded-full animate-float"></div>
                <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-white/30 rounded-full animate-float animation-delay-2000"></div>
                <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-white/40 rounded-full animate-float animation-delay-4000"></div>
                <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-white/30 rounded-full animate-float animation-delay-6000"></div>
            </div>

            {/* Content Container with Glassmorphism */}
            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-block p-4 bg-white/20 backdrop-blur-md rounded-3xl shadow-2xl mb-4">
                        <img src="/images/logo.png" alt="RewaMart Logo" className="w-24 h-24 object-contain" />
                    </div>
                    <h1 className="text-4xl font-bold text-white drop-shadow-lg"></h1>
                    <p className="text-white/90 text-lg mt-2 font-medium drop-shadow">Shop • Earn • Invest</p>
                </div>

                {/* Auth Card with Glassmorphism */}
                <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 space-y-6 border border-white/20">
                    {/* Tabs */}
                    <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`pb-3 font-medium transition-colors ${isLogin
                                ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`pb-3 font-medium transition-colors ${!isLogin
                                ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            Register
                        </button>
                    </div>

                    {/* Login Form */}
                    {isLogin ? (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                                    <input
                                        type="email"
                                        name="email"
                                        id="login-email"
                                        autoComplete="email"
                                        value={loginForm.email}
                                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                                        placeholder="Enter your email"
                                        className={`w-full pl-10 pr-4 py-2 border rounded-lg outline-none transition-all text-gray-900 dark:text-white ${loginForm.email
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 focus:ring-2 focus:ring-emerald-500'
                                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500'
                                            }`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        id="login-password"
                                        autoComplete="current-password"
                                        value={loginForm.password}
                                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                        placeholder="Enter your password"
                                        className={`w-full pl-10 pr-10 py-2 border rounded-lg outline-none transition-all text-gray-900 dark:text-white ${loginForm.password
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 focus:ring-2 focus:ring-emerald-500'
                                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500'
                                            }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-emerald-600 text-white py-2 rounded-lg font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Logging in...' : 'Login'}
                            </button>


                        </form>
                    ) : (
                        /* Register Form */
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        value={registerForm.name}
                                        onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                                        placeholder="Enter your name"
                                        className={`w-full pl-10 pr-4 py-2 border rounded-lg outline-none transition-all text-gray-900 dark:text-white ${registerForm.name
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 focus:ring-2 focus:ring-emerald-500'
                                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500'
                                            }`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                                    <input
                                        type="email"
                                        value={registerForm.email}
                                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                                        placeholder="Enter your email"
                                        className={`w-full pl-10 pr-4 py-2 border rounded-lg outline-none transition-all text-gray-900 dark:text-white ${registerForm.email
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 focus:ring-2 focus:ring-emerald-500'
                                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500'
                                            }`}
                                    />
                                </div>
                            </div>



                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={registerForm.password}
                                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                                        placeholder="At least 6 characters"
                                        className={`w-full pl-10 pr-10 py-2 border rounded-lg outline-none transition-all text-gray-900 dark:text-white ${registerForm.password
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 focus:ring-2 focus:ring-emerald-500'
                                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500'
                                            }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={registerForm.confirmPassword}
                                        onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                                        placeholder="Confirm password"
                                        className={`w-full pl-10 pr-10 py-2 border rounded-lg outline-none transition-all text-gray-900 dark:text-white ${registerForm.confirmPassword
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 focus:ring-2 focus:ring-emerald-500'
                                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500'
                                            }`}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-emerald-600 text-white py-2 rounded-lg font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Creating account...' : 'Create Account'}
                            </button>
                        </form>
                    )}


                </div>
            </div>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
