import { storage, STORAGE_KEYS } from './storage';

export const INITIAL_WALLET_STATE = {
    balance: 0,
    totalEarned: 0,
    totalInvested: 0,
    cashbackTotal: 0,
    bonusTotal: 0,
    autoInvestEnabled: false,
    autoInvestPercent: 10
};

export const getWallet = () => {
    return storage.get(STORAGE_KEYS.WALLET, INITIAL_WALLET_STATE);
};

export const getTransactions = (filterType = 'all') => {
    const transactions = storage.get(STORAGE_KEYS.TRANSACTIONS, []);
    if (filterType === 'all') return transactions;
    return transactions.filter(t => t.type === filterType);
};

export const addFunds = (amount, description, type = 'deposit') => {
    const wallet = getWallet();
    const transactions = getTransactions();

    wallet.balance += amount;

    if (type === 'reward' || type === 'cashback' || type === 'bonus') {
        wallet.totalEarned += amount;
        if (type === 'cashback') wallet.cashbackTotal += amount;
        if (type === 'bonus') wallet.bonusTotal += amount;
    }

    const transaction = {
        id: Date.now(),
        type,
        amount,
        description,
        date: new Date().toISOString(),
        isDebit: false
    };

    transactions.unshift(transaction);

    storage.set(STORAGE_KEYS.WALLET, wallet);
    storage.set(STORAGE_KEYS.TRANSACTIONS, transactions);

    return { wallet, transaction };
};

export const deductFunds = (amount, description, type = 'payment') => {
    const wallet = getWallet();
    const transactions = getTransactions();

    if (wallet.balance < amount) {
        return { success: false, error: 'Insufficient funds' };
    }

    wallet.balance -= amount;

    if (type === 'investment') {
        wallet.totalInvested += amount;
    }

    const transaction = {
        id: Date.now(),
        type,
        amount,
        description,
        date: new Date().toISOString(),
        isDebit: true
    };

    transactions.unshift(transaction);

    storage.set(STORAGE_KEYS.WALLET, wallet);
    storage.set(STORAGE_KEYS.TRANSACTIONS, transactions);

    return { success: true, wallet, transaction };
};

export const toggleAutoInvest = (enabled, percent) => {
    const wallet = getWallet();
    wallet.autoInvestEnabled = enabled;
    if (percent) wallet.autoInvestPercent = percent;
    storage.set(STORAGE_KEYS.WALLET, wallet);
    return wallet;
};

export const processPurchase = (purchaseAmount, cashbackAmount) => {
    // 1. Add Cashback
    addFunds(cashbackAmount, `Cashback from purchase of TZS ${purchaseAmount.toLocaleString()}`, 'cashback');

    let investedAmount = 0;
    const wallet = getWallet(); // Refresh wallet state after adding funds

    // 2. Check Auto-Invest
    if (wallet.autoInvestEnabled) {
        // Calculate investment amount based on the cashback received
        // (User requirement: "Trigger Auto-Invest")
        // We'll invest a percentage of the cashback earned
        investedAmount = Math.floor(cashbackAmount * (wallet.autoInvestPercent / 100));

        if (investedAmount > 0) {
            deductFunds(investedAmount, `Auto-invest (${wallet.autoInvestPercent}% of cashback)`, 'investment');
        }
    }

    return {
        cashbackEarned: cashbackAmount,
        investedAmount,
        newBalance: getWallet().balance
    };
};
