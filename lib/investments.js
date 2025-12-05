// Investment management library for RewaMart
// Handles cashback investments in UTT AMISS and M-wekeza

import { storage, STORAGE_KEYS } from './storage';

// Investment providers
export const INVESTMENT_PROVIDERS = {
    UTT_AMISS: 'UTT_AMISS',
    M_WEKEZA: 'M_WEKEZA'
};

// Investment status
export const INVESTMENT_STATUS = {
    PENDING: 'pending',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    FAILED: 'failed'
};

// UTT AMISS fund options
export const UTT_AMISS_FUNDS = [
    { id: 'umoja', name: 'Umoja Fund', returnRate: 0.14 },
    { id: 'wekeza_maisha', name: 'Wekeza Maisha Fund', returnRate: 0.13 },
    { id: 'watoto', name: 'Watoto Fund', returnRate: 0.14 },
    { id: 'jikimu', name: 'Jikimu Fund', returnRate: 0.12 },
    { id: 'liquid', name: 'Liquid Fund', returnRate: 0.11 },
    { id: 'bond', name: 'Bond Fund', returnRate: 0.10 }
];

// Investment Types for the invest page
export const INVESTMENT_TYPES = {
    utt: {
        id: 'utt',
        name: 'UTT AMIS',
        description: 'Unit Trust of Tanzania - Government backed investment funds',
        minAmount: 10000,
        options: UTT_AMISS_FUNDS.map(fund => ({
            id: fund.id,
            name: fund.name,
            return: `${(fund.returnRate * 100).toFixed(0)}% p.a.`
        }))
    },
    mwekeza: {
        id: 'mwekeza',
        name: 'M-Wekeza',
        description: 'Mobile-based investment platform via M-Pesa',
        minAmount: 5000,
        options: [
            { id: 'fixed', name: 'Fixed Deposit', return: '10% p.a.' },
            { id: 'growth', name: 'Growth Fund', return: '12-15% p.a.' }
        ]
    }
};

/**
 * Calculate investment cost including fees
 */
export function calculateInvestmentCost(typeId, amount) {
    const fee = Math.round(amount * 0.01); // 1% fee
    return {
        amount,
        fee,
        total: amount + fee
    };
}

/**
 * Validate investment
 */
export function validateInvestment(typeId, amount) {
    const type = INVESTMENT_TYPES[typeId];
    if (!type) {
        return { valid: false, error: 'Invalid investment type' };
    }
    if (amount < type.minAmount) {
        return { valid: false, error: `Minimum investment is TZS ${type.minAmount.toLocaleString()}` };
    }
    return { valid: true };
}

/**
 * Add investment to storage (legacy function for invest page)
 */
export function addInvestment(investmentData) {
    const investments = storage.get(STORAGE_KEYS.INVESTMENTS) || [];
    const investment = {
        id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...investmentData,
        status: 'Active',
        date: new Date().toISOString()
    };
    investments.push(investment);
    storage.set(STORAGE_KEYS.INVESTMENTS, investments);
    return investment;
}

/**
 * Get all investments from storage (legacy function for invest page)
 */
export function getInvestments() {
    return storage.get(STORAGE_KEYS.INVESTMENTS) || [];
}

/**
 * Create a new investment (new cashback flow)
 */
export function createInvestment(userId, amount, provider, details) {
    const investments = storage.get(STORAGE_KEYS.INVESTMENTS) || [];

    const investment = {
        id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        amount,
        provider,
        details,
        status: INVESTMENT_STATUS.ACTIVE,
        createdAt: new Date().toISOString(),
        currentValue: amount,
        returnRate: provider === INVESTMENT_PROVIDERS.UTT_AMISS
            ? (UTT_AMISS_FUNDS.find(f => f.id === details.fundId)?.returnRate || 0.08)
            : 0.10 // M-wekeza default return rate
    };

    investments.push(investment);
    storage.set(STORAGE_KEYS.INVESTMENTS, investments);

    return { success: true, investment };
}

/**
 * Get all investments for a user
 */
export function getInvestmentsByUser(userId) {
    const investments = storage.get(STORAGE_KEYS.INVESTMENTS) || [];
    return investments.filter(inv => inv.userId === userId);
}

/**
 * Get total invested amount for a user
 */
export function getTotalInvested(userId) {
    const investments = getInvestmentsByUser(userId);
    return investments
        .filter(inv => inv.status === INVESTMENT_STATUS.ACTIVE || inv.status === INVESTMENT_STATUS.COMPLETED)
        .reduce((sum, inv) => sum + inv.amount, 0);
}

/**
 * Calculate current value with returns (simple calculation for demo)
 */
export function calculateCurrentValue(investment) {
    const daysSinceInvestment = Math.floor(
        (new Date() - new Date(investment.createdAt)) / (1000 * 60 * 60 * 24)
    );
    const dailyRate = investment.returnRate / 365;
    return investment.amount * (1 + dailyRate * daysSinceInvestment);
}

/**
 * Get investment statistics for a user
 */
export function getInvestmentStats(userId) {
    const investments = getInvestmentsByUser(userId);
    const activeInvestments = investments.filter(inv => inv.status === INVESTMENT_STATUS.ACTIVE);

    const totalInvested = activeInvestments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalCurrentValue = activeInvestments.reduce((sum, inv) => sum + calculateCurrentValue(inv), 0);
    const totalReturns = totalCurrentValue - totalInvested;

    return {
        totalInvested,
        totalCurrentValue,
        totalReturns,
        investmentCount: activeInvestments.length
    };
}

