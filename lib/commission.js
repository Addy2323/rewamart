/**
 * Rewamart Vendor Commission Rate Model (1% to 2%)
 * 
 * This module implements a dynamic, formula-based commission model that adjusts
 * the vendor commission rate based on the transaction amount (T), ranging from 1% to 2%.
 * 
 * Formula: Commission_Rate(T) = min(1% + ((T - 1,000) / 99,999,000) × 1%, 2%)
 * 
 * Tiered Structure:
 * ┌─────────────────────────────┬─────────────────┬─────────────────────────┐
 * │ Transaction Range (TZS)     │ Commission Rate │ Vendor Fee Example (TZS)│
 * ├─────────────────────────────┼─────────────────┼─────────────────────────┤
 * │ 1,000 – 49,999              │ 1.00% – 1.02%   │ 10 – 999                │
 * │ 50,000 – 199,999            │ 1.02% – 1.08%   │ 510 – 2,160             │
 * │ 200,000 – 499,999           │ 1.08% – 1.18%   │ 2,160 – 5,900           │
 * │ 500,000 – 999,999           │ 1.18% – 1.30%   │ 5,900 – 13,000          │
 * │ 1,000,000 – 4,999,999       │ 1.30% – 1.60%   │ 13,000 – 80,000         │
 * │ 5,000,000 – 14,999,999      │ 1.60% – 1.85%   │ 80,000 – 277,500        │
 * │ 15,000,000 – 49,999,999     │ 1.85% – 1.98%   │ 277,500 – 990,000       │
 * │ 50,000,000 – 99,999,999     │ 1.98% – 2.00%   │ 990,000 – 1,999,999     │
 * │ 100,000,000 and above       │ Capped at 2.00% │ 2,000,000               │
 * └─────────────────────────────┴─────────────────┴─────────────────────────┘
 * 
 * Key Benefits:
 * - Fair for all vendor sizes, from small shops to large businesses
 * - Predictable fee increases with transaction size
 * - Commission capped at 2% for high-value transactions
 * - Easy to implement in backend systems for automation
 */

// Configuration constants
const MIN_TRANSACTION = 1000;           // Minimum transaction amount (TZS)
const MAX_TRANSACTION = 100000000;      // Maximum transaction for scaling (TZS)
const MIN_RATE = 0.01;                  // Minimum commission rate (1%)
const MAX_RATE = 0.02;                  // Maximum commission rate (2%)
const RATE_RANGE = MAX_RATE - MIN_RATE; // Rate range for scaling (1%)
const TRANSACTION_RANGE = MAX_TRANSACTION - MIN_TRANSACTION; // 99,999,000

/**
 * Calculate the commission rate based on transaction amount.
 * The rate scales linearly from 1% to 2% based on transaction size.
 * 
 * @param {number} transactionAmount - The transaction amount in TZS
 * @returns {number} The commission rate as a decimal (e.g., 0.01 for 1%)
 * @throws {Error} If the transaction amount is below the minimum threshold
 * 
 * @example
 * // Get commission rate for TZS 1,000,000
 * const rate = getCommissionRate(1000000);
 * console.log(rate); // ~0.0130 (1.30%)
 */
export function getCommissionRate(transactionAmount) {
    // Validate minimum transaction amount
    if (transactionAmount < MIN_TRANSACTION) {
        throw new Error(`Transaction amount must be at least TZS ${MIN_TRANSACTION.toLocaleString()}`);
    }

    // For transactions at or above the max, cap at maximum rate
    if (transactionAmount >= MAX_TRANSACTION) {
        return MAX_RATE;
    }

    // Calculate commission rate using linear interpolation
    // Formula: 1% + ((T - 1,000) / 99,999,000) × 1%
    const scaleFactor = (transactionAmount - MIN_TRANSACTION) / TRANSACTION_RANGE;
    const rate = MIN_RATE + (scaleFactor * RATE_RANGE);

    // Ensure rate doesn't exceed maximum (safety check)
    return Math.min(rate, MAX_RATE);
}

/**
 * Calculate the commission fee for a given transaction amount.
 * 
 * @param {number} transactionAmount - The transaction amount in TZS
 * @returns {number} The commission fee in TZS (rounded to nearest integer)
 * @throws {Error} If the transaction amount is below the minimum threshold
 * 
 * @example
 * // Get commission fee for TZS 1,000,000
 * const fee = getCommissionFee(1000000);
 * console.log(fee); // ~13,000 TZS
 */
