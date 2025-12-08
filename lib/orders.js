import { getCurrentUser } from './auth';

export const ORDER_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
};

/**
 * Create a new order via API
 */
export const createOrder = async (product, paymentMethod, deliveryInfo, deliveryCost = 0) => {
    try {
        const token = localStorage.getItem('rewamart_token');
        const headers = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch('/api/orders', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                items: [{
                    productId: product.id,
                    quantity: 1,
                }],
                paymentMethod,
                deliveryAddress: deliveryInfo?.address,
                deliveryPhone: deliveryInfo?.phone,
                deliveryLocation: deliveryInfo?.location,
                deliveryDistance: deliveryInfo?.distance,
                deliveryTransport: deliveryInfo?.transport,
                deliveryCost
            }),
        });

        const result = await response.json();



        if (response.ok && result.order) {
            return { success: true, order: result.order };
        } else {
            return { success: false, error: result.error || 'Failed to create order' };
        }
    } catch (error) {
        console.error('Error creating order:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get orders for a specific user
 */
export const getOrdersByUser = async (userId) => {
    try {
        const token = localStorage.getItem('rewamart_token');
        const headers = {};

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch('/api/orders?limit=100', {
            headers
        });
        const result = await response.json();

        if (response.ok && result.orders) {
            return result.orders;
        }
        return [];
    } catch (error) {
        console.error('Error fetching user orders:', error);
        return [];
    }
};

/**
 * Get orders by vendor name
 */
export const getOrdersByVendor = async (vendorName) => {
    try {
        const token = localStorage.getItem('rewamart_token');
        const headers = {};

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch('/api/orders?limit=1000', {
            headers
        });
        const result = await response.json();

        if (response.ok && result.orders) {
            return result.orders;
        }
        return [];
    } catch (error) {
        console.error('Error fetching vendor orders:', error);
        return [];
    }
};

/**
 * Get vendor statistics
 */
export const getVendorStats = async (vendorName) => {
    try {
        const vendorOrders = await getOrdersByVendor(vendorName);
        const completedOrders = vendorOrders.filter(o => o.status === 'delivered');

        // Calculate totals from order items
        let totalSales = 0;
        let totalDeliveryRevenue = 0;

        completedOrders.forEach(order => {
            // Sum up items that belong to this vendor
            order.items?.forEach(item => {
                if (item.product?.vendor === vendorName) {
                    totalSales += item.price * item.quantity;
                }
            });
            // Add delivery cost per order (if vendor gets it)
            totalDeliveryRevenue += order.deliveryCost || 0;
        });

        return {
            totalOrders: vendorOrders.length,
            completedOrders: completedOrders.length,
            totalSales,
            totalDeliveryRevenue,
            totalRevenue: totalSales + totalDeliveryRevenue
        };
    } catch (error) {
        console.error('Error getting vendor stats:', error);
        return {
            totalOrders: 0,
            completedOrders: 0,
            totalSales: 0,
            totalDeliveryRevenue: 0,
            totalRevenue: 0
        };
    }
};

/**
 * Get all orders (admin only)
 */
export const getAllOrders = async () => {
    try {
        const token = localStorage.getItem('rewamart_token');
        const headers = {};

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch('/api/orders?limit=1000', {
            headers
        });
        const result = await response.json();

        if (response.ok && result.orders) {
            return result.orders;
        }
        return [];
    } catch (error) {
        console.error('Error fetching all orders:', error);
        return [];
    }
};

/**
 * Get order by ID
 */
export const getOrderById = async (orderId) => {
    try {
        const token = localStorage.getItem('rewamart_token');
        const headers = {};

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`/api/orders/${orderId}`, {
            headers
        });
        const result = await response.json();

        if (response.ok && result.order) {
            return result.order;
        }
        return null
    } catch (error) {
        console.error('Error fetching order:', error);
        return null;
    }
};

/**
 * Update order status (admin/vendor only)
 */
export const updateOrderStatus = async (orderId, newStatus) => {
    try {
        const token = localStorage.getItem('rewamart_token');
        const headers = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`/api/orders/${orderId}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ status: newStatus }),
        });

        const result = await response.json();

        if (response.ok && result.order) {
            return { success: true, order: result.order };
        }
        return { success: false, error: result.error || 'Failed to update order' };
    } catch (error) {
        console.error('Error updating order status:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Cancel order
 */
export const cancelOrder = async (orderId) => {
    return updateOrderStatus(orderId, ORDER_STATUS.CANCELLED);
};

/**
 * Get order statistics for a user
 */
export const getOrderStats = async (userId) => {
    try {
        const userOrders = await getOrdersByUser(userId);

        return {
            totalOrders: userOrders.length,
            pendingOrders: userOrders.filter(o => o.status === ORDER_STATUS.PENDING).length,
            processingOrders: userOrders.filter(o => o.status === ORDER_STATUS.PROCESSING).length,
            shippedOrders: userOrders.filter(o => o.status === ORDER_STATUS.SHIPPED).length,
            deliveredOrders: userOrders.filter(o => o.status === ORDER_STATUS.DELIVERED).length,
            cancelledOrders: userOrders.filter(o => o.status === ORDER_STATUS.CANCELLED).length,
            totalSpent: userOrders
                .filter(o => o.status !== ORDER_STATUS.CANCELLED)
                .reduce((sum, o) => sum + o.totalAmount, 0),
            totalCashbackEarned: userOrders
                .filter(o => o.status !== ORDER_STATUS.CANCELLED)
                .reduce((sum, o) => sum + (o.cashbackEarned || 0), 0)
        };
    } catch (error) {
        console.error('Error getting order stats:', error);
        return {
            totalOrders: 0,
            pendingOrders: 0,
            processingOrders: 0,
            shippedOrders: 0,
            deliveredOrders: 0,
            cancelledOrders: 0,
            totalSpent: 0,
            totalCashbackEarned: 0
        };
    }
};

export const getOrderStatusColor = (status) => {
    switch (status) {
        case ORDER_STATUS.PENDING:
            return 'bg-yellow-500 text-white dark:bg-yellow-600 dark:text-white';
        case ORDER_STATUS.PROCESSING:
            return 'bg-blue-500 text-white dark:bg-blue-600 dark:text-white';
        case ORDER_STATUS.SHIPPED:
            return 'bg-purple-500 text-white dark:bg-purple-600 dark:text-white';
        case ORDER_STATUS.DELIVERED:
            return 'bg-green-500 text-white dark:bg-green-600 dark:text-white';
        case ORDER_STATUS.CANCELLED:
            return 'bg-red-500 text-white dark:bg-red-600 dark:text-white';
        default:
            return 'bg-gray-500 text-white dark:bg-gray-600 dark:text-white';
    }
};

export const getOrderStatusLabel = (status) => {
    switch (status) {
        case ORDER_STATUS.PENDING:
            return 'Pending';
        case ORDER_STATUS.PROCESSING:
            return 'Processing';
        case ORDER_STATUS.SHIPPED:
            return 'Shipped';
        case ORDER_STATUS.DELIVERED:
            return 'Delivered';
        case ORDER_STATUS.CANCELLED:
            return 'Cancelled';
        default:
            return 'Unknown';
    }
};
