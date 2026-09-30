// routes/invoiceRoutes.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const path = require('path');
const generateInvoicePDF = require('../utils/generateInvoicePDF');
const sendInvoiceEmail = require('../utils/sendInvoiceEmail');

router.get('/generate-invoice/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('products.productId');
    if (!order) return res.status(404).json({ error: '❌ Orden no encontrada' });

    const user = await User.findById(order.userId);
    if (!user) return res.status(404).json({ error: '❌ Usuario no encontrado' });

    // 🔄 Datos para la factura
    const orderData = {
      orderId: order._id,
      orderNumber: order.orderNumber,
      customerName: order.customerName || user.name,
      customerEmail: order.customerEmail || user.email,
      customerAddress: order.shippingAddress || order.address || user.address || "No especificada",
      customerCity: order.city || "Bogotá",
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      paidAt: order.paidAt,
      items: order.products.map(p => ({
        name: p.nombre || p.productId?.nombre || "Prenda NOIR",
        size: p.talla || "-",
        color: p.color || "-",
        quantity: p.quantity,
        price: p.unitPrice || p.productId?.precio || 0
      })),
      subtotal: order.subtotal || order.total,
      shipping: order.shippingCost || 0,
      total: order.total
    };

    // 📂 Ruta del PDF
    const pdfPath = path.join(__dirname, `../invoices/factura-${order._id}.pdf`);

    // 📝 Generar PDF y enviar correo
    await generateInvoicePDF(orderData, pdfPath);
    await sendInvoiceEmail(user.email, user.name, pdfPath);

    res.json({ 
      message: '✅ Factura generada y enviada al correo.',
      pdfPath: `/invoices/factura-${order._id}.pdf`
    });

  } catch (error) {
    console.error("❌ Error en generate-invoice:", error);
    res.status(500).json({ error: '❌ Error al generar o enviar la factura.' });
  }
});

module.exports = router;
