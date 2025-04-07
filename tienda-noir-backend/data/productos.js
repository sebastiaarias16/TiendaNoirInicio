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
    precio: 100000,
    descripcion: 'Camiseta deportiva de compresion',
    stock: 10,
    categoria: 'Camisa',
    imagen: 'C:/Users/SEBASTIAN/Desktop/Catalogo/iloveimg-converted/CamisaHombre2.jpg'
  },
  {
    nombre: 'leguis Mujer',
    precio: 120000,
    descripcion: 'leggis pantalon para mujer',
    stock: 10,
    categoria: 'Pantalon',
    imagen: 'C:/Users/SEBASTIAN/Desktop/Catalogo/iloveimg-converted/LicraPantMujer1.jpg'
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
