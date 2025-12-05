// Withdrawal management library for RewaMart
// Handles cashback withdrawals to mobile money

import { storage, STORAGE_KEYS } from './storage';

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
export function createWithdrawal(userId, amount, phoneNumber) {
    const withdrawals = storage.get(STORAGE_KEYS.WITHDRAWALS) || [];

    const withdrawal = {
        id: `wd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        amount,
        phoneNumber,
        status: WITHDRAWAL_STATUS.COMPLETED, // Auto-complete for demo purposes
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
    };

    withdrawals.push(withdrawal);
    storage.set(STORAGE_KEYS.WITHDRAWALS, withdrawals);

    return { success: true, withdrawal };
}

/**
 * Get all withdrawals for a user
 */
export function getWithdrawalsByUser(userId) {
    const withdrawals = storage.get(STORAGE_KEYS.WITHDRAWALS) || [];
    return withdrawals.filter(wd => wd.userId === userId);
}

/**
 * Get total withdrawn amount for a user
 */
export function getTotalWithdrawn(userId) {
    const withdrawals = getWithdrawalsByUser(userId);
    return withdrawals
        .filter(wd => wd.status === WITHDRAWAL_STATUS.COMPLETED)
        .reduce((sum, wd) => sum + wd.amount, 0);
}
