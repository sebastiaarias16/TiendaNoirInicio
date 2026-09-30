const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// 📌 Agregar un nuevo producto
router.post('/add', async (req, res) => {
  try {
    const { nombre, descripcion, precio, imagen, stock, categoria } = req.body;
    
    const nuevoProducto = new Product({ nombre, descripcion, precio, imagen, stock, categoria });
    await nuevoProducto.save();
    
    res.status(201).json({ mensaje: '✅ Producto agregado correctamente', producto: nuevoProducto });
  } catch (error) {
    res.status(500).json({ error: '❌ Error al agregar producto' });
  }
});

// 📌 Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const productos = await Product.find();
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: '❌ Error al obtener productos' });
  }
});

router.get('/featured', async (req, res) => {
  try {
    const featuredProducts = await Product.find({ featured: true });
    res.json(featuredProducts);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos destacados' });
  }
});

// 📌 Obtener producto por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    const producto = await Product.findById(id);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
});

module.exports = router;
