import { storage, STORAGE_KEYS } from './storage';

export const generateReferralCode = (name) => {
    const prefix = name.substring(0, 3).toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${random}`;
};

export const getReferralData = () => {
    const defaultData = {
        code: null,
        earnings: 0,
        totalReferrals: 0,
        history: []
    };
    return storage.get(STORAGE_KEYS.REFERRALS, defaultData);
};

export const initializeReferralCode = (userName) => {
    const data = getReferralData();
    if (!data.code) {
        data.code = generateReferralCode(userName || 'USER');
        storage.set(STORAGE_KEYS.REFERRALS, data);
    }
    return data.code;
};

export const processReferralReward = (amount) => {
    const data = getReferralData();
    data.earnings += amount;
    data.totalReferrals += 1;
    data.history.unshift({
        id: Date.now(),
        amount,
        date: new Date().toISOString(),
        type: 'commission'
    });
    storage.set(STORAGE_KEYS.REFERRALS, data);
    return data;
};

export const validateReferralCode = (code) => {
    // In a real app, this would check against a backend database
    // For demo, we accept any code that looks like AAA1234
    const regex = /^[A-Z]{3}\d{4}$/;
    return regex.test(code);
};
