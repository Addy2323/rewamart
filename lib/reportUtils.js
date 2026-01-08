import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generate a PDF report for a vendor
 * @param {string} vendorName - Name of the vendor
 * @param {Array} orders - List of orders
 * @param {string} type - 'daily' or 'weekly'
 */
export const generateVendorReport = (vendorName, orders, type = 'daily') => {
    const doc = new jsPDF();
    const now = new Date();
    const reportDate = now.toLocaleDateString();

    // Filter orders based on type
    const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        if (type === 'daily') {
            return orderDate.toDateString() === now.toDateString();
        } else if (type === 'weekly') {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(now.getDate() - 7);
            return orderDate >= oneWeekAgo;
        }
        return false;
    });

    // Header
    doc.setFontSize(20);
    doc.setTextColor(16, 185, 129); // Emerald-600
    doc.text('RewaMart Vendor Report', 14, 22);

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Vendor: ${vendorName}`, 14, 32);
    doc.text(`Report Type: ${type.charAt(0).toUpperCase() + type.slice(1)}`, 14, 38);
    doc.text(`Generated on: ${reportDate}`, 14, 44);

    // Summary Stats
    let totalSales = 0;
    let totalDelivery = 0;
    let completedCount = 0;

    const tableData = filteredOrders.map(order => {
        const vendorItems = order.items?.filter(item => item.product?.vendor === vendorName) || [];
        const orderSales = vendorItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        if (order.status === 'delivered') {
            totalSales += orderSales;
            totalDelivery += order.deliveryCost || 0;
            completedCount++;
        }

        return [
            order.id.toString().substring(0, 8).toUpperCase(),
            new Date(order.createdAt).toLocaleDateString(),
            order.userName,
            `TZS ${orderSales.toLocaleString()}`,
            `TZS ${(order.deliveryCost || 0).toLocaleString()}`,
            order.status.toUpperCase()
        ];
    });

    // Summary Box
    doc.setDrawColor(200);
    doc.setFillColor(249, 250, 251);
    doc.rect(14, 50, 182, 30, 'F');

    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text(`Total Orders: ${filteredOrders.length}`, 20, 60);
    doc.text(`Completed Orders: ${completedCount}`, 20, 68);
    doc.text(`Total Product Sales: TZS ${totalSales.toLocaleString()}`, 100, 60);
    doc.text(`Total Delivery Revenue: TZS ${totalDelivery.toLocaleString()}`, 100, 68);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Revenue: TZS ${(totalSales + totalDelivery).toLocaleString()}`, 100, 76);
    doc.setFont('helvetica', 'normal');

    // Table
    autoTable(doc, {
        startY: 85,
        head: [['Order ID', 'Date', 'Customer', 'Sales', 'Delivery', 'Status']],
        body: tableData,
        headStyles: { fillColor: [16, 185, 129] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 85 },
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }

    // Save
    doc.save(`RewaMart_${vendorName}_${type}_Report_${now.toISOString().split('T')[0]}.pdf`);
};

/**
 * Generate a PDF report for all vendors (Admin only)
 * @param {Array} orders - List of all orders
 * @param {Array} allVendors - List of all vendor users
 */
export const generateAdminVendorReport = (orders, allVendors) => {
    const doc = new jsPDF();
    const now = new Date();
    const reportDate = now.toLocaleDateString();

    // Aggregate data by vendor
    const vendorStats = {};

    // Initialize with all known vendors
    allVendors.forEach(v => {
        vendorStats[v.name] = {
            name: v.name,
            email: v.email,
            totalSales: 0,
            totalDelivery: 0,
            orderCount: 0,
            completedCount: 0
        };
    });

    // Process orders
    orders.forEach(order => {
        const processedVendorsInOrder = new Set();

        order.items?.forEach(item => {
            const vName = item.product?.vendor;
            if (vName && vendorStats[vName]) {
                const itemTotal = item.price * item.quantity;
                vendorStats[vName].totalSales += itemTotal;

                if (!processedVendorsInOrder.has(vName)) {
                    vendorStats[vName].orderCount++;
                    processedVendorsInOrder.add(vName);
                }

                if (order.status === 'delivered') {
                    vendorStats[vName].completedCount++;
                    // Note: Delivery cost is per order, so we only add it once per vendor per order
                    // This is a simplification; in a real system, delivery might be split
                    if (processedVendorsInOrder.has(vName) && processedVendorsInOrder.size === 1) {
                        vendorStats[vName].totalDelivery += order.deliveryCost || 0;
                    }
                }
            }
        });
    });

    // Convert to array and sort by total sales (descending)
    const sortedVendors = Object.values(vendorStats).sort((a, b) => b.totalSales - a.totalSales);

    // Header
    doc.setFontSize(20);
    doc.setTextColor(220, 38, 38); // Red-600 (Admin theme)
    doc.text('RewaMart Vendor Performance Report', 14, 22);

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Generated by: Platform Admin`, 14, 32);
    doc.text(`Generated on: ${reportDate}`, 14, 38);
    doc.text(`Total Vendors: ${allVendors.length}`, 14, 44);

    // Table Data
    const tableData = sortedVendors.map((v, index) => [
        index + 1,
        v.name,
        v.orderCount,
        v.completedCount,
        `TZS ${v.totalSales.toLocaleString()}`,
        `TZS ${(v.totalSales + v.totalDelivery).toLocaleString()}`
    ]);

    // Table
    autoTable(doc, {
        startY: 55,
        head: [['Rank', 'Vendor Name', 'Orders', 'Completed', 'Product Sales', 'Total Revenue']],
        body: tableData,
        headStyles: { fillColor: [220, 38, 38] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 55 },
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }

    // Save
    doc.save(`RewaMart_Vendor_Performance_Report_${now.toISOString().split('T')[0]}.pdf`);
};
