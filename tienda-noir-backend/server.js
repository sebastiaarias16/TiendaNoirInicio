require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const path = require('path');

// Rutas
const invoiceRoutes = require('./routes/invoice');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');

connectDB();

const app = express();

// CORS configurado dinámicamente
const allowedOrigins = [
  'https://noirshop.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir peticiones sin origin como las de Postman o cURL
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('CORS no permitido desde este origen'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/invoice', invoiceRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('🖤 Tienda Noir API funcionando...');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en el puerto ${PORT}`));
