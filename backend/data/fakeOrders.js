const axios = require('axios');

const userId = '68008a99dbf601b24cd898ce'; // 👈 Pega aquí un userId válido de tu base de datos

const pedidos = [
  {
    userId,
    products: [
      {
        productId: '680fe18a43f54cff5f642330', // Camiseta Hombre
        quantity: 1,
        talla: 'M',
        color: 'Negro'
      }
    ],
    total: 60000,
    paymentMethod: 'contra_entrega',
    city: 'Bogotá'
  },
  {
    userId,
    products: [
      {
        productId: '680fe18a43f54cff5f642331', // Pantaloneta Hombre
        quantity: 2,
        talla: 'L',
        color: 'Negro'
      }
    ],
    total: 120000,
    paymentMethod: 'online',
    city: 'Bogotá'
  },
  {
    userId,
    products: [
      {
        productId: '680fe18a43f54cff5f642335', // Conjunto Top y Leggins
        quantity: 1,
        talla: 'S',
        color: 'Gris'
      }
    ],
    total: 60000,
    paymentMethod: 'contra_entrega',
    city: 'Bogotá'
  }
];

pedidos.forEach(async (pedido, index) => {
  try {
    const res = await axios.post('http://localhost:3000/api/orders', pedido);
    console.log(`✅ Pedido ${index + 1} creado con éxito:`, res.data);
  } catch (err) {
    console.error(`❌ Error al crear pedido ${index + 1}:`, {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status
    });
  }
});
