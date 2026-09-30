const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    customerName: { type: String, trim: true },
    customerEmail: { type: String, trim: true },
    phone: { type: String, trim: true },
    shippingAddress: { type: String, trim: true },
    city: { type: String, required: true, default: 'Bogotá' },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        nombre: { type: String },
        quantity: { type: Number, required: true, min: 1 },
        talla: { type: String, required: true },
        color: { type: String, required: true },
        unitPrice: { type: Number },
        lineTotal: { type: Number },
      },
    ],
    subtotal: { type: Number },
    shippingCost: { type: Number, default: 0 },
    total: { type: Number, required: true },

    // Primary Phase 6 Payment & Order State Machine
    paymentMethod: {
      type: String,
      enum: [
        'CARD',
        'NEQUI',
        'BREB',
        'CASH_ON_DELIVERY',
        // Legacy backward compatibility
        'online',
        'contra_entrega',
        'nequi',
      ],
      default: 'CASH_ON_DELIVERY',
      required: true,
    },
    paymentProvider: {
      type: String,
      enum: ['WOMPI', 'MANUAL_BREB', 'NONE'],
      default: 'NONE',
    },
    paymentStatus: {
      type: String,
      enum: [
        'PENDING',
        'PROCESSING',
        'APPROVED',
        'DECLINED',
        'FAILED',
        'VOIDED',
        'REFUNDED',
        'EXPIRED',
      ],
      default: 'PENDING',
      index: true,
    },
    orderStatus: {
      type: String,
      enum: [
        'PENDING_PAYMENT',
        'CONFIRMED',
        'PROCESSING',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED',
      ],
      default: 'PENDING_PAYMENT',
      index: true,
    },

    // Transaction & Verification Metadata
    paymentReference: {
      type: String,
      index: true,
      sparse: true,
    },
    paymentTransactionId: {
      type: String,
      index: true,
      sparse: true,
    },
    paymentProviderReference: { type: String },
    paymentAmount: { type: Number },
    paymentCurrency: { type: String, default: 'COP' },
    paymentMethodType: { type: String },
    paymentStatusMessage: { type: String },
    paymentCreatedAt: { type: Date },
    paidAt: { type: Date },
    paymentUpdatedAt: { type: Date },
    paymentExpiresAt: { type: Date },
    paymentMetadata: { type: mongoose.Schema.Types.Mixed },

    // Stock Reservation & Compensation Safety Flags
    stockReserved: { type: Boolean, default: true },
    stockReleased: { type: Boolean, default: false },

    // Bre-B / Llave Manual Proof & Verification
    brebReference: { type: String, trim: true },
    brebProof: { type: String, trim: true },
    brebVerifiedAt: { type: Date },
    brebVerifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Payment Audit Trail (Secure, never logs secrets or card data)
    paymentAuditTrail: [
      {
        eventType: { type: String, required: true },
        provider: { type: String, default: 'WOMPI' },
        transactionId: { type: String },
        reference: { type: String },
        oldStatus: { type: String },
        newStatus: { type: String },
        timestamp: { type: Date, default: Date.now },
        details: { type: mongoose.Schema.Types.Mixed },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Backward compatibility virtuals for legacy "status" and "estado"
OrderSchema.virtual('status')
  .get(function () {
    if (this.orderStatus === 'CONFIRMED' || this.paymentStatus === 'APPROVED') {
      return 'pagado';
    }
    if (this.orderStatus === 'CANCELLED') {
      return 'cancelado';
    }
    if (this.orderStatus === 'SHIPPED' || this.orderStatus === 'DELIVERED') {
      return 'enviado';
    }
    return 'pendiente';
  })
  .set(function (val) {
    if (val === 'pagado') {
      this.orderStatus = 'CONFIRMED';
      this.paymentStatus = 'APPROVED';
    } else if (val === 'cancelado') {
      this.orderStatus = 'CANCELLED';
    } else if (val === 'enviado') {
      this.orderStatus = 'SHIPPED';
    } else {
      this.orderStatus = 'PENDING_PAYMENT';
    }
  });

OrderSchema.virtual('estado')
  .get(function () {
    return this.status;
  })
  .set(function (val) {
    this.status = val;
  });

module.exports = mongoose.model('Order', OrderSchema);
