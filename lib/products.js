import { productsAPI } from './api';

// Backward compatibility: Get products by category
export const getProductsByCategory = async (category) => {
    try {
        const params = category && category !== 'all' ? { category } : {};
        const result = await productsAPI.getAll(params);

        if (result.success) {
            return result.data.products;
        }
        return [];
    } catch (error) {
        console.error('Error getting products:', error);
        return [];
    }
};

// Get product by ID
export const getProductById = async (id) => {
    try {
        const result = await productsAPI.getById(id);

        if (result.success) {
            return result.data.product;
        }
        return null;
    } catch (error) {
        console.error('Error getting product:', error);
        return null;
    }
};

// Get all products with cashback (same as getProductsByCategory('all'))
export const getProductsWithCashback = async () => {
    try {
        const result = await productsAPI.getAll();

        if (result.success) {
            // Map to expected format with cashback rate
            return result.data.products.map(p => ({
                ...p,
                cashbackRate: p.cashbackRate || 5,
                cashback: (p.cashbackRate || 5) / 100,
            }));
        }
        return [];
    } catch (error) {
        console.error('Error getting products:', error);
        return [];
    }
};

// Update cashback for a product (admin only)
export const updateProductCashback = async (productId, cashbackRate) => {
    try {
        const result = await productsAPI.update(productId, { cashbackRate });
        return result.success;
    } catch (error) {
        console.error('Error updating cashback:', error);
        return false;
    }
};

// Get all products (admin)
export const getAllProducts = async () => {
    return await getProductsWithCashback();
};
