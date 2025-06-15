import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// 📌 Obtener productos del carrito desde la API
export const fetchCartItems = async () => {
  try {
    const response = await axios.get(`${API_URL}/products`);
    return response.data.filter(producto => producto.stock > 0); // Solo productos con stock disponible
  } catch (error) {
    console.error('❌ Error al obtener productos:', error);
    return [];
  }
};

// 📌 Crear una orden de compra
export const createOrder = async (orderData) => {
  try {
    const response = await axios.post(`${API_URL}/orders`, orderData);
    return response.data;
  } catch (error) {
    console.error('❌ Error al crear orden:', error);
    throw error;
  }
};