import { storage, STORAGE_KEYS } from './storage';
import { initializeReferralCode, registerReferralCode } from './referrals';

const AUTH_KEY = 'rewamart_auth';
const USERS_KEY = 'rewamart_users';

// Initialize default admin user
const initializeDefaultAdmin = () => {
    const users = storage.get(USERS_KEY, []);
    const adminExists = users.some(u => u.role === 'admin');

    if (!adminExists) {
        const defaultAdmin = {
            id: 'admin-001',
            email: 'admin@rewamart.com',
            password: 'admin123', // In production, use hashed passwords
            name: 'Admin User',
            role: 'admin',
            createdAt: new Date().toISOString()
        };
        users.push(defaultAdmin);
        storage.set(USERS_KEY, users);
    }
};

// Register new user
export const registerUser = (email, password, name, role = 'customer') => {
    const users = storage.get(USERS_KEY, []);

    // Check if user already exists
    if (users.some(u => u.email === email)) {
        return { success: false, error: 'Email already registered' };
    }

    // Validate password
    if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
    }

    const newUser = {
        id: `user-${Date.now()}`,
        email,
        password, // In production, hash this
        name,
        role,
        createdAt: new Date().toISOString(),
        profile: {
            phone: '',
            address: '',
            city: '',
            country: 'Tanzania'
        }
    };

    users.push(newUser);
    storage.set(USERS_KEY, users);

    // Automatically generate and register referral code
    try {
        const code = initializeReferralCode(newUser.name);
        registerReferralCode(code, newUser);
    } catch (error) {
        console.error('Error generating referral code:', error);
    }

    return { success: true, user: newUser };
};

// Login user
export const loginUser = (email, password) => {
    initializeDefaultAdmin();
    const users = storage.get(USERS_KEY, []);

    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        return { success: false, error: 'Invalid email or password' };
    }

    const authData = {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
        },
        loginTime: new Date().toISOString()
    };

    storage.set(AUTH_KEY, authData);
    return { success: true, user: authData.user };
};

// Logout user
export const logoutUser = () => {
    storage.remove(AUTH_KEY);
};

// Get current user
export const getCurrentUser = () => {
    const authData = storage.get(AUTH_KEY, null);
    return authData?.user || null;
};

// Check if user is authenticated
export const isAuthenticated = () => {
    return getCurrentUser() !== null;
};

// Get user by ID
export const getUserById = (userId) => {
    const users = storage.get(USERS_KEY, []);
    return users.find(u => u.id === userId);
};

// Update user profile
export const updateUserProfile = (userId, profileData) => {
    const users = storage.get(USERS_KEY, []);
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        return { success: false, error: 'User not found' };
    }

    users[userIndex] = {
        ...users[userIndex],
        profile: { ...users[userIndex].profile, ...profileData }
    };

    storage.set(USERS_KEY, users);
    return { success: true, user: users[userIndex] };
};

// Get all vendors
export const getAllVendors = () => {
    const users = storage.get(USERS_KEY, []);
    return users.filter(u => u.role === 'vendor');
};

// Get all customers
export const getAllCustomers = () => {
    const users = storage.get(USERS_KEY, []);
    return users.filter(u => u.role === 'customer');
};

// Initialize auth system
initializeDefaultAdmin();
