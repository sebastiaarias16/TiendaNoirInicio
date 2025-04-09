const mongoose = require('mongoose');
require('dotenv').config();
const Producto = require('../models/Product'); // Asegúrate de que este modelo exista

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const productos = [
  {
    nombre: 'Camiseta Noir Pro',
    precio: 40.000,
    descripcion: 'Camiseta deportiva de compresión con tela transpirable.',
    stock: 3,
    categoria: 'Camisa Compresion',
    imagenes: [
      'http://localhost:3000/uploads/CamisaHombre3.jpg'     // Negro
    ],
    tallas: ['S', 'M', 'L'],
    colores: ['Negro'],
    featured: true
  },
  {
    nombre: 'Leggins Mujer Noir',
    precio: 85.000,
    descripcion: 'Leggins flexibles para mujer con control abdominal.',
    stock: 5,
    categoria: 'legging Pantalon',
    imagenes: [
      'http://localhost:3000/uploads//leggingMujer2.png'        // Negro
    ],
    tallas: ['S', 'M', 'L', 'XL'],
    colores: ['Negro']
  },
  {
    nombre: 'Leggins Mujer Noir',
    precio: 85.000,
    descripcion: 'Leggins flexibles para mujer con control abdominal.',
    stock: 5,
    categoria: 'legging Pantalon',
    imagenes: [
      'http://localhost:3000/uploads//leggingMujer3.png'        // Negro
    ],
    tallas: ['S', 'M', 'L', 'XL'],
    colores: ['Negro'],
    featured: true
  },
  {
    nombre: 'Camiseta Noir Manga larga',
    precio: 46.000,
    descripcion: 'Camiseta manga larga deportiva de compresión adaptable al cuerpo.',
    stock: 3,
    categoria: 'Camisa Compresion',
    imagenes: [
      'http://localhost:3000/uploads/CamisaCompresionMangaLargaHombre2.png'     // Negro
    ],
    tallas: ['S', 'M', 'L'],
    colores: ['Negro']
  },
  {
    nombre: 'Camiseta Noir Pro',
    precio: 40.000,
    descripcion: 'Camiseta deportiva de compresión con tela transpirable.',
    stock: 3,
    categoria: 'Camisa Compresion',
    imagenes: [
      'http://localhost:3000/uploads/CamisaHombre2.jpg',     // Gris
      'http://localhost:3000/uploads/CamisaCompresionHombreAzul.png',     // Azul
      'http://localhost:3000/uploads/CamisaCompresionHombreRojo.png'     // Rojo
    ],
    tallas: ['S', 'M', 'L'],
    colores: ['Gris','Azul','Rojo'],
    featured: true
  },
  {
    nombre: 'Pantaloneta deportiva',
    precio: 25.000,
    descripcion: 'pantaloneta deportiva corta.',
    stock: 3,
    categoria: 'Pantaloneta',
    imagenes: [
      'http://localhost:3000/uploads/PantalonetaHombre1.png',     // Azul
    ],
    tallas: ['S', 'M', 'L'],
    colores: ['Negro']
  },
  {
    nombre: 'Conjunto de compresion Mujer',
    precio: 25.000,
    descripcion: 'Conjunto deportivo de legging con control abdominal y Top corto manga larga.',
    stock: 3,
    categoria: 'Conjunto Mujer',
    imagenes: [
      'http://localhost:3000/uploads/ConjuntoMujerNegro.png',     // Negro
      'http://localhost:3000/uploads/ConjuntoMujerAzulOscuro.png',     // Azul Oscuro
      'http://localhost:3000/uploads/ConjuntoMujerGris.png',     // Gris
      'http://localhost:3000/uploads/ConjuntoMujerBlanco.png'   //Blanco
    ],
    tallas: ['S', 'M', 'L'],
    colores: ['Gris','Azul','Rojo'],
    featured: true
  }
];

const insertarProductos = async () => {
  try {
    await Producto.insertMany(productos);
    console.log('✅ Productos insertados correctamente');
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error insertando productos:', error);
    mongoose.connection.close();
  }
};

insertarProductos();
