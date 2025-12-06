import { walletAPI, investmentsAPI } from './api';

export const INITIAL_WALLET_STATE = {
    balance: 0,
    totalEarned: 0,
    totalInvested: 0,
    cashbackTotal: 0,
    bonusTotal: 0,
    autoInvestEnabled: false,
    autoInvestPercent: 10
};

// Get wallet balance from backend
export const getWallet = async () => {
    try {
        const balanceResult = await walletAPI.getBalance();
        const autoInvestResult = await investmentsAPI.getAutoInvestStatus();

        if (balanceResult.success) {
            return {
                balance: balanceResult.data.balance,
                autoInvestEnabled: autoInvestResult.success ? autoInvestResult.data.autoInvest : false,
                autoInvestPercent: 10, // Default
                // Note: other stats would need separate API endpoints
                totalEarned: 0,
                totalInvested: 0,
                cashbackTotal: 0,
                bonusTotal: 0,
            };
        }
        return INITIAL_WALLET_STATE;
    } catch (error) {
        console.error('Error getting wallet:', error);
        return INITIAL_WALLET_STATE;
    }
};

// Get transactions from backend
export const getTransactions = async (filterType = 'all') => {
    try {
        const params = filterType !== 'all' ? { type: filterType } : {};
        const result = await walletAPI.getTransactions(params);

        if (result.success) {
            return result.data.transactions;
        }
        return [];
    } catch (error) {
        console.error('Error getting transactions:', error);
        return [];
    }
};

// Add funds (deposit) via backend
export const addFunds = async (amount, description, type = 'deposit') => {
    try {
        const result = await walletAPI.deposit(amount, type, description);

        if (result.success) {
            return {
                wallet: { balance: result.data.balance },
                transaction: result.data.transaction
            };
        }
        return { success: false, error: result.error };
    } catch (error) {
        console.error('Error adding funds:', error);
        return { success: false, error: error.message };
    }
};

// Deduct funds - handled by backend when creating orders/investments
export const deductFunds = async (amount, description, type = 'payment') => {
    // This is now handled automatically by backend when:
    // - Creating orders (walletAPI integrated in order creation)
    // - Creating investments
    // So this function is mainly for backward compatibility
    console.warn('deductFunds: Operations now handled by backend');
    return { success: true };
};

// Toggle auto-invest setting
export const toggleAutoInvest = async (enabled, percent) => {
    try {
        const result = await investmentsAPI.toggleAutoInvest(enabled);

        if (result.success) {
            return {
                autoInvestEnabled: enabled,
                autoInvestPercent: percent || 10
            };
        }
        return null;
    } catch (error) {
        console.error('Error toggling auto-invest:', error);
        return null;
    }
};

// Process purchase with cashback
export const processPurchase = async (purchaseAmount, cashbackAmount) => {
    // This is now handled automatically by the backend when creating an order
    // The backend automatically:
    // 1. Deducts order amount from wallet
    // 2. Adds cashback to wallet
    // 3. If auto-invest is enabled, invests the cashback

    // This function is kept for backward compatibility
    // but the actual work is done in the backend

    return {
        cashbackEarned: cashbackAmount,
        investedAmount: 0, // Backend handles this
        newBalance: 0 // Will be updated from backend
    };
};

// Withdraw funds to mobile money
export const withdrawFunds = async (amount, method, phoneNumber) => {
    try {
        const result = await walletAPI.withdraw(amount, method, phoneNumber);

        if (result.success) {
            return {
                success: true,
                transaction: result.data.transaction,
                balance: result.data.balance
            };
        }
        return { success: false, error: result.error };
    } catch (error) {
        console.error('Error withdrawing funds:', error);
        return { success: false, error: error.message };
    }
};
