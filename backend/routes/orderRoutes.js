const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product'); // lo subimos arriba
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const generateInvoicePDF = require('../utils/generateInvoicePDF');
const sendInvoiceEmail = require('../utils/sendInvoiceEmail');

// 📌 Ruta para crear una orden
router.post('/', async (req, res) => {
  console.log('🛒 Datos recibidos en el backend:', req.body);

  try {
    const { userId, products, total, paymentMethod } = req.body;

    // Siempre Bogotá (por ahora)
    const city = "Bogotá";

    // Validación de productos
    for (const p of products) {
      if (!p.talla || !p.color || !p.quantity) {
        return res.status(400).json({ error: 'Todos los productos deben tener talla, color y cantidad seleccionados.' });
      }
    }

    if (!userId || !products || !total) {
      return res.status(400).json({ error: '❌ Faltan datos en la orden' });
    }

    if (paymentMethod === 'contra_entrega' && city.toLowerCase() !== 'bogotá') {
      return res.status(400).json({ error: 'El pago contra entrega solo está disponible en Bogotá.' });
    }

    // 👇 Parseo seguro de productos
    const parsedProducts = products.map(p => ({
      productId: new mongoose.Types.ObjectId(p.productId),
      quantity: p.quantity,
      talla: p.talla,
      color: p.color
    }));

    // Crear la orden
    const newOrder = new Order({
      userId,
      products: parsedProducts,
      total,
      paymentMethod,
      city,
      estado: "pendiente"
    });

    await newOrder.save();

    // 👇 Actualizar stock después de guardar la orden
    for (const p of parsedProducts) {
      await Product.findByIdAndUpdate(
        p.productId,
        { $inc: { stock: -p.quantity } },
        { new: true }
      );
    }

    res.status(201).json({ message: '✅ Orden creada', order: newOrder });

  } catch (error) {
    console.error('❌ Error en el backend:', error.message);
    res.status(500).json({ error: '❌ Error interno del servidor' });
  }
});


// 📌 Obtener las órdenes de un usuario específico
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'Falta el ID del usuario' });
    }

    const orders = await Order.find({ userId }).populate({
      path: 'products.productId',
      select: 'nombre precio' // Trae solo nombre y precio del producto
    });

    console.log('📦 Órdenes encontradas:', orders);

    const formattedOrders = orders.map(order => ({
      _id: order._id,
      createdAt: order.createdAt,
      total: order.total,
      items: order.products.map(p => ({
        nombre: p.productId?.nombre || 'Producto eliminado',
        cantidad: p.quantity,
        precio: p.productId?.precio || 0
      }))
    }));

    res.json(formattedOrders);
  } catch (err) {
    console.error('❌ Error al obtener órdenes del usuario:', err.message);
    res.status(500).json({ error: 'Error al obtener las órdenes del usuario' });
  }
});


// 📌 Endpoint debug para revisar todas las órdenes
router.get('/debug', async (req, res) => {
  const orders = await Order.find().populate('products.productId');
  res.json(orders);
});


// 📌 Confirmar pago de una orden
router.post('/confirm-payment/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log('🟢 Entrando a confirm-payment con ID:', orderId);

    const order = await Order.findById(orderId)
      .populate('products.productId')
      .populate('userId');
      console.log('✅ Orden encontrada:', order?._id);

    if (!order) return res.status(404).json({ error: 'Orden no encontrada' });

    if (order.estado === 'pagado') {
      return res.status(400).json({ error: 'La orden ya fue confirmada y pagada.' });
    }

    // ✅ Cambiar estado a pagado
    order.estado = 'pagado';
    await order.save();
    console.log('💾 Estado actualizado a pagado.');

    // 📄 Ruta donde se guardará temporalmente el PDF
    const invoicePath = path.join(__dirname, `../facturas/factura_${order._id}.pdf`);

    // Asegura que la carpeta exista
    if (!fs.existsSync(path.join(__dirname, '../facturas'))) {
      fs.mkdirSync(path.join(__dirname, '../facturas'));
    }

    console.log('🧾 Generando factura PDF...');
    // 📄 Generar factura PDF
    await generateInvoicePDF({
      _id: order._id,
      customerName: order.userId?.name || 'Cliente',
      customerEmail: order.userId?.email || 'sin-email',
      customerAddress: order.userId?.address || 'Sin dirección',
      customerCity: order.city,
      items: order.products.map(p => ({
        name: p.productId.nombre,
        size: p.talla,
        color: p.color,
        quantity: p.quantity,
        price: p.productId.precio
      })),
      subtotal: order.total,
      shipping: 0,
      total: order.total
    }, invoicePath); // 👈 ahora sí se pasa la ruta del archivo

      console.log('📧 Enviando factura por correo...');
    // ✉️ Enviar factura por correo
    await sendInvoiceEmail(order.userId.email, order.userId.name || 'Cliente', invoicePath);


    console.log('✅ Todo completado.');
    res.json({ message: '✅ Pago confirmado y factura enviada', order });
  } catch (error) {
    console.error('❌ Error al confirmar pago:', error.message);
    res.status(500).json({ error: 'Error al confirmar el pago' });
  }
});

module.exports = router;