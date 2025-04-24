const express = require('express');
const router = express.Router();
const generateInvoicePDF = require('../utils'); // Ajusta si está en otro lado
const path = require('path');

router.post('/generate-invoice', (req, res) => {
  const orderData = req.body;

  const filename = `factura-${Date.now()}.pdf`;
  const filePath = path.join(__dirname, '../invoices', filename);

  generateInvoicePDF(orderData, filePath);

  res.json({ message: 'Factura generada', file: filename });
});

module.exports = router;

