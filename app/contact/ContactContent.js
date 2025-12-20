'use client';

import { useState } from 'react';
import { Search, Package, RefreshCw, CreditCard, User, Shield, MessageCircle, Phone, Mail, ChevronDown, ChevronUp } from 'lucide-react';

export default function CustomerServicePage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedFaq, setExpandedFaq] = useState(null);

    const helpTopics = [
        {
            icon: <Package size={32} className="text-orange-500" />,
            title: 'Your Orders',
            description: 'Track packages, edit or cancel orders'
        },
        {
            icon: <RefreshCw size={32} className="text-blue-500" />,
            title: 'Returns & Refunds',
            description: 'Return items, print labels, check status'
        },
        {
            icon: <CreditCard size={32} className="text-green-500" />,
            title: 'Payments & Gift Cards',
            description: 'Manage cards, check balance, top up'
        },
        {
            icon: <User size={32} className="text-purple-500" />,
            title: 'Account Settings',
            description: 'Change email, password, address'
        },
        {
            icon: <Shield size={32} className="text-red-500" />,
            title: 'Security & Privacy',
            description: 'Manage security, report issues'
        },
        {
            icon: <MessageCircle size={32} className="text-teal-500" />,
            title: 'Digital Services',
            description: 'Content, devices, subscriptions'
        }
    ];

    const faqs = [
        {
            question: 'Where is my stuff?',
            answer: 'You can track your package by visiting the "Your Orders" section in your account. If your package is late, please check the tracking details for the latest updates.'
        },
        {
            question: 'How do I return an item?',
            answer: 'Go to "Your Orders" and select the item you wish to return. Follow the prompts to print a return label and schedule a pickup or find a drop-off location.'
        },
        {
            question: 'Can I cancel my order?',
            answer: 'You can cancel your order if it has not yet entered the shipping process. Go to "Your Orders" and select "Cancel Order".'
        },
        {
            question: 'How do I change my password?',
            answer: 'Go to "Account Settings" > "Login & Security" to update your password.'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
            {/* Hero Section */}
            <div className="bg-[#047857] text-white py-12 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-3xl font-bold mb-8">Hello. What can we help you with?</h1>
                    <div className="relative max-w-2xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search our help library..."
                            className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 outline-none focus:ring-4 focus:ring-emerald-400/50 shadow-lg text-lg"
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
                {/* Help Topics */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Some things you can do here</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {helpTopics.map((topic, index) => (
                            <div
                                key={index}
                                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer flex items-start space-x-4"
                            >
                                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    {topic.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">{topic.title}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{topic.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FAQ Section */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                        {faqs.map((faq, index) => (
                            <div key={index} className="p-6">
                                <button
                                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                                    className="w-full flex items-center justify-between text-left group"
                                >
                                    <span className="font-medium text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">{faq.question}</span>
                                    {expandedFaq === index ? (
                                        <ChevronUp className="text-gray-400" />
                                    ) : (
                                        <ChevronDown className="text-gray-400" />
                                    )}
                                </button>
                                {expandedFaq === index && (
                                    <div className="mt-4 text-gray-600 dark:text-gray-400 text-sm leading-relaxed animate-fade-in-up">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Contact Options */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Need more help?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageCircle className="text-emerald-600 dark:text-emerald-400" size={24} />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Chat with us</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Start a live chat with our support team.</p>
                            <button className="w-full py-2 border border-emerald-600 text-emerald-600 rounded-lg font-medium hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
                                Start Chat
                            </button>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Phone className="text-blue-600 dark:text-blue-400" size={24} />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Call us</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Call our support line directly.</p>
                            <button className="w-full py-2 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                                +255 123 456 789
                            </button>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail className="text-purple-600 dark:text-purple-400" size={24} />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Email us</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Send us an email with your query.</p>
                            <button className="w-full py-2 border border-purple-600 text-purple-600 rounded-lg font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                                support@rewamart.com
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
