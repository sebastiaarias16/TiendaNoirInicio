const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customerName: { type: String },
    customerEmail: { type: String },
    phone: { type: String },
    shippingAddress: { type: String },
    city: { type: String, required: true, default: 'Bogotá' },
    products: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        nombre: { type: String },
        quantity: { type: Number, required: true, min: 1 },
        talla: { type: String, required: true },
        color: { type: String, required: true },
        unitPrice: { type: Number },
        lineTotal: { type: Number }
    }],
    subtotal: { type: Number },
    shippingCost: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
        type: String,
        enum: ['pendiente', 'pagado', 'enviado', 'cancelado'],
        default: 'pendiente'
    },
    paymentMethod: {
        type: String,
        enum: ['online', 'contra_entrega', 'nequi'],
        default: 'contra_entrega',
        required: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Alias virtual for backwards compatibility with legacy references to "estado"
OrderSchema.virtual('estado').get(function () {
    return this.status;
}).set(function (val) {
    this.status = val;
});

module.exports = mongoose.model('Order', OrderSchema);
