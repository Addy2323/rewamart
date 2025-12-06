import { investmentsAPI } from './api';

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
 * Get all investments for a user
 */
export async function getInvestmentsByUser(userId) {
    try {
        const result = await investmentsAPI.getAll();
        if (result.success) {
            return result.data.investments;
        }
        return [];
    } catch (error) {
        console.error('Error fetching investments:', error);
        return [];
    }
}

/**
 * Create a new investment
 */
export async function createInvestment(userId, amount, provider, details) {
    try {
        // Map provider/details to planId if possible, or update API to accept provider/details
        // For now, assuming planId 1 for demo if not specified
        const planId = details.fundId === 'umoja' ? 1 : 1;

        const result = await investmentsAPI.create(planId, amount);
        return result;
    } catch (error) {
        console.error('Error creating investment:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get investment statistics for a user
 */
export async function getInvestmentStats(userId) {
    try {
        const investments = await getInvestmentsByUser(userId);

        // Filter active investments if status is available, otherwise assume all returned are relevant
        // The API returns calculated currentValue

        const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
        const totalCurrentValue = investments.reduce((sum, inv) => sum + (inv.currentValue || inv.amount), 0);
        const totalReturns = totalCurrentValue - totalInvested;

        return {
            totalInvested,
            totalCurrentValue,
            totalReturns,
            investmentCount: investments.length
        };
    } catch (error) {
        console.error('Error getting investment stats:', error);
        return { totalInvested: 0, totalCurrentValue: 0, totalReturns: 0, investmentCount: 0 };
    }
}

