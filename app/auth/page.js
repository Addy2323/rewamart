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

        const result = loginUser(loginForm.email, loginForm.password);

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
            setToast({ type: 'error', message: result.error });
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

        const result = registerUser(registerForm.email, registerForm.password, registerForm.name, registerForm.role);

        if (result.success) {
            setToast({ type: 'success', message: 'Account created! Please login.' });
            setTimeout(() => {
                setIsLogin(true);
                setRegisterForm({ name: '', email: '', password: '', confirmPassword: '', role: 'customer' });
            }, 1500);
        } else {
            setToast({ type: 'error', message: result.error });
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-white font-bold text-2xl">R</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">RewaMart</h1>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">Shop • Earn • Invest</p>
                </div>

                {/* Auth Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
                    {/* Tabs */}
                    <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`pb-3 font-medium transition-colors ${
                                isLogin
                                    ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`pb-3 font-medium transition-colors ${
                                !isLogin
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
                                        value={loginForm.email}
                                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                                        placeholder="Enter your email"
                                        className={`w-full pl-10 pr-4 py-2 border rounded-lg outline-none transition-all text-gray-900 dark:text-white ${
                                            loginForm.email
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
                                        value={loginForm.password}
                                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                        placeholder="Enter your password"
                                        className={`w-full pl-10 pr-10 py-2 border rounded-lg outline-none transition-all text-gray-900 dark:text-white ${
                                            loginForm.password
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

                            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                                Demo: admin@rewamart.com / admin123
                            </p>
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
                                        className={`w-full pl-10 pr-4 py-2 border rounded-lg outline-none transition-all text-gray-900 dark:text-white ${
                                            registerForm.name
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
                                        className={`w-full pl-10 pr-4 py-2 border rounded-lg outline-none transition-all text-gray-900 dark:text-white ${
                                            registerForm.email
                                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 focus:ring-2 focus:ring-emerald-500'
                                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500'
                                        }`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Type</label>
                                <select
                                    value={registerForm.role}
                                    onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}
                                    className={`w-full px-4 py-2 border rounded-lg outline-none transition-all text-gray-900 dark:text-white ${
                                        registerForm.role
                                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 focus:ring-2 focus:ring-emerald-500'
                                            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500'
                                    }`}
                                >
                                    <option value="customer">Customer</option>
                                    <option value="vendor">Vendor</option>
                                </select>
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
                                        className={`w-full pl-10 pr-10 py-2 border rounded-lg outline-none transition-all text-gray-900 dark:text-white ${
                                            registerForm.password
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
                                        className={`w-full pl-10 pr-10 py-2 border rounded-lg outline-none transition-all text-gray-900 dark:text-white ${
                                            registerForm.confirmPassword
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

                    {/* Guest Access */}
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Link
                            href="/shop"
                            className="block text-center text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium"
                        >
                            Continue as Guest
                        </Link>
                    </div>
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
