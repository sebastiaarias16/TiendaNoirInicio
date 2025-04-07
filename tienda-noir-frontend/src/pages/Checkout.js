import { useState, useEffect } from 'react';
import { createOrder, fetchCartItems } from '../api/api';
import { getUser } from '../api/auth';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Checkout = ({ clearCart }) => {
  const [cartItems, setCartItems] = useState([]);
  const [message, setMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [city, setCity] = useState('');
  const [orderId, setOrderId] = useState(null); // Ahora sí se define en el estado
  const [user, setUser] = useState(null);


  // 📌 Cargar los productos del carrito desde el backend
  useEffect(() => {

    const checkUser = async () => {
      const loggedUser = await getUser();
      setUser(loggedUser);
    };
    checkUser();


    const loadCartItems = async () => {
      try {
        const response = await fetchCartItems();
        setCartItems(response.map(product => ({
          ...product,
          selectedSize: product.tallas?.[0] || 'M',
          selectedColor: product.colores?.[0] || 'Negro',
          quantity: 1,
        })));
      } catch (error) {
        console.error('❌ Error al obtener productos:', error);
      }
    };

    loadCartItems();
  }, []);

  if (!user) {
    return (
      <div>
        <h2>🔑 Debes iniciar sesión para comprar</h2>
        <a href="./Login">Iniciar Sesión</a> | <a href="./Register">Registrarse</a>
        <li><Link to="/Login">Iniciar Sesión</Link></li> | <li><Link to="/Register">Registrarse</Link></li>
      </div>
    );
  }

  // 📌 Actualizar valores del carrito
  const updateCartItem = (productId, updates) => {
    setCartItems(cartItems.map(item =>
      item._id === productId ? { ...item, ...updates } : item
    ));
  };

  const handleCheckout = async () => {
    const user = await getUser();
    if (!user) return alert('Debes iniciar sesión para comprar');

    if (cartItems.length === 0) {
      setMessage('❌ El carrito está vacío.');
      return;
    }

    if (paymentMethod === "contra_entrega" && city.toLowerCase() !== "bogotá") {
      alert("⚠️ El pago contra entrega solo está disponible en Bogotá.");
      return;
    }

    const orderData = {
      userId: user._id,
      products: cartItems.map(item => ({
        productId: item._id,
        quantity: item.quantity,
        talla: item.selectedSize,
        color: item.selectedColor,
      })),
      total: cartItems.reduce((acc, item) => acc + item.precio * item.quantity, 0),
      paymentMethod,
      city
    };

    try {
      console.log('🛒 Enviando orden a la API:', orderData);
      const response = await createOrder(orderData);
      setOrderId(response.order._id);
      setMessage(`✅ Pedido generado: ${response.order._id}`);
      clearCart();
    } catch (error) {
      console.error('❌ Error en la compra:', error.response?.data || error.message);
      setMessage(`❌ Error: ${error.response?.data?.error || "No se pudo procesar la compra."}`);
    }
  };

  const handlePayment = async () => {
    const user = await getUser();
    if (!user) return alert('Debes iniciar sesión para comprar');

    try {
      const orderData = {
        userEmail: user.email,
        productos: cartItems.map(item => ({
          nombre: item.nombre,
          quantity: item.quantity,
          precio: item.precio
        }))
      };

      const response = await axios.post('http://localhost:3000/api/payment/create-payment', orderData);
      window.location.href = response.data.url; // Redirigir a MercadoPago
    } catch (error) {
      console.error("❌ Error en el pago:", error);
      setMessage("❌ Error al procesar el pago.");
    }
  };

  const generateInvoice = async () => {
    if (!orderId) return alert('No hay orden para generar factura.');

    try {
      const response = await fetch(`http://localhost:3000/api/invoice/generate-invoice/${orderId}`);
      const data = await response.json();
      if (data.filePath) {
        window.open(`http://localhost:3000/${data.filePath}`);
      }
    } catch (error) {
      console.error('❌ Error al generar la factura:', error);
    }
  };

  return (
    <div>
      <h2>🛒 Carrito de Compras</h2>
      {cartItems.length === 0 ? (
        <p>No hay productos en el carrito</p>
      ) : (
        <>
          <ul>
            {cartItems.map(item => (
              <li key={item._id}>
                <p>{item.nombre} - ${item.precio} </p>
                <label>
                  Talla:
                  <select value={item.selectedSize} onChange={(e) => updateCartItem(item._id, { selectedSize: e.target.value })}>
                    {item.tallas.map(size => <option key={size} value={size}>{size}</option>)}
                  </select>
                </label>
                <label>
                  Color:
                  <select value={item.selectedColor} onChange={(e) => updateCartItem(item._id, { selectedColor: e.target.value })}>
                    {item.colores.map(color => <option key={color} value={color}>{color}</option>)}
                  </select>
                </label>
                <label>
                  Cantidad:
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => {
                      const newQuantity = Math.max(1, parseInt(e.target.value)); // Evitar valores negativos
                      updateCartItem(item._id, { quantity: newQuantity });
                    }}
                    min="1"
                  />
                </label>
                <button onClick={() => setCartItems(cartItems.filter(i => i._id !== item._id))}>Eliminar</button>
              </li>
            ))}
          </ul>

          <label>
            Ciudad:
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} />
          </label>

          <label>
            Método de Pago:
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="online">Pago en Línea</option>
              <option value="contra_entrega">Pago Contra Entrega</option>
            </select>
          </label>

          <button onClick={handleCheckout}>🛒 Finalizar Compra</button>
          {paymentMethod === "online" && (
            <button onClick={handlePayment}>💳 Pagar con MercadoPago</button>
          )}
        </>
      )}

      {orderId && (
        <button onClick={generateInvoice}>📄 Descargar Factura</button>
      )}
      {message && <p>{message}</p>}
    </div>
  );
};

export default Checkout;