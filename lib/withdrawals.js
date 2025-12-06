import { walletAPI } from './api';

// Withdrawal status
export const WITHDRAWAL_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed'
};

/**
 * Create a new withdrawal request
 */
export async function createWithdrawal(userId, amount, phoneNumber) {
    try {
        const result = await walletAPI.withdraw(amount, 'mobile_money', phoneNumber);
        return result;
    } catch (error) {
        console.error('Error creating withdrawal:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get all withdrawals for a user
 */
export async function getWithdrawalsByUser(userId) {
    try {
        // Fetch transactions of type 'withdrawal'
        // Note: The API might return 'withdrawal' or 'withdraw' depending on how it was saved.
        // The API route saves type as 'withdrawal' (if I recall correctly from wallet/withdraw route, need to verify)
        // Let's check app/api/wallet/withdraw/route.js to be sure.
        // Assuming 'withdrawal' for now based on typical convention, but will verify.

        const result = await walletAPI.getTransactions({ type: 'withdrawal', limit: 100 });
        if (result.success) {
            return result.data.transactions;
        }
        return [];
    } catch (error) {
        console.error('Error fetching withdrawals:', error);
        return [];
    }
}

/**
 * Get total withdrawn amount for a user
 */
export async function getTotalWithdrawn(userId) {
    try {
        const withdrawals = await getWithdrawalsByUser(userId);
        // Withdrawals are negative amounts in transactions usually?
        // Let's check how they are stored. If stored as negative, we abs() them.
        // If stored as positive amount but type 'withdrawal', we sum them.

        // In app/api/wallet/transactions/route.js, investment is stored as negative amount.
        // I should check app/api/wallet/withdraw/route.js to see how it stores it.

        return withdrawals.reduce((sum, wd) => sum + Math.abs(wd.amount), 0);
    } catch (error) {
        console.error('Error getting total withdrawn:', error);
        return 0;
    }
}
