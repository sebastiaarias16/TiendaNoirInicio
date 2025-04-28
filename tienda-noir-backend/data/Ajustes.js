const mongoose = require('mongoose');
require('dotenv').config();
const Producto = require('../models/Product');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Nuevos productos
const productos = [
  {
    nombre: 'Camiseta Hombre',
    precio: 60000,
    descripcion: 'Camiseta de hombre NOIR.',
    stock: 6,
    categoria: 'Camiseta',
    imagen: [
      'CAMISETA.png'     // Negro
    ],
    tallas: ['M', 'L'],
    colores: ['Negro'],
    featured: true
  },
  {
    nombre: 'Pantaloneta Hombre',
    precio: 60000,
    descripcion: 'Pantaloneta de hombre NOIR.',
    stock: 6,
    categoria: 'Pantaloneta',
    imagen: [
      'pantalonetaHombre.png'     // Negro
    ],
    tallas: ['M', 'L'],
    colores: ['Negro'],
    featured: true
  },
  {
    nombre: 'Short Mujer',
    precio: 60000,
    descripcion: 'Short flexibles para mujer con control abdominal.',
    stock: 6,
    categoria: 'Short',
    imagen: [
      'shortmujer.png'        // Negro
    ],
    tallas: ['S', 'M'],
    colores: ['Negro']
  },
  {
    nombre: 'Top Mujer',
    precio: 60000,
    descripcion: 'Top mujer.',
    stock: 6,
    categoria: 'Top',
    imagen: [
      'top.png'        // Negro
    ],
    tallas: ['S', 'M'],
    colores: ['Negro']
  },
  {
    nombre: 'leggins Mujer',
    precio: 60000,
    descripcion: 'leggins mujer.',
    stock: 6,
    categoria: 'leggins',
    imagen: [
      'leggins.png'        // Negro
    ],
    tallas: ['S', 'M'],
    colores: ['Negro']
  },
  {
    nombre: 'Conjunto Top y Leggins',
    precio: 60000,
    descripcion: 'Conjunto mujer.',
    stock: 6,
    categoria: 'Conjunto',
    imagen: [
      'TOP_Y_LEGGINGS.png'        // Negro
    ],
    tallas: ['S', 'M'],
    colores: ['Negro']
  },
  {
    nombre: 'Conjunto Camiseta y Pantaloneta',
    precio: 110000,
    descripcion: 'Conjunto hombre.',
    stock: 6,
    categoria: 'Conjunto',
    imagen: [
      'ConjuntoHombre.png'        // Negro
    ],
    tallas: ['S', 'M'],
    colores: ['Negro']
  }
];

const reemplazarProductos = async () => {
  try {
    await Producto.deleteMany({});
    console.log('🗑️ Productos anteriores eliminados');
    await Producto.insertMany(productos);
    console.log('✅ Nuevos productos insertados correctamente');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

reemplazarProductos();