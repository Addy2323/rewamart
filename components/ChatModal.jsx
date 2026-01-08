'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Send, User, Store, Loader2 } from 'lucide-react';
import { storage, STORAGE_KEYS } from '../lib/storage';

export default function ChatModal({ isOpen, onClose, vendorId, vendorName, conversationId: initialConversationId }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [conversationId, setConversationId] = useState(initialConversationId);
    const messagesEndRef = useRef(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = storage.get(STORAGE_KEYS.USER);
        setUser(userData);
    }, []);

    useEffect(() => {
        if (isOpen && !initialConversationId && vendorId && user) {
            startConversation();
        } else if (isOpen && initialConversationId) {
            setConversationId(initialConversationId);
        }
    }, [isOpen, vendorId, user, initialConversationId]);

    useEffect(() => {
        let interval;
        if (conversationId) {
            fetchMessages();
            interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
        }
        return () => clearInterval(interval);
    }, [conversationId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const startConversation = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/chat/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vendorId })
            });
            const data = await response.json();
            if (data.conversation) {
                setConversationId(data.conversation.id);
            }
        } catch (error) {
            console.error('Error starting conversation:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async () => {
        if (!conversationId) return;
        try {
            const response = await fetch(`/api/chat/messages?conversationId=${conversationId}`);
            const data = await response.json();
            if (data.messages) {
                setMessages(data.messages);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !conversationId || sending) return;

        setSending(true);
        try {
            const response = await fetch('/api/chat/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationId,
                    content: newMessage.trim()
                })
            });
            const data = await response.json();
            if (data.message) {
                setMessages([...messages, data.message]);
                setNewMessage('');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full h-[600px] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between bg-emerald-600 text-white">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            {user?.role === 'vendor' ? <User size={20} /> : <Store size={20} />}
                        </div>
                        <div>
                            <h2 className="font-bold">{vendorName}</h2>
                            <p className="text-xs text-emerald-100">{user?.role === 'vendor' ? 'Customer' : 'Vendor'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="animate-spin text-emerald-600" size={32} />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>No messages yet. Start the conversation!</p>
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${msg.senderId === user?.id
                                        ? 'bg-emerald-600 text-white rounded-tr-none'
                                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none'
                                        }`}
                                >
                                    <p>{msg.content}</p>
                                    <p className={`text-[10px] mt-1 ${msg.senderId === user?.id ? 'text-emerald-100' : 'text-gray-400'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 bg-gray-100 dark:bg-gray-700 border-none rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || sending}
                            className="bg-emerald-600 text-white p-2 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
                        >
                            {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