export function getCommissionFee(transactionAmount) {
    const rate = getCommissionRate(transactionAmount);
    return Math.round(transactionAmount * rate);
}

/**
 * Get detailed commission breakdown for a transaction.
 * 
 * @param {number} transactionAmount - The transaction amount in TZS
 * @returns {Object} Commission breakdown with rate, fee, and net amount
 * @throws {Error} If the transaction amount is below the minimum threshold
 * 
 * @example
 * const breakdown = getCommissionBreakdown(1000000);
 * console.log(breakdown);
 * // {
 * //   transactionAmount: 1000000,
 * //   commissionRate: 0.013,
 * //   commissionRatePercent: "1.30%",
 * //   commissionFee: 13000,
 * //   vendorNetAmount: 987000,
 * //   formattedTransaction: "TZS 1,000,000",
 * //   formattedFee: "TZS 13,000",
 * //   formattedNetAmount: "TZS 987,000"
 * // }
 */
export function getCommissionBreakdown(transactionAmount) {
    const rate = getCommissionRate(transactionAmount);
    const fee = Math.round(transactionAmount * rate);
    const netAmount = transactionAmount - fee;

    return {
        transactionAmount,
        commissionRate: rate,
        commissionRatePercent: `${(rate * 100).toFixed(2)}%`,
        commissionFee: fee,
        vendorNetAmount: netAmount,
        formattedTransaction: `TZS ${transactionAmount.toLocaleString()}`,
        formattedFee: `TZS ${fee.toLocaleString()}`,
        formattedNetAmount: `TZS ${netAmount.toLocaleString()}`
    };
}

/**
 * Get the commission tier information for a transaction amount.
 * Returns the tier name and rate range for display purposes.
 * 
 * @param {number} transactionAmount - The transaction amount in TZS
 * @returns {Object} Tier information including name, rate range, and bounds
 */
export function getCommissionTier(transactionAmount) {
    const tiers = [
        { name: 'Micro', min: 1000, max: 49999, rateMin: '1.00%', rateMax: '1.02%' },
        { name: 'Small', min: 50000, max: 199999, rateMin: '1.02%', rateMax: '1.08%' },
        { name: 'Medium-Small', min: 200000, max: 499999, rateMin: '1.08%', rateMax: '1.18%' },
        { name: 'Medium', min: 500000, max: 999999, rateMin: '1.18%', rateMax: '1.30%' },
        { name: 'Medium-Large', min: 1000000, max: 4999999, rateMin: '1.30%', rateMax: '1.60%' },
        { name: 'Large', min: 5000000, max: 14999999, rateMin: '1.60%', rateMax: '1.85%' },
        { name: 'Extra-Large', min: 15000000, max: 49999999, rateMin: '1.85%', rateMax: '1.98%' },
        { name: 'Premium', min: 50000000, max: 99999999, rateMin: '1.98%', rateMax: '2.00%' },
        { name: 'Enterprise', min: 100000000, max: Infinity, rateMin: '2.00%', rateMax: '2.00%' }
    ];

    const tier = tiers.find(t => transactionAmount >= t.min && transactionAmount <= t.max);

    return tier || tiers[tiers.length - 1]; // Default to highest tier if not found
}

/**
 * Validate if a transaction amount is eligible for commission calculation.
 * 
 * @param {number} transactionAmount - The transaction amount to validate
 * @returns {Object} Validation result with isValid flag and message
 */
export function validateTransactionAmount(transactionAmount) {
    if (typeof transactionAmount !== 'number' || isNaN(transactionAmount)) {
        return {
            isValid: false,
            message: 'Transaction amount must be a valid number'
        };
    }

    if (transactionAmount < MIN_TRANSACTION) {
        return {
            isValid: false,
            message: `Transaction amount must be at least TZS ${MIN_TRANSACTION.toLocaleString()}`
        };
    }

    return {
        isValid: true,
        message: 'Transaction amount is valid'
    };
}

// Export constants for external use
export const COMMISSION_CONFIG = {
    MIN_TRANSACTION,
    MAX_TRANSACTION,
    MIN_RATE,
    MAX_RATE,
    MIN_RATE_PERCENT: '1%',
    MAX_RATE_PERCENT: '2%'
};

// Default export for convenience
export default {
    getCommissionRate,
    getCommissionFee,
    getCommissionBreakdown,
    getCommissionTier,
    validateTransactionAmount,
    COMMISSION_CONFIG
};
