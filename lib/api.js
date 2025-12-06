// API Client for RewaMart Backend
// Replaces localStorage-based operations with backend API calls

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';

// Helper to get auth token from localStorage
const getToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('rewamart_token');
    }
    return null;
};

// Helper to set auth token
const setToken = (token) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('rewamart_token', token);
    }
};

// Helper to remove auth token
const removeToken = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('rewamart_token');
    }
};

// Generic API call wrapper
async function apiCall(endpoint, options = {}) {
    const token = getToken();

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    const config = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }

        return { success: true, data };
    } catch (error) {
        console.error('API Error:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// AUTHENTICATION API
// ============================================

export const authAPI = {
    async register(email, password, name, phone, referredBy) {
        const result = await apiCall('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name, phone, referredBy }),
        });

        if (result.success && result.data.token) {
            setToken(result.data.token);
            // Store user data
            if (typeof window !== 'undefined') {
                localStorage.setItem('rewamart_user', JSON.stringify(result.data.user));
            }
        }

        return result;
    },

    async login(email, password) {
        const result = await apiCall('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        if (result.success && result.data.token) {
            setToken(result.data.token);
            // Store user data
            if (typeof window !== 'undefined') {
                localStorage.setItem('rewamart_user', JSON.stringify(result.data.user));
            }
        }

        return result;
    },

    async logout() {
        removeToken();
        if (typeof window !== 'undefined') {
            localStorage.removeItem('rewamart_user');
        }
        return { success: true };
    },

    async getCurrentUser() {
        const result = await apiCall('/api/auth/me');

        if (result.success) {
            // Update stored user data
            if (typeof window !== 'undefined') {
                localStorage.setItem('rewamart_user', JSON.stringify(result.data.user));
            }
        }

        return result;
    },

    isAuthenticated() {
        return !!getToken();
    },

    getStoredUser() {
        if (typeof window !== 'undefined') {
            const userData = localStorage.getItem('rewamart_user');
            return userData ? JSON.parse(userData) : null;
        }
        return null;
    },
};

// ============================================
// PRODUCTS API
// ============================================

export const productsAPI = {
    async getAll(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await apiCall(`/api/products?${queryString}`);
    },

    async getById(id) {
        return await apiCall(`/api/products/${id}`);
    },

    async getCategories() {
        return await apiCall('/api/products/categories');
    },

    async create(productData) {
        return await apiCall('/api/products', {
            method: 'POST',
            body: JSON.stringify(productData),
        });
    },

    async update(id, productData) {
        return await apiCall(`/api/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData),
        });
    },

    async delete(id) {
        return await apiCall(`/api/products/${id}`, {
            method: 'DELETE',
        });
    },
};

// ============================================
// ORDERS API
// ============================================

export const ordersAPI = {
    async create(orderData) {
        return await apiCall('/api/orders', {
            method: 'POST',
            body: JSON.stringify(orderData),
        });
    },

    async getAll(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await apiCall(`/api/orders?${queryString}`);
    },

    async getById(id) {
        return await apiCall(`/api/orders/${id}`);
    },
};

// ============================================
// WALLET API
// ============================================

export const walletAPI = {
    async getBalance() {
        return await apiCall('/api/wallet/balance');
    },

    async getTransactions(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await apiCall(`/api/wallet/transactions?${queryString}`);
    },

    async deposit(amount, method, reference) {
        return await apiCall('/api/wallet/transactions', {
            method: 'POST',
            body: JSON.stringify({ amount, method, reference }),
        });
    },

    async withdraw(amount, method, phoneNumber) {
        return await apiCall('/api/wallet/withdraw', {
            method: 'POST',
            body: JSON.stringify({ amount, method, phoneNumber }),
        });
    },
};

// ============================================
// INVESTMENTS API
// ============================================

export const investmentsAPI = {
    async getPlans() {
        return await apiCall('/api/investments/plans');
    },

    async getAll() {
        return await apiCall('/api/investments');
    },

    async create(planId, amount) {
        return await apiCall('/api/investments', {
            method: 'POST',
            body: JSON.stringify({ planId, amount }),
        });
    },

    async getAutoInvestStatus() {
        return await apiCall('/api/investments/auto-invest');
    },

    async toggleAutoInvest(enabled) {
        return await apiCall('/api/investments/auto-invest', {
            method: 'POST',
            body: JSON.stringify({ enabled }),
        });
    },
};

// ============================================
// REFERRALS API
// ============================================

export const referralsAPI = {
    async getCode() {
        return await apiCall('/api/referrals/code');
    },

    async validate(code) {
        return await apiCall('/api/referrals/validate', {
            method: 'POST',
            body: JSON.stringify({ code }),
        });
    },
};

// ============================================
// ADMIN API
// ============================================

export const adminAPI = {
    async getAnalytics() {
        return await apiCall('/api/admin/analytics');
    },

    async getVendors() {
        return await apiCall('/api/admin/vendors');
    },

    async getCustomers() {
        return await apiCall('/api/admin/customers');
    },
};

// Export all APIs
export default {
    auth: authAPI,
    products: productsAPI,
    orders: ordersAPI,
    wallet: walletAPI,
    investments: investmentsAPI,
    referrals: referralsAPI,
    admin: adminAPI,
};
