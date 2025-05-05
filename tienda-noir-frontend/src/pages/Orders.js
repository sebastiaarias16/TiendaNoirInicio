import { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/orders.css';

function Orders() {
    const [orders, setOrders] = useState([]);
    const [userId, setUserId] = useState(null);
  
    useEffect(() => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser && storedUser._id) {
        setUserId(storedUser._id);
      } else {
        console.warn('⚠️ No hay usuario en localStorage');
      }
    }, []);
  
    useEffect(() => {
      if (!userId) return;
  
      const fetchOrders = async () => {
        try {
          const res = await axios.get(`https://noir-backend-z409.onrender.com/api/orders/user/${userId}`);
          console.log('📦 Órdenes traídas:', res.data);
          setOrders(res.data);
        } catch (err) {
          console.error('❌ Error al obtener órdenes:', err);
        }
      };
  
      fetchOrders();
    }, [userId]);
  
    return (
      <div className="orders-container">
        <h2>Mis Órdenes</h2>
        {orders.length === 0 ? (
          <p>No tienes órdenes aún.</p>
        ) : (
          orders.map((order) => (
            <div className="order-card" key={order._id}>
              <h3>Orden #{order._id.slice(-6)}</h3>
              <p><strong>Fecha:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
              <p><strong>Total:</strong> ${order.total}</p>
              <p><strong>Productos:</strong></p>
              <ul>
                {order.items.map((item, idx) => (
                  <li key={idx}>
                    {item.nombre} x{item.cantidad} - ${item.precio}
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    );
  }
  
  export default Orders;