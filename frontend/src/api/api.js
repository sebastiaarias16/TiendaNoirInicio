import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';

// 📌 Obtener productos del catálogo desde la API (solo disponibles)
export const fetchCartItems = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/products`);
    return response.data.filter(producto => producto.stock > 0); // Solo productos con stock disponible
  } catch (error) {
    console.error('❌ Error al obtener productos:', error);
    return [];
  }
};

// 📌 Obtener un producto por ID desde la API
export const fetchProductById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/api/products/${id}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    console.error('❌ Error al obtener producto por ID:', error);
    throw error;
  }
};

// 📌 Crear una orden de compra
export const createOrder = async (orderData) => {
  try {
    const response = await axios.post(`${API_URL}/api/orders`, orderData);
    return response.data;
  } catch (error) {
    console.error('❌ Error al crear orden:', error);
    throw error;
  }
};