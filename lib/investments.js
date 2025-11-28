import { storage, STORAGE_KEYS } from './storage';

export const INVESTMENT_TYPES = {
    UTT: {
        id: 'utt',
        name: 'UTT AMIS',
        minAmount: 10000,
        fee: 0.01,
        description: 'Unit Trust of Tanzania - Flexible mutual funds',
        options: [
            { id: 'utt-umoja', name: 'Umoja Fund', return: '12-14%', risk: 'Low' },
            { id: 'utt-wekeza-maisha', name: 'Wekeza Maisha Fund', return: '13-15%', risk: 'Low-Medium' },
            { id: 'utt-watoto', name: 'Watoto Fund', return: '14-16%', risk: 'Medium' },
            { id: 'utt-jikimu', name: 'Jikimu Fund', return: '14-16%', risk: 'Medium' },
            { id: 'utt-liquid', name: 'Liquid Fund', return: '13-15%', risk: 'Low-Medium' },
            { id: 'utt-bond', name: 'Bond Fund', return: '14-16%', risk: 'Medium' }
        ]
    },
    MWEKEZA: {
        id: 'mwekeza',
        name: 'M-Wekeza',
        minAmount: 1000,
        fee: 0.01,
        description: 'Mobile-based micro-investments',
        options: [
            { id: 'mwekeza-flex', name: 'Flexible Savings', return: 'Market Based', risk: 'Low' },
            { id: 'mwekeza-lock', name: 'Locked Savings', return: 'Market + Bonus', risk: 'Low' }
        ]
    }
};

export const calculateInvestmentCost = (typeId, amount) => {
    const type = Object.values(INVESTMENT_TYPES).find(t => t.id === typeId);
    if (!type) return null;

    const fee = Math.ceil(amount * type.fee);
    return {
        amount,
        fee,
        total: amount + fee
    };
};

export const validateInvestment = (typeId, amount) => {
    const type = Object.values(INVESTMENT_TYPES).find(t => t.id === typeId);
    if (!type) return { valid: false, error: 'Invalid investment type' };

    if (amount < type.minAmount) {
        return {
            valid: false,
            error: `Minimum investment for ${type.name} is TZS ${type.minAmount.toLocaleString()}`
        };
    }

    return { valid: true };
};

export const getInvestments = () => {
    return storage.get(STORAGE_KEYS.INVESTMENTS, []);
};

export const addInvestment = (investment) => {
    const investments = getInvestments();
    const newInvestment = {
        ...investment,
        id: Date.now().toString(),
        date: new Date().toISOString(),
        status: 'active'
    };

    investments.unshift(newInvestment);
    storage.set(STORAGE_KEYS.INVESTMENTS, investments);
    return newInvestment;
};
