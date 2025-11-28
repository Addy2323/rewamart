// LocalStorage wrapper for data persistence

const STORAGE_KEYS = {
    WALLET: 'rewamart_wallet',
    USER: 'rewamart_user',
    CART: 'rewamart_cart',
    INVESTMENTS: 'rewamart_investments',
    REFERRALS: 'rewamart_referrals',
    TRANSACTIONS: 'rewamart_transactions',
    PRODUCT_CASHBACK: 'rewamart_product_cashback'
};

export const storage = {
    get: (key, defaultValue = null) => {
        if (typeof window === 'undefined') return defaultValue;
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error reading ${key} from localStorage:`, error);
            return defaultValue;
        }
    },

    set: (key, value) => {
        if (typeof window === 'undefined') return;
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error writing ${key} to localStorage:`, error);
        }
    },

    remove: (key) => {
        if (typeof window === 'undefined') return;
        try {
            window.localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing ${key} from localStorage:`, error);
        }
    },

    clear: () => {
        if (typeof window === 'undefined') return;
        try {
            window.localStorage.clear();
        } catch (error) {
            console.error('Error clearing localStorage:', error);
        }
    }
};

export { STORAGE_KEYS };
