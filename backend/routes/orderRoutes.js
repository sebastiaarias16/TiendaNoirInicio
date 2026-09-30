const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Counter = require('../models/Counter');
const { reserveStock } = require('../services/stockService');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const generateInvoicePDF = require('../utils/generateInvoicePDF');
const sendInvoiceEmail = require('../utils/sendInvoiceEmail');

/**
 * 📌 POST /api/orders
 * Authoritative order creation with server-side price recalculation,
 * stock verification, atomic conditional stock decrement with rollback,
 * and Bogotá delivery policy enforcement.
 */
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      products,
      paymentMethod = 'contra_entrega',
      city = 'Bogotá',
      customerName,
      customerEmail,
      phone,
      shippingAddress,
    } = req.body;

    // 1. Validate customer & userId
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Identificador de usuario inválido o ausente.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado en la base de datos.' });
    }

    // 2. Validate products array
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'El carrito no contiene productos válidos.' });
    }

    // 3. Authoritatively fetch and validate all products and compute totals
    let serverSubtotal = 0;
    const authoritativeProducts = [];

    for (const item of products) {
      const pid = item.productId || item._id;
      if (!pid || !mongoose.Types.ObjectId.isValid(pid)) {
        return res.status(400).json({ error: `Identificador de producto inválido: ${pid}` });
      }

      const quantity = parseInt(item.quantity, 10);
      if (isNaN(quantity) || quantity < 1) {
        return res.status(400).json({ error: 'La cantidad de cada prenda debe ser mínimo 1.' });
      }

      const talla = (item.talla || item.selectedSize || 'M').toString().trim().toUpperCase();
      const color = (item.color || item.selectedColor || 'Negro').toString().trim();

      const dbProduct = await Product.findById(pid);
      if (!dbProduct) {
        return res.status(404).json({ error: `El producto solicitado ya no se encuentra en el catálogo oficial.` });
      }

      const availableStock = typeof dbProduct.stock === 'number' ? dbProduct.stock : 0;
      if (availableStock < quantity) {
        return res.status(400).json({
          error: `Stock insuficiente para "${dbProduct.nombre}". Disponibles en almacén: ${availableStock}. Solicitados: ${quantity}.`,
        });
      }

      const unitPrice = Number(dbProduct.precio) || 0;
      const lineTotal = unitPrice * quantity;
      serverSubtotal += lineTotal;

      authoritativeProducts.push({
        productId: dbProduct._id,
        nombre: dbProduct.nombre,
        quantity,
        talla,
        color,
        unitPrice,
        lineTotal,
      });
    }

    // 4. Delivery validation
    // 4. Delivery validation and payment method normalization
    const shippingCost = 0; // Envíos en Bogotá coordinados directamente
    const serverTotal = serverSubtotal + shippingCost;

    let normalizedMethod = 'CASH_ON_DELIVERY';
    let provider = 'NONE';
    let orderInitialStatus = 'CONFIRMED';
    let paymentInitialStatus = 'PENDING';
    let paymentExpiresAt = null;

    const rawMethod = (paymentMethod || '').toString().trim().toUpperCase();

    if (rawMethod === 'CARD' || rawMethod === 'ONLINE') {
      normalizedMethod = 'CARD';
      provider = 'WOMPI';
      orderInitialStatus = 'PENDING_PAYMENT';
      paymentExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    } else if (rawMethod === 'NEQUI') {
      normalizedMethod = 'NEQUI';
      provider = 'WOMPI';
      orderInitialStatus = 'PENDING_PAYMENT';
      paymentExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    } else if (rawMethod === 'BREB' || rawMethod === 'BRE-B' || rawMethod === 'LLAVE') {
      normalizedMethod = 'BREB';
      provider = 'MANUAL_BREB';
      orderInitialStatus = 'PENDING_PAYMENT';
      paymentExpiresAt = new Date(Date.now() + 120 * 60 * 1000); // 2 hours
    } else {
      normalizedMethod = 'CASH_ON_DELIVERY';
      provider = 'NONE';
      orderInitialStatus = 'CONFIRMED';
      paymentInitialStatus = 'PENDING';
      paymentExpiresAt = null;
    }

    // 5. Atomic conditional stock decrement with rollback on conflict
    const reservationResult = await reserveStock(authoritativeProducts);
    if (!reservationResult.success) {
      return res.status(409).json({
        error: `El inventario de "${reservationResult.failedItem.nombre}" cambió durante la transacción o es insuficiente.`,
      });
    }

    // 6. Generate human-readable, collision-free order number
    const currentYear = new Date().getFullYear();
    const counter = await Counter.findByIdAndUpdate(
      { _id: `orderNumber_${currentYear}` },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const orderNumber = `NOIR-${currentYear}-${String(counter.seq).padStart(6, '0')}`;

    // 7. Persist order with authoritative data
    const newOrder = new Order({
      orderNumber,
      userId: user._id,
      customerName: (customerName || user.name).trim(),
      customerEmail: (customerEmail || user.email).trim(),
      phone: (phone || user.phone || '').trim(),
      shippingAddress: (shippingAddress || user.address || 'Bogotá D.C.').trim(),
      city: city || 'Bogotá',
      products: authoritativeProducts,
      subtotal: serverSubtotal,
      shippingCost,
      total: serverTotal,
      paymentMethod: normalizedMethod,
      paymentProvider: provider,
      paymentStatus: paymentInitialStatus,
      orderStatus: orderInitialStatus,
      paymentAmount: serverTotal,
      paymentCurrency: 'COP',
      paymentExpiresAt,
      stockReserved: true,
      stockReleased: false,
      paymentAuditTrail: [
        {
          eventType: 'ORDER_CREATED',
          provider,
          reference: orderNumber,
          oldStatus: null,
          newStatus: paymentInitialStatus,
          timestamp: new Date(),
          details: { method: normalizedMethod, total: serverTotal },
        },
      ],
    });

    await newOrder.save();

    console.log(`✅ Orden ${orderNumber} (${newOrder._id}) creada exitosamente. Total autoritativo: $${serverTotal} COP`);
    return res.status(201).json({
      message: '✅ Orden creada exitosamente',
      order: newOrder,
    });
  } catch (error) {
    console.error('❌ Error en creación de orden:', error.message);
    return res.status(500).json({ error: 'Error interno del servidor al procesar la orden.' });
  }
});

