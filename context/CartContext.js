'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { storage, STORAGE_KEYS } from '../lib/storage';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);

    // Load cart from storage on mount
    useEffect(() => {
        const savedCart = storage.get(STORAGE_KEYS.CART, []);
        setCart(savedCart);
    }, []);

    const addToCart = (product) => {
        const newCart = [...cart, { ...product, cartId: Date.now() }];
        setCart(newCart);
        storage.set(STORAGE_KEYS.CART, newCart);
    };

    const removeFromCart = (cartId) => {
        const newCart = cart.filter(item => item.cartId !== cartId);
        setCart(newCart);
        storage.set(STORAGE_KEYS.CART, newCart);
    };

    const clearCart = () => {
        setCart([]);
        storage.set(STORAGE_KEYS.CART, []);
    };

    const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);
    const potentialCashback = cart.reduce((sum, item) => sum + (item.price * (item.cashback || 0)), 0);

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            clearCart,
            cartTotal,
            potentialCashback
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
