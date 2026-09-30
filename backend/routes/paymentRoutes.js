const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const Order = require('../models/Order');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getWompiConfig,
  generateIntegritySignature,
  verifyWebhookChecksum,
  fetchTransactionFromWompi,
  buildWebCheckoutUrl,
} = require('../services/wompiService');
const { releaseOrderStock } = require('../services/stockService');
const generateInvoicePDF = require('../utils/generateInvoicePDF');
const sendInvoiceEmail = require('../utils/sendInvoiceEmail');

/**
 * Helper to trigger invoice generation and dispatch confirmation email
 * Only called when payment is genuinely and authoritatively APPROVED.
 */
async function processApprovedOrderSideEffects(order) {
  try {
    const invoicesDir = path.join(__dirname, '../invoices');
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }
    const invoicePath = path.join(invoicesDir, `factura-${order._id}.pdf`);

    const invoicePayload = {
      orderId: order._id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerAddress: order.shippingAddress || 'Bogotá D.C.',
      customerCity: order.city || 'Bogotá',
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      paidAt: order.paidAt,
      items: order.products.map((p) => ({
        name: p.nombre || 'Prenda NOIR',
        size: p.talla || 'M',
        color: p.color || 'Negro',
        quantity: p.quantity,
        price: p.unitPrice || 0,
      })),
      subtotal: order.subtotal || order.total,
      shipping: order.shippingCost || 0,
      total: order.total,
    };

    await generateInvoicePDF(invoicePayload, invoicePath);

    if (order.customerEmail) {
      await sendInvoiceEmail(
        order.customerEmail,
        order.customerName || 'Cliente NOIR',
        invoicePath
      );
    }
  } catch (err) {
    console.warn('⚠️ Advertencia: No se pudo generar/enviar factura en modo desarrollo:', err.message);
  }
}

/**
 * 📌 POST /api/payments/wompi/create
 * Prepares a Wompi transaction for an existing valid order.
 * Generates unique payment reference and integrity signature.
 * NEVER accepts amount, price, or stock from the client.
 */
