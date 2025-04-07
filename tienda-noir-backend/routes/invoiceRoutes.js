const express = require('express');
const Order = require('../models/Order');
const router = express.Router();
const PDFDocument = require('pdfkit');
const fs = require('fs');

router.get('/generate-invoice/:orderId', async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId).populate('products.productId');

        if (!order) {
            return res.status(404).json({ error: 'Orden no encontrada' });
        }

        const doc = new PDFDocument();
        const filePath = `invoices/factura_${order._id}.pdf`;

        doc.pipe(fs.createWriteStream(filePath));
        doc.fontSize(16).text(`Factura Noir - Orden #${order._id}`, { align: 'center' });
        doc.moveDown();
        doc.text(`Método de pago: ${order.paymentMethod}`);
        doc.text(`Total: $${order.total}`);
        doc.moveDown();
        doc.text('Productos:', { underline: true });

        order.products.forEach(item => {
            doc.text(`${item.productId.nombre} - Cantidad: ${item.quantity} - Precio: $${item.productId.precio}`);
        });

        doc.end();

        res.json({ message: '✅ Factura generada', filePath });
    } catch (error) {
        res.status(500).json({ error: '❌ Error al generar la factura.' });
    } 
});

module.exports = router;