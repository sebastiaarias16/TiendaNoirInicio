require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db'); // Conexión MongoDB
const path = require('path');

const invoiceRoutes = require('./routes/invoice'); // Rutas de facturas
const productRoutes = require('./routes/productRoutes'); // Rutas de productos
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes'); //Ruta de autenticacion


connectDB();

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/invoice', invoiceRoutes);
app.use('/api/products', productRoutes); // 🔥 Asegurar ruta de productos
app.use('/api/orders', orderRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.get('/', (req, res) => {
    res.send('🖤 Tienda Noir API funcionando...');
});


// Servir frontend en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en el puerto ${PORT}`));