/**
 * 📌 GET /api/orders/user/:userId
 * Retrieves orders for a specific authenticated user.
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Falta o es inválido el ID del usuario.' });
    }

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'products.productId',
        select: 'nombre precio imagen',
      });

    const formattedOrders = orders.map((order) => ({
      _id: order._id,
      orderNumber: order.orderNumber || `NOIR-${order._id.slice(-6).toUpperCase()}`,
      createdAt: order.createdAt,
      total: order.total,
      subtotal: order.subtotal || order.total,
      status: order.status || order.estado || 'pendiente',
      paymentMethod: order.paymentMethod,
      paymentProvider: order.paymentProvider,
      paymentStatus: order.paymentStatus || 'PENDING',
      orderStatus: order.orderStatus || 'PENDING_PAYMENT',
      paymentReference: order.paymentReference,
      paidAt: order.paidAt,
      city: order.city,
      items: order.products.map((p) => ({
        productId: p.productId?._id || p.productId,
        nombre: p.nombre || p.productId?.nombre || 'Prenda NOIR',
        cantidad: p.quantity,
        talla: p.talla || 'M',
        color: p.color || 'Negro',
        precio: p.unitPrice || p.productId?.precio || 0,
      })),
    }));

    res.json(formattedOrders);
  } catch (err) {
    console.error('❌ Error al obtener órdenes del usuario:', err.message);
    res.status(500).json({ error: 'Error al obtener las órdenes del usuario.' });
  }
});

/**
 * 📌 GET /api/orders/:id
 * Retrieves a single order by ID for details or invoice generation.
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Orden no encontrada.' });
    }

    const order = await Order.findById(id).populate('products.productId');
    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada.' });
    }

    res.json(order);
  } catch (err) {
    console.error('❌ Error al obtener orden por ID:', err.message);
    res.status(500).json({ error: 'Error al consultar la orden.' });
  }
});

module.exports = router;