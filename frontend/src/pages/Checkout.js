import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';

import { CartContext } from '../CartContext';
import { createOrder } from '../api/api';
import { getUser } from '../api/auth';
import '../styles/checkout.css';
const API_URL = import.meta.env.VITE_BACKEND_URL;



const Checkout = () => {
  const [message, setMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [city, setCity] = useState('');
  const [orderId, setOrderId] = useState(null);
  const [user, setUser] = useState(null);

  const {
    cartItems,
    setCartItems,
    clearCart,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
  } = useContext(CartContext);

  useEffect(() => {
    const loadUserAndCart = async () => {
      const loggedUser = await getUser();
      setUser(loggedUser);
      const storedCart = JSON.parse(localStorage.getItem('cartItems')) || [];
      setCartItems(storedCart);
    };
    loadUserAndCart();
  }, [setCartItems]);

  const updateCartItem = (productId, updates) => {
    setCartItems(prev =>
      prev.map(item =>
        item._id === productId ? { ...item, ...updates } : item
      )
    );
  };

  const total = cartItems.reduce((acc, item) => acc + item.precio * item.quantity, 0);

  const generateWhatsappMessage = () => {
    if (!cartItems.length) return '';

    let mensaje = "Hola, quiero hacer un pedido:%0A";

    cartItems.forEach(item => {
      mensaje += `- ${item.nombre} (Talla: ${item.selectedSize}, Color: ${item.selectedColor}) x${item.quantity}: $${item.precio * item.quantity}%0A`;
    });

    mensaje += `Total: $${total}`;

    return mensaje;
  };
  const redirectToWhatsapp = () => {
    const telefono = "573194732613"; // Cambia aquí por tu número con código país (sin + ni espacios)
    const mensaje = generateWhatsappMessage();
    if (!mensaje) return alert('El carrito está vacío.');

    const url = `https://wa.me/${telefono}?text=${mensaje}`;
    window.open(url, '_blank');
  };

  const handleFinalizePurchase = async () => {
    await handleCheckout();
    redirectToWhatsapp();
  };

  const handleCheckout = async () => {
    if (!user) return alert('Debes iniciar sesión para comprar');
    if (!cartItems.length) return setMessage('❌ El carrito está vacío.');
    if (paymentMethod === 'contra_entrega' && city.toLowerCase() !== 'bogotá') {
      return alert('⚠️ El pago contra entrega solo está disponible en Bogotá.');
    }

    const orderData = {
      userId: user._id,
      products: cartItems.map(item => ({
        productId: item._id,
        quantity: item.quantity,
        talla: item.selectedSize,
        color: item.selectedColor,
      })),
      total,
      paymentMethod,
      city,
    };

    try {
      const response = await createOrder(orderData);
      setOrderId(response.order._id);
      setMessage(`✅ Pedido generado: ${response.order._id}`);
      clearCart();
    } catch (error) {
      console.error('❌ Error en la compra:', error.response?.data || error.message);
      setMessage(`❌ Error: ${error.response?.data?.error || 'No se pudo procesar la compra.'}`);
    }
  };

  const handlePayment = async () => {
    if (!user) return alert('Debes iniciar sesión para comprar');

    try {
      const response = await axios.post(`${API_URL}/api/payment/create-payment`, {
        userEmail: user.email,
        productos: cartItems.map(({ nombre, quantity, precio }) => ({ nombre, quantity, precio })),
      });

      window.location.href = response.data.url;
    } catch (error) {
      console.error('❌ Error en el pago:', error);
      setMessage('❌ Error al procesar el pago.');
    }
  };

  const generateInvoice = async () => {
    if (!orderId) return alert('No hay orden para generar factura.');

    try {
      const response = await fetch(`${API_URL}/api/invoice/generate-invoice/${orderId}`);
      const data = await response.json();
      if (data.message) {
        setMessage("✅ Factura generada y enviada a tu correo. ¡Gracias por confiar en NOIR!");
      }
    } catch (error) {
      console.error('❌ Error al generar la factura:', error);
      setMessage('❌ No se pudo generar la factura.');
    }
  };

  if (!user) {
    return (
      <main className="main-content">
        <motion.div
          className="checkout-auth-warning"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2>🔒 Debes iniciar sesión para comprar</h2>
          <Link to="/login">Iniciar Sesión</Link> | <Link to="/register">Registrarse</Link>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="main-content">
      <motion.div
        className="checkout-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h2
          className="checkout-header"
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
        >
          Finaliza tu compra
        </motion.h2>

        {!cartItems.length ? (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            No hay productos en el carrito
          </motion.p>
        ) : (
          <>
            <motion.ul className="cart-list" initial="hidden" animate="visible" variants={{
              visible: { transition: { staggerChildren: 0.1 } },
              hidden: {}
            }}>
              {cartItems.map(item => (
                <motion.li
                  key={item._id}
                  className="cart-item"
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                >
                  <div className="item-info">
                    <p><strong>{item.nombre}</strong></p>
                    <p>${item.precio}</p>
                  </div>

                  <div className="item-options">
                    <label>
                      Talla:
                      <select value={item.selectedSize} onChange={e => updateCartItem(item._id, { selectedSize: e.target.value })}>
                        {item.tallas.map(size => <option key={size} value={size}>{size}</option>)}
                      </select>
                    </label>

                    <label>
                      Color:
                      <select value={item.selectedColor} onChange={e => updateCartItem(item._id, { selectedColor: e.target.value })}>
                        {item.colores.map(color => <option key={color} value={color}>{color}</option>)}
                      </select>
                    </label>

                    <label>
                      Cantidad:
                      <div className="quantity-controls">
                        <button onClick={() => decrementQuantity(item._id)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => incrementQuantity(item._id)}>+</button>
                      </div>
                    </label>
                  </div>

                  <motion.button
                    className="remove-button"
                    whileHover={{ scale: 1.05 }}
                    onClick={() => removeFromCart(item._id)}
                  >
                    Eliminar
                  </motion.button>
                </motion.li>
              ))}
            </motion.ul>

            <div className="checkout-summary">
              <h3>Total: ${total}</h3>
              <p><strong>Por el momento, NOIR realiza pedidos únicamente en la ciudad de Bogotá.
                Estamos trabajando para expandirnos y llegar pronto a nuevas ciudades.</strong></p>
              {/*<label>
                Ciudad:
                <input type="text" value={city} onChange={e => setCity(e.target.value)} />
              </label>

              <label>
                Método de Pago:
                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                  <option value="online">Pago en Línea</option>
                  {/*<option value="contra_entrega">Pago Contra Entrega</option>*/}{/*
                </select>
              </label>*/}

              <motion.button className="checkout-button" whileTap={{ scale: 0.95 }} onClick={handleFinalizePurchase}>
                Finalizar Compra
              </motion.button>

              {/*paymentMethod === 'online' && (
                <motion.button className="payment-button" whileTap={{ scale: 0.95 }} onClick={handlePayment}>
                  Pagar con MercadoPago
                </motion.button>
              )*/}
            </div>
          </>
        )}

        {orderId && (
          <motion.button className="invoice-button" whileHover={{ scale: 1.05 }} onClick={generateInvoice}>
            Descargar Factura
          </motion.button>
        )}

        {message && <motion.p className="checkout-message" animate={{ opacity: 1 }}>{message}</motion.p>}
      </motion.div>
    </main>
  );
};

export default Checkout;