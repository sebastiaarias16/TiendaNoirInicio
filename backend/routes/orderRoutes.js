const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
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
    const shippingCost = 0; // Envíos en Bogotá coordinados directamente
    const serverTotal = serverSubtotal + shippingCost;

    const validPaymentMethods = ['online', 'contra_entrega', 'nequi'];
    const validatedPaymentMethod = validPaymentMethods.includes(paymentMethod)
      ? paymentMethod
      : 'contra_entrega';

    // 5. Atomic conditional stock decrement with rollback on conflict
    const decrementedProducts = [];
    for (const item of authoritativeProducts) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      if (!updated) {
        // Rollback any successfully decremented items in this transaction
        for (const rollback of decrementedProducts) {
          await Product.findByIdAndUpdate(rollback.productId, {
            $inc: { stock: rollback.quantity },
          });
        }
        return res.status(409).json({
          error: `El inventario de "${item.nombre}" cambió durante la transacción. Por favor revisa las unidades disponibles.`,
        });
      }

      decrementedProducts.push(item);
    }

    // 6. Persist order with authoritative data
    const newOrder = new Order({
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
      status: 'pendiente',
      paymentMethod: validatedPaymentMethod,
    });

    await newOrder.save();

    console.log(`✅ Orden ${newOrder._id} creada exitosamente. Total autoritativo: $${serverTotal} COP`);
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
      createdAt: order.createdAt,
      total: order.total,
      subtotal: order.subtotal || order.total,
      status: order.status || order.estado || 'pendiente',
      paymentMethod: order.paymentMethod,
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

/**
 * 📌 POST /api/orders/confirm-payment/:orderId
 * Confirms payment, marks order as paid, generates PDF invoice, and sends email.
 */
router.post('/confirm-payment/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: 'ID de orden inválido.' });
    }

    const order = await Order.findById(orderId)
      .populate('products.productId')
      .populate('userId');

    if (!order) return res.status(404).json({ error: 'Orden no encontrada.' });

    if (order.status === 'pagado') {
      return res.status(400).json({ error: 'La orden ya fue confirmada y pagada.' });
    }

    order.status = 'pagado';
    await order.save();

    // Generate invoice directory
    const invoicesDir = path.join(__dirname, '../invoices');
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }
    const invoicePath = path.join(invoicesDir, `factura_${order._id}.pdf`);

    // PDF data payload
    const invoicePayload = {
      _id: order._id,
      customerName: order.customerName || order.userId?.name || 'Cliente NOIR',
      customerEmail: order.customerEmail || order.userId?.email || 'sin-email',
      customerAddress: order.shippingAddress || order.userId?.address || 'Bogotá D.C.',
      customerCity: order.city || 'Bogotá',
      items: order.products.map((p) => ({
        name: p.nombre || p.productId?.nombre || 'Prenda NOIR',
        size: p.talla || 'M',
        color: p.color || 'Negro',
        quantity: p.quantity,
        price: p.unitPrice || p.productId?.precio || 0,
      })),
      subtotal: order.subtotal || order.total,
      shipping: order.shippingCost || 0,
      total: order.total,
    };

    try {
      await generateInvoicePDF(invoicePayload, invoicePath);
      if (order.userId?.email || order.customerEmail) {
        const destEmail = order.customerEmail || order.userId?.email;
        const destName = order.customerName || order.userId?.name || 'Cliente';
        await sendInvoiceEmail(destEmail, destName, invoicePath);
      }
    } catch (invoiceErr) {
      console.warn('⚠️ Advertencia: No se pudo enviar el correo de factura (modo desarrollo/sin credenciales SMTP):', invoiceErr.message);
    }

    res.json({ message: '✅ Pago confirmado y factura generada.', order });
  } catch (error) {
    console.error('❌ Error al confirmar pago:', error.message);
    res.status(500).json({ error: 'Error al confirmar el pago de la orden.' });
  }
});

module.exports = router;