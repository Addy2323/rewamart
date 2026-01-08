'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, User, Store, Clock, Loader2 } from 'lucide-react';
import { storage, STORAGE_KEYS } from '../lib/storage';

export default function ChatList({ onSelectConversation }) {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const userData = storage.get(STORAGE_KEYS.USER);
        setUser(userData);
        fetchConversations();
        const interval = setInterval(fetchConversations, 10000); // Poll every 10 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchConversations = async () => {
        try {
            const response = await fetch('/api/chat/conversations');
            const data = await response.json();
            if (data.conversations) {
                setConversations(data.conversations);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-emerald-600" size={32} />
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                <MessageSquare className="mx-auto text-gray-300 mb-3" size={48} />
                <p className="text-gray-500">No active conversations</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {conversations.map((conv) => {
                const lastMessage = conv.messages[0];
                const isVendor = user?.role === 'vendor';
                const otherParty = isVendor ? conv.customer : conv.vendor;
                const Icon = isVendor ? User : Store;

                return (
                    <button
                        key={conv.id}
                        onClick={() => onSelectConversation(conv)}
                        className="w-full flex items-center p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all border border-transparent hover:border-emerald-200 text-left"
                    >
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 mr-4 flex-shrink-0">
                            <Icon size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-gray-900 dark:text-white truncate">
                                    {otherParty.name}
                                </h4>
                                {lastMessage && (
                                    <span className="text-[10px] text-gray-400 flex items-center whitespace-nowrap ml-2">
                                        <Clock size={10} className="mr-1" />
                                        {new Date(lastMessage.createdAt).toLocaleDateString()}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {lastMessage ? lastMessage.content : 'No messages yet'}
                            </p>
                        </div>
                        {lastMessage && !lastMessage.isRead && lastMessage.senderId !== user?.id && (
                            <div className="w-2 h-2 bg-emerald-500 rounded-full ml-3"></div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
