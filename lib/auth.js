import { authAPI, adminAPI } from './api';

// Register new user
export const registerUser = async (email, password, name, phone = '', referredBy = null) => {
    try {
        const result = await authAPI.register(email, password, name, phone, referredBy);

        if (result.success) {
            return {
                success: true,
                user: result.data.user,
                token: result.data.token
            };
        } else {
            return {
                success: false,
                error: result.error
            };
        }
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Registration failed'
        };
    }
};

// Login user
export const loginUser = async (email, password) => {
    try {
        const result = await authAPI.login(email, password);

        if (result.success) {
            return {
                success: true,
                user: result.data.user,
                token: result.data.token
            };
        } else {
            return {
                success: false,
                error: result.error
            };
        }
    } catch (error) {
        return {
            success: false,
            error: error.message || 'Login failed'
        };
    }
};

// Logout user
export const logoutUser = () => {
    authAPI.logout();
    // Redirect handled by calling component
};

// Get current user
export const getCurrentUser = () => {
    // Try to get from localStorage first (cached)
    const user = authAPI.getStoredUser();
    return user;
};

// Check if user is authenticated
export const isAuthenticated = () => {
    return authAPI.isAuthenticated();
};

// Refresh user data from server
export const refreshUserData = async () => {
    try {
        const result = await authAPI.getCurrentUser();
        if (result.success) {
            return result.data.user;
        }
        return null;
    } catch (error) {
        console.error('Error refreshing user data:', error);
        return null;
    }
};

// Get user by ID (for backward compatibility)
export const getUserById = async (userId) => {
    // This would need a separate API endpoint if needed
    // For now, return null
    console.warn('getUserById not implemented with backend API');
    return null;
};

// Update user profile (for backward compatibility)
export const updateUserProfile = async (userId, profileData) => {
    // This would need a separate API endpoint if needed
    console.warn('updateUserProfile not implemented with backend API');
    return { success: false, error: 'Not implemented' };
};

// Get all vendors
export const getAllVendors = async () => {
    try {
        const result = await adminAPI.getVendors();
        if (result.success) {
            return result.data.vendors;
        }
        return [];
    } catch (error) {
        console.error('Error fetching vendors:', error);
        return [];
    }
};

// Get all customers (admin only)
export const getAllCustomers = async () => {
    try {
        const result = await adminAPI.getCustomers();
        if (result.success) {
            return result.data.customers;
        }
        return [];
    } catch (error) {
        console.error('Error fetching customers:', error);
        return [];
    }
};
