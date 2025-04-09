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
      nombre: 'Camiseta Noir Pro',
      precio: 40.000,
      descripcion: 'Camiseta deportiva de compresión con tela transpirable.',
      stock: 3,
      categoria: 'Camisa Compresion',
      imagen: [
        'CamisaHombre3.jpg'     // Negro
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
      imagen: [
        'leggingMujer2.png'        // Negro
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
      imagen: [
        'leggingMujer3.png'        // Negro
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
      imagen: [
        'CamisaCompresionMangaLargaHombre2.png'     // Negro
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
      imagen: [
        'CamisaHombre2.jpg',     // Gris
        'CamisaCompresionHombreAzul.png',     // Azul
        'CamisaCompresionHombreRojo.png'     // Rojo
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
      imagen: [
        'PantalonetaHombre1.png',     // Azul
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
      imagen: [
        'ConjuntoMujerNegro.png',     // Negro
        'ConjuntoMujerAzulOscuro.png',     // Azul Oscuro
        'ConjuntoMujerGris.png',     // Gris
        'ConjuntoMujerBlanco.png'   //Blanco
      ],
      tallas: ['S', 'M', 'L'],
      colores: ['Gris','Azul','Rojo'],
      featured: true
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