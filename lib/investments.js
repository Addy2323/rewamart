import { storage, STORAGE_KEYS } from './storage';

export const INVESTMENT_TYPES = {
    UTT: {
        id: 'utt',
        name: 'UTT AMIS',
        minAmount: 10000,
        fee: 0.01,
        description: 'Unit Trust of Tanzania - Flexible mutual funds',
        options: [
            { id: 'utt-liquid', name: 'Liquid Fund', return: '12-14%', risk: 'Low' },
            { id: 'utt-bond', name: 'Bond Fund', return: '13-15%', risk: 'Low-Medium' },
            { id: 'utt-wealth', name: 'Wealth Fund', return: '14-16%', risk: 'Medium' },
            { id: 'utt-children', name: 'Watoto Fund', return: '14-16%', risk: 'Medium' },
            { id: 'utt-jisikie', name: 'Jisikie Fund', return: '13-15%', risk: 'Low-Medium' }
        ]
    },
    BONDS: {
        id: 'bonds',
        name: 'Government Bonds',
        minAmount: 1000000,
        fee: 0.01,
        description: 'Long-term government securities',
        options: [
            { id: 'bond-2y', name: '2-Year Treasury Bond', return: '12.5%', duration: '2 Years' },
            { id: 'bond-5y', name: '5-Year Treasury Bond', return: '14.2%', duration: '5 Years' },
            { id: 'bond-10y', name: '10-Year Treasury Bond', return: '16.8%', duration: '10 Years' },
            { id: 'bond-20y', name: '20-Year Treasury Bond', return: '18.2%', duration: '20 Years' }
        ]
    },
    TBILLS: {
        id: 'tbills',
        name: 'Treasury Bills',
        minAmount: 100000,
        fee: 0.01,
        description: 'Short-term government securities',
        options: [
            { id: 'tbill-35d', name: '35-Day Treasury Bill', return: '8.5%', duration: '35 Days' },
            { id: 'tbill-91d', name: '91-Day Treasury Bill', return: '9.2%', duration: '91 Days' },
            { id: 'tbill-182d', name: '182-Day Treasury Bill', return: '10.1%', duration: '182 Days' },
            { id: 'tbill-364d', name: '364-Day Treasury Bill', return: '11.8%', duration: '364 Days' }
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
    },
    STOCKS: {
        id: 'stocks',
        name: 'DSE Stocks',
        minAmount: 5000, // Approx for min shares
        fee: 0.01,
        description: 'Dar es Salaam Stock Exchange Shares',
        options: [
            { id: 'stock-crdb', name: 'CRDB Bank', price: 550, symbol: 'CRDB' },
            { id: 'stock-nmb', name: 'NMB Bank', price: 4800, symbol: 'NMB' },
            { id: 'stock-tbl', name: 'Tanzania Breweries', price: 10900, symbol: 'TBL' },
            { id: 'stock-twiga', name: 'Twiga Cement', price: 4200, symbol: 'TWIGA' },
            { id: 'stock-vodacom', name: 'Vodacom Tanzania', price: 770, symbol: 'VODA' }
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
