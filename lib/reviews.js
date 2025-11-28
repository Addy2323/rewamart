import { storage, STORAGE_KEYS } from './storage';

// Initialize reviews storage key
const REVIEWS_KEY = 'rewamart_reviews';

export const getProductReviews = (productId) => {
    const reviews = storage.get(REVIEWS_KEY, {});
    return reviews[productId] || [];
};

export const addReview = (productId, review) => {
    const reviews = storage.get(REVIEWS_KEY, {});
    if (!reviews[productId]) {
        reviews[productId] = [];
    }
    
    const newReview = {
        id: Date.now(),
        ...review,
        createdAt: new Date().toISOString()
    };
    
    reviews[productId].push(newReview);
    storage.set(REVIEWS_KEY, reviews);
    return newReview;
};

export const getAverageRating = (productId) => {
    const reviews = getProductReviews(productId);
    if (reviews.length === 0) return 0;
    
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
};

export const getRatingDistribution = (productId) => {
    const reviews = getProductReviews(productId);
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    reviews.forEach(review => {
        distribution[review.rating]++;
    });
    
    return distribution;
};
