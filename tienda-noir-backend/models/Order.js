const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        talla: { type: String, required: true },
        color: { type: String, required: true }
    }],
    total: { type: Number, required: true },
    status: { type: String, enum: ['pendiente', 'pagado', 'enviado'], default: 'pendiente' },
    createdAt: { type: Date, default: Date.now },
    paymentMethod: { type: String, enum: ['online', 'contra_entrega'], required: true }, // Método de pago
    city: { type: String, required: true } // Ciudad para validar contra entrega
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
