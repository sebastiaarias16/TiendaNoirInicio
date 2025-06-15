// scripts/actualizarProductos.js
const mongoose = require('mongoose');
require('dotenv').config();
const Producto = require('../models/Product'); // Asegúrate de que esta ruta sea correcta

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Nuevos productos
const productos = [
  {
    nombre: 'Camiseta Noir Pro',
    precio: 100000,
    descripcion: 'Camiseta deportiva de compresión con tela transpirable y ajuste perfecto.',
    stock: 10,
    categoria: 'Camisa',
    imagen: '/Img/CamisaHombre2.jpg',
    tallas: ['S', 'M', 'L'],
    colores: ['Negro', 'Gris']
  },
  {
    nombre: 'Leggins Mujer Noir',
    precio: 120000,
    descripcion: 'Leggins de alta resistencia y flexibilidad para entrenamientos exigentes.',
    stock: 15,
    categoria: 'Pantalón',
    imagen: '/Img/LicraPantMujer1.jpg',
    tallas: ['S', 'M', 'L', 'XL'],
    colores: ['Negro', 'Vino Tinto']
  }
];

const actualizarProductos = async () => {
  try {
    await Producto.deleteMany(); // ❌ Borra todos los productos actuales
    await Producto.insertMany(productos); // ✅ Inserta los nuevos
    console.log('🧼 Productos actualizados correctamente.');
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error actualizando productos:', error);
    mongoose.connection.close();
  }
};

actualizarProductos();
