import { storage, STORAGE_KEYS } from './storage';
import { addFunds } from './wallet';

export const generateReferralCode = (name) => {
    // Tanzania format: Full first name (or first 4 letters) + 3-4 random digits
    const prefix = name.toUpperCase().substring(0, Math.min(4, name.length));
    const digits = Math.floor(100 + Math.random() * 9000); // 3-4 digits
    return `${prefix}${digits}`;
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

// Register referral code with user data for lookup
export const registerReferralCode = (code, userData) => {
    const codeMap = storage.get(STORAGE_KEYS.REFERRAL_CODE_TO_USER, {});
    codeMap[code] = {
        name: userData.name,
        id: userData.id || Date.now(),
        registeredAt: new Date().toISOString()
    };
    storage.set(STORAGE_KEYS.REFERRAL_CODE_TO_USER, codeMap);
};

// Get referrer info by code
export const getReferrerByCode = (code) => {
    const codeMap = storage.get(STORAGE_KEYS.REFERRAL_CODE_TO_USER, {});
    return codeMap[code] || null;
};

// Process complete referral purchase (invitee bonus + referrer commission)
export const processReferralPurchase = (purchaseAmount, appliedCode) => {
    const inviteeBonus = Math.floor(purchaseAmount * 0.10); // 10% bonus for invitee
    const referrerCommission = Math.floor(purchaseAmount * 0.05); // 5% commission for referrer

    // Add bonus to invitee's wallet
    addFunds(inviteeBonus, `Referral bonus (10% of TZS ${purchaseAmount.toLocaleString()})`, 'bonus');

    // Get referrer and update their stats
    const referrer = getReferrerByCode(appliedCode);
    if (referrer) {
        // Update referrer's referral data
        const referrerData = getReferralData();
        referrerData.earnings += referrerCommission;
        referrerData.totalReferrals += 1;
        referrerData.history.unshift({
            id: Date.now(),
            amount: referrerCommission,
            date: new Date().toISOString(),
            type: 'commission',
            inviteeName: 'New User'
        });
        storage.set(STORAGE_KEYS.REFERRALS, referrerData);

        // Note: In a real app, we'd add to referrer's wallet via API
        // For demo, the commission is tracked in referral data
    }

    return {
        inviteeBonus,
        referrerCommission,
        referrerName: referrer?.name || 'Unknown'
    };
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
