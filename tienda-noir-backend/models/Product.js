const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  precio: { type: Number, required: true },
  imagen: { type: String, required: true },
  stock: { type: Number, required: true },
  categoria: { type: String, required: true },
  tallas: [{ type: String, enum: ['S', 'M', 'L', 'XL'] }], // Tallas disponibles
  colores: [{ type: String }],
  featured: {
    type: Boolean,
    default: false
  }, // Colores disponibles
});

module.exports = mongoose.model('Product', productSchema);