import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { getPaymentStatus, getPaymentStatusByReference } from '../api/api';
import Footer from '../components/Footer';
import { formatCOP } from '../utils/productUtils';
import {
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiFileText,
  FiMessageSquare,
  FiArrowRight,
  FiRefreshCw,
} from 'react-icons/fi';
import '../styles/checkout.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';
const WHATSAPP_PHONE = '573124252861';

const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderIdParam = searchParams.get('orderId') || searchParams.get('id');
  const referenceParam = searchParams.get('reference');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceMessage, setInvoiceMessage] = useState('');
  const [pollCount, setPollCount] = useState(0);

  const fetchStatus = useCallback(async () => {
    try {
      let data = null;
      if (orderIdParam) {
        data = await getPaymentStatus(orderIdParam);
      } else if (referenceParam) {
        data = await getPaymentStatusByReference(referenceParam);
      } else {
        setError('No se proporcionó un identificador o referencia de pago.');
        setLoading(false);
        return;
      }

      setOrder(data);
    } catch (err) {
      console.error('Error consultando estado de pago:', err);
      setError('No fue posible consultar el estado del pago. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [orderIdParam, referenceParam]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Auto-polling if payment is pending or processing (up to 4 times, every 3.5s)
  useEffect(() => {
    if (
      order &&
      (order.paymentStatus === 'PENDING' || order.paymentStatus === 'PROCESSING') &&
      order.paymentProvider === 'WOMPI' &&
      pollCount < 4
    ) {
      const timer = setTimeout(() => {
        setPollCount((prev) => prev + 1);
        fetchStatus();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [order, pollCount, fetchStatus]);

  const handleDownloadInvoice = async () => {
    if (!order) return;
    setInvoiceLoading(true);
    setInvoiceMessage('');
    try {
      const targetId = order.orderId || order._id;
      const res = await fetch(`${API_URL}/api/invoice/generate-invoice/${targetId}`);
      const data = await res.json();
      if (data.pdfPath) {
        setInvoiceMessage('Factura generada.');
        window.open(`${API_URL}${data.pdfPath}`, '_blank');
      } else {
        setInvoiceMessage('Factura en trámite.');
      }
    } catch (err) {
      console.error('Error generando factura:', err);
      setInvoiceMessage('No se pudo generar la factura en este momento.');
    } finally {
      setInvoiceLoading(false);
    }
  };

  const buildWhatsAppUrl = () => {
    if (!order) return `https://wa.me/${WHATSAPP_PHONE}`;
    const orderNum = order.orderNumber || order.orderId?.slice(-6).toUpperCase() || 'NOIR';
    const isApproved = order.paymentStatus === 'APPROVED';

    let msg = `*NOIR APPAREL — ESTADO DE PAGO %23${encodeURIComponent(orderNum)}*%0A%0A`;
    msg += `*Cliente:* ${encodeURIComponent(order.customerName || 'Cliente')}%0A`;
    msg += `*Método:* ${encodeURIComponent(order.paymentMethod || 'Online')}%0A`;
    msg += `*Estado de Pago:* ${isApproved ? 'APROBADO / CONFIRMADO' : 'PENDIENTE / EN VERIFICACIÓN'}%0A`;
    msg += `*Total:* $${order.total || 0} COP%0A`;
    if (order.shippingAddress) {
      msg += `*Dirección:* ${encodeURIComponent(order.shippingAddress)} (Bogotá)%0A`;
    }
    msg += `%0A_Hola NOIR, consulto sobre mi orden ${orderNum} realizada en la tienda web._`;

    return `https://wa.me/${WHATSAPP_PHONE}?text=${msg}`;
  };

  if (loading) {
    return (
      <>
        <main className="checkout-page-wrapper">
          <div className="container-editorial checkout-empty-screen">
            <FiClock size={48} className="empty-cart-icon spinning" />
            <span className="editorial-label">CONSULTANDO SISTEMA</span>
            <h1 className="empty-cart-title">VERIFICANDO ESTADO DE PAGO</h1>
            <p className="empty-cart-desc">
              Consultando la pasarela oficial y los servidores de NOIR...
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <main className="checkout-page-wrapper">
          <div className="container-editorial checkout-empty-screen">
            <FiAlertTriangle size={48} style={{ color: '#EF4444', marginBottom: '1.25rem' }} />
            <span className="editorial-label">ESTADO DE ORDEN</span>
            <h1 className="empty-cart-title">ORDEN NO ENCONTRADA</h1>
            <p className="empty-cart-desc">{error || 'No se encontró la información de la orden solicitada.'}</p>
            <div className="gate-actions">
              <Link to="/products" className="noir-btn noir-btn-primary">
                IR AL CATÁLOGO
              </Link>
              <Link to="/orders" className="noir-btn noir-btn-secondary">
                MIS PEDIDOS
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const isApproved = order.paymentStatus === 'APPROVED' || order.orderStatus === 'CONFIRMED';
  const isDeclined =
    order.paymentStatus === 'DECLINED' ||
    order.paymentStatus === 'FAILED' ||
    order.paymentStatus === 'EXPIRED';

  // ----------------------------------------------------
  // 1. APPROVED STATE
  // ----------------------------------------------------
  if (isApproved) {
    return (
      <>
        <main className="checkout-page-wrapper">
          <div className="container-editorial checkout-success-screen">
            <FiCheckCircle size={56} className="success-icon" aria-hidden="true" />
            <span className="editorial-label">TRANSACCIÓN CONFIRMADA</span>
            <h1 className="success-title">PAGO APROBADO EXITOSAMENTE</h1>
            <p className="success-desc">
              Tu pago ha sido validado de forma segura por el servidor. La orden <strong>{order.orderNumber}</strong> ha sido confirmada con stock reservado para despacho en Bogotá D.C.
            </p>

            <div className="success-order-summary">
              <div className="summary-row">
                <span>Número de Orden:</span>
                <strong>{order.orderNumber}</strong>
              </div>
              <div className="summary-row">
                <span>Método de Pago:</span>
                <strong>{order.paymentMethod} (Wompi)</strong>
              </div>
              {order.paymentReference && (
                <div className="summary-row">
                  <span>Referencia:</span>
                  <span style={{ fontSize: '0.8rem', color: '#A1A1A1' }}>{order.paymentReference}</span>
                </div>
              )}
              <div className="summary-row">
                <span>Total Confirmado:</span>
                <strong className="summary-total">{formatCOP(order.total)} COP</strong>
              </div>
            </div>

            <div className="success-actions">
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="noir-btn noir-btn-primary success-wa-btn"
              >
                <FiMessageSquare size={18} aria-hidden="true" />
                <span>NOTIFICAR DESPACHO EN WHATSAPP</span>
              </a>

              <div className="success-secondary-actions">
                <button
                  type="button"
                  className="noir-btn noir-btn-secondary"
                  onClick={handleDownloadInvoice}
                  disabled={invoiceLoading}
                >
                  <FiFileText size={16} aria-hidden="true" />
                  <span>{invoiceLoading ? 'Generando...' : 'Descargar Factura PDF'}</span>
                </button>

                <Link to="/orders" className="noir-btn noir-btn-secondary">
                  Ver Mis Pedidos
                </Link>
              </div>

              {invoiceMessage && <p className="invoice-status-note">{invoiceMessage}</p>}
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ----------------------------------------------------
  // 2. DECLINED / FAILED / EXPIRED STATE
  // ----------------------------------------------------
  if (isDeclined) {
    return (
      <>
        <main className="checkout-page-wrapper">
          <div className="container-editorial checkout-empty-screen">
            <FiAlertTriangle size={56} style={{ color: '#EF4444', marginBottom: '1.25rem' }} />
            <span className="editorial-label" style={{ color: '#EF4444' }}>
              TRANSACCIÓN NO APROBADA
            </span>
            <h1 className="empty-cart-title">PAGO NO COMPLETADO</h1>
            <p className="empty-cart-desc">
              {order.paymentStatusMessage ||
                'Tu transacción no fue aprobada por la entidad financiera o el tiempo límite expiró. Las unidades no han sido cobradas.'}
            </p>

            <div className="success-order-summary" style={{ maxWidth: '480px' }}>
              <div className="summary-row">
                <span>Orden:</span>
                <strong>{order.orderNumber}</strong>
              </div>
              <div className="summary-row">
                <span>Estado:</span>
                <strong style={{ color: '#EF4444' }}>{order.paymentStatus}</strong>
              </div>
              <div className="summary-row">
                <span>Total:</span>
                <strong>{formatCOP(order.total)} COP</strong>
              </div>
            </div>

            <div className="gate-actions" style={{ marginTop: '1.5rem' }}>
              <button
                type="button"
                className="noir-btn noir-btn-primary"
                onClick={() => navigate('/checkout')}
              >
                <span>REINTENTAR PAGO EN CHECKOUT</span>
                <FiArrowRight size={16} />
              </button>
              <Link to="/products" className="noir-btn noir-btn-secondary">
                EXPLORAR COLECCIÓN
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ----------------------------------------------------
  // 3. PENDING / PROCESSING STATE (Default fallback)
  // ----------------------------------------------------
  return (
    <>
      <main className="checkout-page-wrapper">
        <div className="container-editorial checkout-empty-screen">
          <FiClock size={56} style={{ color: 'var(--noir-accent-champagne)', marginBottom: '1.25rem' }} />
          <span className="editorial-label">CONFIRMACIÓN EN TRÁMITE</span>
          <h1 className="empty-cart-title">PAGO EN PROCESO DE VALIDACIÓN</h1>
          <p className="empty-cart-desc">
            {order.paymentMethod === 'BREB'
              ? 'Hemos recibido los datos de tu transferencia Bre-B. Nuestro equipo verificará el abono en el sistema interbancario para confirmar tu orden.'
              : 'La pasarela de pagos se encuentra procesando la respuesta con la entidad financiera. Esto puede tomar unos instantes.'}
          </p>

          <div className="success-order-summary" style={{ maxWidth: '480px' }}>
            <div className="summary-row">
              <span>Orden:</span>
              <strong>{order.orderNumber}</strong>
            </div>
            <div className="summary-row">
              <span>Método:</span>
              <strong>{order.paymentMethod}</strong>
            </div>
            <div className="summary-row">
              <span>Estado Actual:</span>
              <strong style={{ color: 'var(--noir-accent-champagne)' }}>
                {order.paymentStatus === 'PROCESSING' ? 'PROCESANDO' : 'PENDIENTE'}
              </strong>
            </div>
            <div className="summary-row">
              <span>Total:</span>
              <strong>{formatCOP(order.total)} COP</strong>
            </div>
          </div>

          <div className="gate-actions" style={{ marginTop: '1.5rem' }}>
            <button
              type="button"
              className="noir-btn noir-btn-primary"
              onClick={fetchStatus}
            >
              <FiRefreshCw size={16} />
              <span>ACTUALIZAR ESTADO</span>
            </button>
            <a
              href={buildWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="noir-btn noir-btn-secondary"
            >
              <FiMessageSquare size={16} />
              <span>CONSULTAR POR WHATSAPP</span>
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default PaymentStatus;
