const express = require('express');
const PDFDocument = require('pdfkit');
const fs = require('fs');

const router = express.Router();

router.post('/generate-invoice', async (req, res) => {
    const { order } = req.body;

    const doc = new PDFDocument();
    const filename = `invoice-${order._id}.pdf`;
    const filePath = `./invoices/${filename}`;
    
    doc.pipe(fs.createWriteStream(filePath));
    doc.text(`🖤 Recibo de Compra - Noir`, { align: 'center' });
    doc.text(`Cliente: ${order.userId}`, 100, 150);
    doc.text(`Total: $${order.total}`, 100, 180);
    
    doc.end();

    res.status(200).json({ message: 'Recibo generado', filename });
});

module.exports = router;