router.post('/wompi/create', async (req, res) => {
  try {
    const { orderId, userId } = req.body;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: 'Identificador de orden inválido.' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada en el sistema.' });
    }

    // Verify user ownership if authenticated
    if (userId && order.userId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'No autorizado para procesar esta orden.' });
    }

    // Check if already paid
    if (order.paymentStatus === 'APPROVED' || order.orderStatus === 'CONFIRMED') {
      return res.status(400).json({
        error: 'Esta orden ya fue confirmada y pagada previamente.',
        alreadyPaid: true,
        orderNumber: order.orderNumber,
      });
    }

    // Check if stock was already released, order cancelled, or payment expired
    if (order.stockReleased || order.orderStatus === 'CANCELLED' || order.paymentStatus === 'EXPIRED') {
      return res.status(409).json({
        error: 'El inventario de esta orden fue liberado tras un intento fallido o expirado. Por favor genera una nueva orden desde el carrito.',
        stockReleased: true,
      });
    }

    // Check if expired
    if (order.paymentExpiresAt && new Date() > new Date(order.paymentExpiresAt)) {
      await releaseOrderStock(order, 'EXPIRED_ON_PAYMENT_INIT');
      order.paymentStatus = 'EXPIRED';
      order.orderStatus = 'CANCELLED';
      await order.save();
      return res.status(409).json({
        error: 'El inventario de esta orden fue liberado tras un intento fallido o expirado. Por favor genera una nueva orden desde el carrito.',
        expired: true,
      });
    }

    const config = getWompiConfig();
    const amountInCents = Math.round(Number(order.total) * 100);
    const currency = 'COP';

    // Generate unique payment reference: NOIR-YYYY-XXXXXX-TIMESTAMP
    const uniqueRef = `${order.orderNumber || `NOIR-${order._id.slice(-6).toUpperCase()}`}-${Date.now()}`;
    const integritySignature = generateIntegritySignature(uniqueRef, amountInCents, currency);

    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendBase}/payment/status?reference=${uniqueRef}`;

    // Update order with reference and provider metadata
    order.paymentReference = uniqueRef;
    order.paymentProvider = 'WOMPI';
    order.paymentAmount = order.total;
    order.paymentCurrency = currency;
    order.paymentCreatedAt = new Date();
    order.paymentAuditTrail.push({
      eventType: 'WOMPI_TRANSACTION_PREPARED',
      provider: 'WOMPI',
      reference: uniqueRef,
      oldStatus: order.paymentStatus,
      newStatus: 'PENDING',
      timestamp: new Date(),
      details: { amountInCents, currency },
    });

    await order.save();

    const webCheckoutUrl = buildWebCheckoutUrl({
      publicKey: config.publicKey,
      reference: uniqueRef,
      amountInCents,
      currency,
      integritySignature,
      redirectUrl,
    });

    console.log(`💳 Transacción Wompi preparada para orden ${order.orderNumber}. Ref: ${uniqueRef}`);

    // Return ONLY safe public parameters to browser
    return res.json({
      publicKey: config.publicKey,
      currency,
      amountInCents,
      reference: uniqueRef,
      signature: integritySignature,
      redirectUrl,
      webCheckoutUrl,
      orderNumber: order.orderNumber,
      orderId: order._id,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      customerPhone: order.phone,
    });
  } catch (error) {
    console.error('❌ Error creando pago Wompi:', error.message);
    return res.status(500).json({ error: 'Error interno al preparar la pasarela de pago.' });
  }
});

/**
 * 📌 POST /api/payments/wompi/webhook
 * Handles transaction.updated events sent by Wompi.
 * Enforces checksum signature verification, idempotency, and server-side verification.
 */
router.post('/wompi/webhook', async (req, res) => {
  try {
    const eventBody = req.body;

    if (!eventBody || !eventBody.event || !eventBody.data || !eventBody.data.transaction) {
      return res.status(400).json({ error: 'Estructura del webhook no reconocida.' });
    }

    // 1. Verify webhook signature / checksum
    const checksumResult = verifyWebhookChecksum(eventBody);
    if (!checksumResult.valid) {
      console.warn('🚨 Webhook rechazado por firma inválida:', checksumResult.error);
      return res.status(401).json({ error: 'Firma de autenticidad del webhook inválida.' });
    }

    const tx = eventBody.data.transaction;
    const {
      id: transactionId,
      status: transactionStatus,
      reference,
      amount_in_cents: amountInCents,
      currency,
      payment_method_type: methodType,
      status_message: statusMessage,
    } = tx;

    console.log(`🔔 Webhook Wompi recibido: Evento=${eventBody.event}, TxId=${transactionId}, Ref=${reference}, Status=${transactionStatus}`);

    // 2. Locate the corresponding NOIR order
    const order = await Order.findOne({ paymentReference: reference });
    if (!order) {
      console.warn(`⚠️ Orden NOIR no encontrada para la referencia ${reference}`);
      return res.status(404).json({ error: 'Orden no encontrada para la referencia provista.' });
    }

    // 3. Verify transaction authoritatively against Wompi API if private key is present
    const verifiedTx = await fetchTransactionFromWompi(transactionId);
    const authoritativeStatus = verifiedTx ? verifiedTx.status : transactionStatus;
    const authoritativeAmount = verifiedTx ? verifiedTx.amount_in_cents : amountInCents;

    // 4. Validate amount and currency
    const expectedAmountInCents = Math.round(Number(order.total) * 100);
    if (authoritativeAmount !== expectedAmountInCents || currency !== 'COP') {
      console.error(`🚨 Discrepancia de monto o moneda: Esperado ${expectedAmountInCents} COP, Recibido ${authoritativeAmount} ${currency}`);
      order.paymentAuditTrail.push({
        eventType: 'WEBHOOK_AMOUNT_MISMATCH_REJECTED',
        provider: 'WOMPI',
        transactionId,
        reference,
        timestamp: new Date(),
        details: { expected: expectedAmountInCents, received: authoritativeAmount, currency },
      });
      await order.save();
      return res.status(400).json({ error: 'Discrepancia en monto o moneda de la transacción.' });
    }

    // 5. Idempotency Check: if already approved, do not perform duplicate side effects
    if (order.paymentStatus === 'APPROVED') {
      console.log(`ℹ️ Orden ${order.orderNumber} ya se encuentra APPROVED. Respuesta idempotente enviada.`);
      return res.status(200).json({ message: 'Evento recibido e ignorado por idempotencia (orden ya aprobada).' });
    }

    // 6. State Machine Transitions
    const oldPaymentStatus = order.paymentStatus;
    const oldOrderStatus = order.orderStatus;

    if (authoritativeStatus === 'APPROVED') {
      order.paymentStatus = 'APPROVED';
      order.orderStatus = 'CONFIRMED';
      order.paymentTransactionId = transactionId;
      order.paymentMethodType = methodType || order.paymentMethod;
      order.paidAt = new Date();
      order.paymentUpdatedAt = new Date();
      order.paymentStatusMessage = 'Transacción aprobada por Wompi.';

      order.paymentAuditTrail.push({
        eventType: 'PAYMENT_APPROVED',
        provider: 'WOMPI',
        transactionId,
        reference,
        oldStatus: oldPaymentStatus,
        newStatus: 'APPROVED',
        timestamp: new Date(),
        details: { methodType, amountInCents },
      });

      await order.save();

      // Side effects: PDF invoice and email
      await processApprovedOrderSideEffects(order);
      console.log(`✅ Orden ${order.orderNumber} confirmada y pagada exitosamente vía Wompi.`);
    } else if (
      authoritativeStatus === 'DECLINED' ||
      authoritativeStatus === 'ERROR' ||
      authoritativeStatus === 'VOIDED'
    ) {
      order.paymentStatus = authoritativeStatus === 'DECLINED' ? 'DECLINED' : 'FAILED';
      order.paymentTransactionId = transactionId;
      order.paymentStatusMessage = statusMessage || 'Pago no aprobado por la entidad financiera.';
      order.paymentUpdatedAt = new Date();

      // Release reserved stock safely back into inventory (idempotent)
      await releaseOrderStock(order, `WOMPI_${authoritativeStatus}`);

      order.paymentAuditTrail.push({
        eventType: `PAYMENT_${authoritativeStatus}`,
        provider: 'WOMPI',
        transactionId,
        reference,
        oldStatus: oldPaymentStatus,
        newStatus: order.paymentStatus,
        timestamp: new Date(),
        details: { statusMessage },
      });

      await order.save();
      console.log(`❌ Orden ${order.orderNumber}: Pago ${authoritativeStatus}. Stock reintegrado.`);
    } else if (authoritativeStatus === 'PENDING') {
      order.paymentStatus = 'PROCESSING';
      order.paymentTransactionId = transactionId;
      order.paymentUpdatedAt = new Date();

      order.paymentAuditTrail.push({
        eventType: 'PAYMENT_PENDING',
        provider: 'WOMPI',
        transactionId,
        reference,
        oldStatus: oldPaymentStatus,
        newStatus: 'PROCESSING',
        timestamp: new Date(),
      });

      await order.save();
      console.log(`⏳ Orden ${order.orderNumber}: Transacción en procesamiento por la red.`);
    }

    return res.status(200).json({
      message: 'Webhook procesado exitosamente',
      orderNumber: order.orderNumber,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
    });
  } catch (error) {
    console.error('❌ Error procesando webhook de Wompi:', error.message);
    return res.status(500).json({ error: 'Error interno al procesar webhook.' });
  }
});

/**
 * 📌 GET /api/payments/:orderId
 * Authoritatively retrieves payment and order status for checkout status screens.
 */
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: 'ID de orden inválido.' });
    }

    const order = await Order.findById(orderId).populate('products.productId', 'nombre precio imagen');
    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada.' });
    }

    // Check expiration on access
    if (
      order.paymentStatus === 'PENDING' &&
      order.paymentExpiresAt &&
      new Date() > new Date(order.paymentExpiresAt)
    ) {
      await releaseOrderStock(order, 'EXPIRED_ON_STATUS_CHECK');
      order.paymentStatus = 'EXPIRED';
      order.orderStatus = 'CANCELLED';
      await order.save();
    }

    return res.json({
      orderId: order._id,
      orderNumber: order.orderNumber,
      total: order.total,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      city: order.city,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      phone: order.phone,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      paymentProvider: order.paymentProvider,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      paymentReference: order.paymentReference,
      paymentTransactionId: order.paymentTransactionId,
      paymentStatusMessage: order.paymentStatusMessage,
      paidAt: order.paidAt,
      paymentExpiresAt: order.paymentExpiresAt,
      brebReference: order.brebReference,
      items: order.products.map((p) => ({
        productId: p.productId?._id || p.productId,
        nombre: p.nombre || p.productId?.nombre || 'Prenda NOIR',
        cantidad: p.quantity,
        talla: p.talla,
        color: p.color,
        precio: p.unitPrice,
        subtotal: p.lineTotal,
      })),
    });
  } catch (error) {
    console.error('❌ Error consultando pago por orden:', error.message);
    return res.status(500).json({ error: 'Error al consultar estado de la orden.' });
  }
});

/**
 * 📌 GET /api/payments/status/by-reference/:reference
 * Looks up order status by Wompi payment reference.
 */
router.get('/status/by-reference/:reference', async (req, res) => {
  try {
    const { reference } = req.params;
    if (!reference) {
      return res.status(400).json({ error: 'Referencia requerida.' });
    }

    const order = await Order.findOne({ paymentReference: reference });
    if (!order) {
      return res.status(404).json({ error: 'No se encontró una orden con dicha referencia.' });
    }

    return res.json({
      orderId: order._id,
      orderNumber: order.orderNumber,
      total: order.total,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      city: order.city,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      phone: order.phone,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      paymentProvider: order.paymentProvider,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      paymentReference: order.paymentReference,
      paymentTransactionId: order.paymentTransactionId,
      paymentStatusMessage: order.paymentStatusMessage,
      paidAt: order.paidAt,
      paymentExpiresAt: order.paymentExpiresAt,
      brebReference: order.brebReference,
    });
  } catch (error) {
    console.error('❌ Error consultando pago por referencia:', error.message);
    return res.status(500).json({ error: 'Error al consultar estado por referencia.' });
  }
});

/**
 * 📌 GET /api/payments/status/by-transaction/:transactionId
 * Looks up order status by Wompi transaction ID.
 */
router.get('/status/by-transaction/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    if (!transactionId) {
      return res.status(400).json({ error: 'ID de transacción requerido.' });
    }

    let order = await Order.findOne({ paymentTransactionId: transactionId });

    // Fallback: If webhook hasn't stored transactionId yet, query Wompi API
    if (!order) {
      const wompiTx = await fetchTransactionFromWompi(transactionId);
      if (wompiTx && wompiTx.reference) {
        order = await Order.findOne({ paymentReference: wompiTx.reference });
      }
    }

    if (!order) {
      return res.status(404).json({ error: 'No se encontró una orden con dicha transacción.' });
    }

    return res.json({
      orderId: order._id,
      orderNumber: order.orderNumber,
      total: order.total,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      city: order.city,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      phone: order.phone,
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod,
      paymentProvider: order.paymentProvider,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      paymentReference: order.paymentReference,
      paymentTransactionId: order.paymentTransactionId || transactionId,
      paymentStatusMessage: order.paymentStatusMessage,
      paidAt: order.paidAt,
      paymentExpiresAt: order.paymentExpiresAt,
      brebReference: order.brebReference,
    });
  } catch (error) {
    console.error('❌ Error consultando pago por transacción:', error.message);
    return res.status(500).json({ error: 'Error al consultar estado por transacción.' });
  }
});

/**
 * 📌 POST /api/payments/breb/submit-proof
 * Submits transfer voucher or transaction reference for manual Bre-B review.
 * Does NOT set APPROVED (preserves security and human verification).
 */
router.post('/breb/submit-proof', async (req, res) => {
  try {
    const { orderId, brebReference, brebProof } = req.body;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: 'Identificador de orden inválido.' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada.' });
    }

    if (order.paymentStatus === 'APPROVED') {
      return res.status(400).json({ error: 'Esta orden ya fue aprobada y pagada.' });
    }

    order.paymentMethod = 'BREB';
    order.paymentProvider = 'MANUAL_BREB';
    order.paymentStatus = 'PENDING';
    order.orderStatus = 'PENDING_PAYMENT';
    order.brebReference = (brebReference || '').trim();
    order.brebProof = (brebProof || '').trim();
    order.paymentUpdatedAt = new Date();

    order.paymentAuditTrail.push({
      eventType: 'BREB_PROOF_SUBMITTED',
      provider: 'MANUAL_BREB',
      reference: order.orderNumber,
      timestamp: new Date(),
      details: { brebReference, brebProof },
    });

    await order.save();

    console.log(`📲 Comprobante Bre-B recibido para orden ${order.orderNumber}. Ref: ${brebReference}`);

    return res.json({
      message: 'Comprobante recibido exitosamente. Tu orden se encuentra en proceso de verificación por nuestro equipo.',
      orderNumber: order.orderNumber,
      orderId: order._id,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
    });
  } catch (error) {
    console.error('❌ Error recibiendo comprobante Bre-B:', error.message);
    return res.status(500).json({ error: 'Error al registrar comprobante Bre-B.' });
  }
});

/**
 * 📌 POST /api/payments/breb/verify/:orderId
 * Administrative verification endpoint to confirm or decline manual Bre-B payments.
 * Protected with authMiddleware and admin authorization check.
 */
router.post('/breb/verify/:orderId', authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { approved, notes } = req.body;

    // 1. Authorize: Verify requesting user is admin
    const adminUser = await User.findById(req.user);
    const isAdmin =
      adminUser &&
      (adminUser.role === 'admin' ||
        adminUser.isAdmin === true ||
        (process.env.ADMIN_EMAIL && adminUser.email === process.env.ADMIN_EMAIL));

    if (!isAdmin) {
      return res.status(403).json({
        error: 'Acceso denegado: Privilegios de administrador requeridos para verificar pagos.',
      });
    }

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: 'Identificador de orden inválido.' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada.' });
    }

    // 2. Validate payment method is BREB
    if (order.paymentMethod !== 'BREB') {
      return res.status(400).json({
        error: 'La orden no corresponde al método de pago manual Bre-B.',
      });
    }

    // 3. Prevent duplicate approval or altering already confirmed orders
    if (order.paymentStatus === 'APPROVED' || order.orderStatus === 'CONFIRMED') {
      return res.status(400).json({
        error: 'Esta orden ya fue aprobada y confirmada previamente.',
        alreadyApproved: true,
      });
    }

    // 4. Must be in PENDING or PROCESSING state
    if (order.paymentStatus !== 'PENDING' && order.paymentStatus !== 'PROCESSING') {
      return res.status(400).json({
        error: `No se puede verificar una orden en estado ${order.paymentStatus}.`,
      });
    }

    if (approved) {
      order.paymentStatus = 'APPROVED';
      order.orderStatus = 'CONFIRMED';
      order.brebVerifiedAt = new Date();
      order.brebVerifiedBy = adminUser._id;
      order.paidAt = new Date();
      order.paymentStatusMessage = notes || 'Pago verificado manualmente mediante Bre-B.';

      order.paymentAuditTrail.push({
        eventType: 'BREB_PAYMENT_VERIFIED_APPROVED',
        provider: 'MANUAL_BREB',
        reference: order.orderNumber,
        oldStatus: 'PENDING',
        newStatus: 'APPROVED',
        timestamp: new Date(),
        details: { notes, adminUserId: adminUser._id },
      });

      await order.save();
      await processApprovedOrderSideEffects(order);

      return res.json({
        message: '✅ Pago Bre-B aprobado exitosamente.',
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
      });
    } else {
      order.paymentStatus = 'DECLINED';
      order.paymentStatusMessage = notes || 'Comprobante Bre-B no verificado o inválido.';
      await releaseOrderStock(order, 'BREB_REJECTED_MANUAL');

      order.paymentAuditTrail.push({
        eventType: 'BREB_PAYMENT_VERIFIED_DECLINED',
        provider: 'MANUAL_BREB',
        reference: order.orderNumber,
        oldStatus: 'PENDING',
        newStatus: 'DECLINED',
        timestamp: new Date(),
        details: { notes, adminUserId: adminUser._id },
      });

      await order.save();

      return res.json({
        message: '❌ Pago Bre-B marcado como no aprobado. Stock compensado.',
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
      });
    }
  } catch (error) {
    console.error('❌ Error verificando orden Bre-B:', error.message);
    return res.status(500).json({ error: 'Error al verificar orden Bre-B.' });
  }
});

module.exports = router;
