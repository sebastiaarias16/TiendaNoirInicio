const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// 📌 Ruta para crear una orden
router.post('/', async (req, res) => {
  console.log('🛒 Datos recibidos en el backend:', req.body); // 👈 Muestra lo que recibe el backend

  try {
    const { userId, products, total, paymentMethod, city } = req.body;

    if (!userId || !products || !total) {
      return res.status(400).json({ error: '❌ Faltan datos en la orden' });
    }

    if (paymentMethod === 'contra_entrega' && city.toLowerCase() !== 'bogotá') {
      return res.status(400).json({ error: 'El pago contra entrega solo está disponible en Bogotá.' });
  }

    const newOrder = new Order({
      userId,
      products,
      total,
      paymentMethod, 
      city,
    });

    await newOrder.save();
    res.status(201).json({ message: '✅ Orden creada', order: newOrder });
  } catch (error) {
    console.error('❌ Error en el backend:', error.message);
    res.status(500).json({ error: '❌ Error interno del servidor' });
  }
});

module.exports = router;