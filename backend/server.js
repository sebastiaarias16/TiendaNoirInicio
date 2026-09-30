require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const path = require('path');

const invoiceRoutes = require('./routes/invoiceRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/invoice', invoiceRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
// Servir facturas generadas
app.use('/invoices', express.static(path.join(__dirname, 'invoices')));


// Servir imágenes u otros archivos subidos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mensaje raíz para saber que el backend está vivo
app.get('/', (req, res) => {
  res.send('🖤 Tienda Noir API funcionando...');
});

// SERVIR FRONTEND EN PRODUCCIÓN 🔥
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'build'))); // Asegúrate de haber movido frontend/build a backend/build

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en el puerto ${PORT}`));