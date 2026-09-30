import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';

// 📌 Obtener productos del catálogo desde la API (solo disponibles)
export const fetchCartItems = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/products`);
    return response.data.filter((producto) => producto.stock > 0);
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

// 📌 Crear una orden de compra (autoritativa en servidor)
export const createOrder = async (orderData) => {
  try {
    const response = await axios.post(`${API_URL}/api/orders`, orderData);
    return response.data;
  } catch (error) {
    console.error('❌ Error al crear orden:', error);
    throw error;
  }
};

// 💳 Preparar pago seguro Wompi (Card / Nequi)
export const createWompiPayment = async ({ orderId, userId }) => {
  try {
    const response = await axios.post(`${API_URL}/api/payments/wompi/create`, {
      orderId,
      userId,
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error preparando pago Wompi:', error);
    throw error;
  }
};

// 🔍 Consultar estado autoritativo de pago por ID de orden
export const getPaymentStatus = async (orderId) => {
  try {
    const response = await axios.get(`${API_URL}/api/payments/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error consultando estado de orden:', error);
    throw error;
  }
};

// 🔍 Consultar estado autoritativo de pago por referencia de Wompi
export const getPaymentStatusByReference = async (reference) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/payments/status/by-reference/${encodeURIComponent(reference)}`
    );
    return response.data;
  } catch (error) {
    console.error('❌ Error consultando estado por referencia:', error);
    throw error;
  }
};

// 🔍 Consultar estado autoritativo de pago por ID de transacción Wompi
export const getPaymentStatusByTransactionId = async (transactionId) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/payments/status/by-transaction/${encodeURIComponent(transactionId)}`
    );
    return response.data;
  } catch (error) {
    console.error('❌ Error consultando estado por ID de transacción:', error);
    throw error;
  }
};

// 📲 Registrar comprobante o referencia de pago asistido Bre-B / Llave
export const submitBrebProof = async ({ orderId, brebReference, brebProof }) => {
  try {
    const response = await axios.post(`${API_URL}/api/payments/breb/submit-proof`, {
      orderId,
      brebReference,
      brebProof,
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error enviando comprobante Bre-B:', error);
    throw error;
  }
};