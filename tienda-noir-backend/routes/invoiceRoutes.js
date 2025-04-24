const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const generateInvoicePDF = require('../utils/generateInvoicePDF');
const sendInvoiceEmail = require('../utils/sendInvoiceEmail');

router.get('/generate-invoice/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('products.productId');
    if (!order) return res.status(404).json({ error: 'Orden no encontrada' });

    const user = await User.findById(order.userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const pdfPath = await generateInvoicePDF(order, user.name);
    await sendInvoiceEmail(user.email, user.name, pdfPath);

    res.json({ message: '✅ Factura generada y enviada al correo.', pdfPath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '❌ Error al generar o enviar la factura.' });
  }
});

module.exports = router;
