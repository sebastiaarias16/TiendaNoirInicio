import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Footer from '../components/Footer';
import { formatCOP } from '../utils/productUtils';
import {
  FiPackage,
  FiClock,
  FiCheckCircle,
  FiAlertTriangle,
  FiFileText,
  FiArrowRight,
  FiShoppingBag,
} from 'react-icons/fi';
import '../styles/orders.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser && storedUser._id) {
        setUserId(storedUser._id);
      }
    } catch (e) {
      console.warn('⚠️ Error leyendo usuario en localStorage');
    }
  }, []);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/orders/user/${userId}`);
        setOrders(res.data);
      } catch (err) {
        console.error('❌ Error al obtener órdenes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userId]);

  const handleDownloadInvoice = (orderId) => {
    window.open(`${API_URL}/api/invoice/generate-invoice/${orderId}`, '_blank');
  };

  const getStatusBadge = (order) => {
    const pStatus = (order.paymentStatus || 'PENDING').toUpperCase();
    const oStatus = (order.orderStatus || 'PENDING_PAYMENT').toUpperCase();

    if (pStatus === 'APPROVED' || (oStatus === 'CONFIRMED' && order.paymentMethod === 'CASH_ON_DELIVERY')) {
      return (
        <span className="order-badge badge-approved">
          <FiCheckCircle size={13} />
          <span>{order.paymentMethod === 'CASH_ON_DELIVERY' ? 'CONTRA ENTREGA' : 'PAGADO'}</span>
        </span>
      );
    }
    if (pStatus === 'PROCESSING' || pStatus === 'PENDING') {
      return (
        <span className="order-badge badge-pending">
          <FiClock size={13} />
          <span>PENDIENTE</span>
        </span>
      );
    }
    return (
      <span className="order-badge badge-declined">
        <FiAlertTriangle size={13} />
        <span>{pStatus}</span>
      </span>
    );
  };

  if (loading) {
    return (
      <>
        <main className="orders-page-wrapper">
          <div className="orders-container">
            <div className="orders-loading">
              <FiClock size={36} className="spinning" />
              <p>Cargando tus órdenes registradas...</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!userId) {
    return (
      <>
        <main className="orders-page-wrapper">
          <div className="orders-container">
            <div className="orders-empty-card">
              <FiPackage size={48} className="empty-icon" />
              <span className="editorial-label">CUENTA NOIR</span>
              <h2>INICIA SESIÓN PARA VER TUS PEDIDOS</h2>
              <p>Ingresa a tu cuenta para consultar el historial de órdenes y facturas.</p>
              <Link to="/login" className="noir-btn noir-btn-primary">
                INICIAR SESIÓN
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <main className="orders-page-wrapper">
        <div className="orders-container">
          <div className="orders-heading-group">
            <span className="editorial-label">HISTORIAL DE COMPRAS</span>
            <h1 className="orders-main-title">MIS ÓRDENES</h1>
          </div>

          {orders.length === 0 ? (
            <div className="orders-empty-card">
              <FiShoppingBag size={48} className="empty-icon" />
              <span className="editorial-label">AÚN NO TIENES COMPRAS</span>
              <h2>TU HISTORIAL ESTÁ VACÍO</h2>
              <p>Explora nuestras prendas de alto rendimiento y streetwear del DROP 01.</p>
              <Link to="/products" className="noir-btn noir-btn-primary">
                EXPLORAR COLECCIÓN
              </Link>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => {
                const orderNum =
                  order.orderNumber || `NOIR-${order._id.slice(-6).toUpperCase()}`;
                const isPendingWompi =
                  order.paymentStatus === 'PENDING' && order.paymentProvider === 'WOMPI';

                return (
                  <article className="order-card" key={order._id}>
                    <div className="order-card-header">
                      <div>
                        <span className="order-number-title">{orderNum}</span>
                        <span className="order-date-text">
                          {new Date(order.createdAt).toLocaleDateString('es-CO', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="order-badges-wrap">{getStatusBadge(order)}</div>
                    </div>

                    <div className="order-card-body">
                      <div className="order-meta-grid">
                        <div className="meta-col">
                          <span className="meta-label">Método de Pago</span>
                          <strong className="meta-value">{order.paymentMethod || 'Contra Entrega'}</strong>
                        </div>
                        <div className="meta-col">
                          <span className="meta-label">Ciudad de Entrega</span>
                          <strong className="meta-value">{order.city || 'Bogotá D.C.'}</strong>
                        </div>
                        <div className="meta-col">
                          <span className="meta-label">Total de la Orden</span>
                          <strong className="meta-value order-total-highlight">
                            {formatCOP(order.total)} COP
                          </strong>
                        </div>
                      </div>

                      <div className="order-items-section">
                        <span className="items-header-label">Prendas:</span>
                        <ul className="order-items-list">
                          {order.items &&
                            order.items.map((item, idx) => (
                              <li key={idx} className="order-item-row">
                                <span className="item-name-bold">{item.nombre}</span>
                                <span className="item-variant-spec">
                                  Talla {item.talla || 'M'} &bull; {item.color || 'Negro'}
                                </span>
                                <span className="item-qty-price">
                                  x{item.cantidad} &bull; {formatCOP(item.precio)}
                                </span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>

                    <div className="order-card-footer">
                      <button
                        type="button"
                        className="noir-btn noir-btn-secondary order-action-btn"
                        onClick={() => handleDownloadInvoice(order._id)}
                      >
                        <FiFileText size={15} />
                        <span>Descargar Factura</span>
                      </button>

                      {isPendingWompi && (
                        <Link
                          to={`/payment/status?orderId=${order._id}`}
                          className="noir-btn noir-btn-primary order-action-btn"
                        >
                          <span>Verificar Pago</span>
                          <FiArrowRight size={15} />
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Orders;