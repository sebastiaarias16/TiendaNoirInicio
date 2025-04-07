const mongoose = require('mongoose');
require('dotenv').config(); // 📌 Carga variables de entorno

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('❌ No se encontró MONGO_URI en el archivo .env');
    }

    await mongoose.connect(process.env.MONGO_URI);


    console.log('✅ MongoDB conectado');
  } catch (error) {
    console.error(`❌ Error al conectar MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;