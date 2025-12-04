import { storage, STORAGE_KEYS } from './storage';
import { getCurrentUser } from './auth';

export const ORDER_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
};

export const createOrder = (product, paymentMethod, deliveryInfo) => {
    const user = getCurrentUser();
    if (!user) {
        return { success: false, error: 'User not logged in' };
    }

    const orders = storage.get(STORAGE_KEYS.ORDERS, []);

    const newOrder = {
        id: 'order_' + Date.now(),
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        product: {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            vendor: product.vendor,
            cashbackRate: product.cashbackRate || 0
        },
        paymentMethod,
        deliveryInfo: {
            address: deliveryInfo?.address || '',
            phone: deliveryInfo?.phone || '',
            location: deliveryInfo?.location || null,
            distance: deliveryInfo?.distance || 0,
            transport: deliveryInfo?.transport || 'bolt'
        },
        status: ORDER_STATUS.PENDING,
        totalAmount: product.price,
        cashbackEarned: Math.floor(product.price * ((product.cashbackRate || 0) / 100)),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days from now
    };

    orders.unshift(newOrder);
    storage.set(STORAGE_KEYS.ORDERS, orders);

    return { success: true, order: newOrder };
};

export const getOrdersByUser = (userId) => {
    const orders = storage.get(STORAGE_KEYS.ORDERS, []);
    return orders.filter(order => order.userId === userId);
};

export const getAllOrders = () => {
    return storage.get(STORAGE_KEYS.ORDERS, []);
};

export const getOrderById = (orderId) => {
    const orders = storage.get(STORAGE_KEYS.ORDERS, []);
    return orders.find(order => order.id === orderId);
};

export const updateOrderStatus = (orderId, newStatus) => {
    const orders = storage.get(STORAGE_KEYS.ORDERS, []);
    const orderIndex = orders.findIndex(order => order.id === orderId);

    if (orderIndex === -1) {
        return { success: false, error: 'Order not found' };
    }

    orders[orderIndex].status = newStatus;
    orders[orderIndex].updatedAt = new Date().toISOString();

    storage.set(STORAGE_KEYS.ORDERS, orders);

    return { success: true, order: orders[orderIndex] };
};

export const cancelOrder = (orderId) => {
    return updateOrderStatus(orderId, ORDER_STATUS.CANCELLED);
};

export const getOrderStats = (userId) => {
    const userOrders = getOrdersByUser(userId);

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
            .reduce((sum, o) => sum + o.cashbackEarned, 0)
    };
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
