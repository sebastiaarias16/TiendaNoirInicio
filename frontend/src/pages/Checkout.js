import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../CartContext';
import { createOrder, createWompiPayment, submitBrebProof } from '../api/api';
import { getUser } from '../api/auth';
import Footer from '../components/Footer';
import { formatCOP, getImageSrc } from '../utils/productUtils';
import {
  FiShoppingBag,
  FiTruck,
  FiShield,
  FiTrash2,
  FiMinus,
  FiPlus,
  FiCheckCircle,
  FiAlertTriangle,
  FiMessageSquare,
  FiFileText,
  FiCreditCard,
  FiSmartphone,
  FiRepeat,
  FiCopy,
  FiCheck,
  FiArrowRight,
} from 'react-icons/fi';
import '../styles/checkout.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';
const WHATSAPP_PHONE = '573124252861';
const NOIR_BREB_LLAVE_EMAIL = 'contacto@tiendanoir.com';
const NOIR_BREB_LLAVE_PHONE = '3124252861';

const Checkout = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    clearCart,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    subtotal,
  } = useContext(CartContext);

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Customer & Delivery Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    neighborhood: '',
    notes: '',
    city: 'Bogotá',
    paymentMethod: 'CARD', // CARD | NEQUI | BREB | CASH_ON_DELIVERY
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);
  const [brebOrder, setBrebOrder] = useState(null);
  const [brebReferenceInput, setBrebReferenceInput] = useState('');
  const [brebSubmitting, setBrebSubmitting] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceMessage, setInvoiceMessage] = useState('');

  // Dynamically load official Wompi checkout script
  useEffect(() => {
    const scriptId = 'wompi-checkout-widget-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://checkout.wompi.co/widget.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Load user data upon mount
  useEffect(() => {
    let isMounted = true;
    const fetchUser = async () => {
      try {
        const loggedUser = await getUser();
        if (isMounted && loggedUser) {
          setUser(loggedUser);
          setFormData((prev) => ({
            ...prev,
            name: loggedUser.name || '',
            email: loggedUser.email || '',
            phone: loggedUser.phone || '',
            address: loggedUser.address || '',
          }));
        }
      } catch (err) {
        console.error('Error cargando usuario en checkout:', err);
      } finally {
        if (isMounted) setLoadingUser(false);
      }
    };
    fetchUser();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handlePaymentMethodSelect = (method) => {
    setFormData((prev) => ({ ...prev, paymentMethod: method }));
  };

  // Client-side form validation before server submission
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'El nombre completo es requerido.';
    if (!formData.email.trim()) {
      errors.email = 'El correo electrónico es requerido.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Ingresa un correo electrónico válido.';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'El teléfono o WhatsApp de contacto es requerido.';
    } else if (formData.phone.trim().length < 7) {
      errors.phone = 'Ingresa un número telefónico válido.';
    }
    if (!formData.address.trim()) {
      errors.address = 'La dirección de entrega en Bogotá es requerida.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Generate WhatsApp pre-filled text for Cash on Delivery
  const buildWhatsAppUrl = (order) => {
    const orderNum = order.orderNumber || order._id.slice(-6).toUpperCase();
    const isApproved = order.paymentStatus === 'APPROVED';

    let msg = `*NOIR APPAREL — PEDIDO %23${encodeURIComponent(orderNum)}*%0A%0A`;
    msg += `*Cliente:* ${encodeURIComponent(order.customerName || formData.name)}%0A`;
    msg += `*Teléfono:* ${encodeURIComponent(order.phone || formData.phone)}%0A`;
    msg += `*Dirección:* ${encodeURIComponent(order.shippingAddress || formData.address)} (Bogotá D.C.)%0A`;
    if (formData.neighborhood) {
      msg += `*Barrio:* ${encodeURIComponent(formData.neighborhood)}%0A`;
    }
    msg += `%0A*MÉTODO DE PAGO:* ${encodeURIComponent(order.paymentMethod)}%0A`;
    msg += `*ESTADO DE PAGO:* ${isApproved ? 'APROBADO' : 'PENDIENTE (Contra Entrega / Coordinación)'}%0A`;

    msg += `%0A*PRENDAS SELECCIONADAS:*%0A`;
    order.products.forEach((item) => {
      msg += `• *${encodeURIComponent(item.nombre)}*%0A`;
      msg += `  Talla: ${item.talla} | Color: ${encodeURIComponent(item.color)} | Cant: ${item.quantity}%0A`;
      msg += `  Precio: $${(item.unitPrice || 0) * item.quantity} COP%0A`;
    });

    msg += `%0A*TOTAL A PAGAR:* $${order.total} COP%0A`;
    msg += `%0A_Hola NOIR, acabo de registrar este pedido en la tienda y deseo coordinar la entrega en Bogotá._`;

    return `https://wa.me/${WHATSAPP_PHONE}?text=${msg}`;
  };

  // Submit order to backend
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!user) {
      setServerError('Debes iniciar sesión para procesar tu orden.');
      return;
    }

    if (cartItems.length === 0) {
      setServerError('El carrito está vacío. Agrega prendas antes de continuar.');
      return;
    }

    if (!validateForm()) {
      setServerError('Por favor completa todos los campos requeridos marcados en rojo.');
      return;
    }

    setIsSubmitting(true);

    const orderPayload = {
      userId: user._id,
      customerName: formData.name,
      customerEmail: formData.email,
      phone: formData.phone,
      shippingAddress: formData.neighborhood
        ? `${formData.address}, Barrio: ${formData.neighborhood}`
        : formData.address,
      city: 'Bogotá',
      paymentMethod: formData.paymentMethod,
      products: cartItems.map((item) => ({
        productId: item._id,
        quantity: item.quantity,
        talla: item.selectedSize || 'M',
        color: item.selectedColor || 'Negro',
      })),
    };

    try {
      // 1. Authoritative order creation in backend with atomic stock reservation
      const response = await createOrder(orderPayload);
      const savedOrder = response.order;

      // -----------------------------------------------------------------
      // A. WOMPI CARD OR NEQUI FLOW
      // -----------------------------------------------------------------
      if (formData.paymentMethod === 'CARD' || formData.paymentMethod === 'NEQUI') {
        try {
          const wompiData = await createWompiPayment({
            orderId: savedOrder._id,
            userId: user._id,
          });

          clearCart();

          // Try official programmatic WidgetCheckout first
          if (typeof window.WidgetCheckout === 'function' && wompiData.publicKey) {
            const checkout = new window.WidgetCheckout({
              currency: wompiData.currency,
              amountInCents: wompiData.amountInCents,
              reference: wompiData.reference,
              publicKey: wompiData.publicKey,
              signature: { integrity: wompiData.signature },
              redirectUrl: wompiData.redirectUrl,
              customerData: {
                email: formData.email,
                fullName: formData.name,
                phoneNumber: {
                  prefix: '+57',
                  number: formData.phone.replace(/\D/g, '').slice(-10),
                },
              },
            });

            checkout.open((result) => {
              navigate(
                `/payment/status?reference=${encodeURIComponent(wompiData.reference)}&orderId=${savedOrder._id}`
              );
            });
          } else if (wompiData.webCheckoutUrl) {
            // Direct hosted fallback
            window.location.href = wompiData.webCheckoutUrl;
          } else {
            navigate(
              `/payment/status?reference=${encodeURIComponent(wompiData.reference)}&orderId=${savedOrder._id}`
            );
          }
        } catch (wompiErr) {
          console.error('Error iniciando Wompi:', wompiErr);
          setServerError(
            wompiErr.response?.data?.error ||
              'No fue posible iniciar la pasarela de pagos. Por favor intenta nuevamente.'
          );
        }
        return;
      }

      // -----------------------------------------------------------------
      // B. BRE-B / LLAVE INTEROPERABLE FLOW
      // -----------------------------------------------------------------
      if (formData.paymentMethod === 'BREB') {
        clearCart();
        setBrebOrder(savedOrder);
        return;
      }

      // -----------------------------------------------------------------
      // C. CASH ON DELIVERY FLOW (Bogotá exclusive)
      // -----------------------------------------------------------------
      setCreatedOrder(savedOrder);
      clearCart();
    } catch (err) {
      console.error('Error al procesar orden en servidor:', err);
      const msg =
        err.response?.data?.error ||
        'No fue posible procesar la orden. Por favor verifica tu conexión o stock disponible.';
      setServerError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit proof for Bre-B
  const handleConfirmBrebPayment = async (e) => {
    e.preventDefault();
    if (!brebOrder) return;

    setBrebSubmitting(true);
    try {
      await submitBrebProof({
        orderId: brebOrder._id,
        brebReference: brebReferenceInput,
        brebProof: 'Transferencia realizada mediante Llave Bre-B oficial',
      });
      navigate(`/payment/pending?orderId=${brebOrder._id}&method=BREB`);
    } catch (err) {
      console.error('Error registrando comprobante Bre-B:', err);
      navigate(`/payment/pending?orderId=${brebOrder._id}&method=BREB`);
    } finally {
      setBrebSubmitting(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(type);
    setTimeout(() => setCopiedKey(''), 2500);
  };

  // Generate / Download Invoice
  const handleDownloadInvoice = async () => {
    if (!createdOrder) return;
    setInvoiceLoading(true);
    setInvoiceMessage('');
    try {
      const res = await fetch(`${API_URL}/api/invoice/generate-invoice/${createdOrder._id}`);
      const data = await res.json();
      if (data.message) {
        setInvoiceMessage('Factura generada y enviada a tu correo.');
        if (data.pdfPath) {
          window.open(`${API_URL}${data.pdfPath}`, '_blank');
        }
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

  // ----------------------------------------------------
  // UNAPPROVED / NOT LOGGED IN STATE
  // ----------------------------------------------------
  if (!loadingUser && !user) {
    return (
      <>
        <main className="checkout-page-wrapper">
          <div className="container-editorial checkout-auth-gate">
            <FiShield size={48} className="gate-icon" aria-hidden="true" />
            <span className="editorial-label">COMPRA SEGURA NOIR</span>
            <h1 className="gate-title">INICIA SESIÓN PARA CONTINUAR</h1>
            <p className="gate-desc">
              Para garantizar la trazabilidad de tus prendas del DROP 01 y el despacho en Bogotá, por favor ingresa con tu cuenta o regístrate en NOIR.
            </p>
            <div className="gate-actions">
              <Link to="/login" className="noir-btn noir-btn-primary">
                INICIAR SESIÓN
              </Link>
              <Link to="/register" className="noir-btn noir-btn-secondary">
                CREAR CUENTA
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ----------------------------------------------------
  // BRE-B ASSISTED MODAL / SCREEN
  // ----------------------------------------------------
  if (brebOrder) {
    const orderNum = brebOrder.orderNumber || brebOrder._id.slice(-6).toUpperCase();
    const waBrebMsg = encodeURIComponent(
      `*NOIR APPAREL — COMPROBANTE BRE-B %23${orderNum}*%0A%0A` +
        `*Cliente:* ${formData.name}%0A` +
        `*Total:* $${brebOrder.total} COP%0A` +
        `*Referencia transferencia:* ${brebReferenceInput || 'Adjunto soporte'}%0A%0A` +
        `_Hola NOIR, acabo de realizar la transferencia vía Llave Bre-B para mi orden ${orderNum}._`
    );
    const waUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${waBrebMsg}`;

    return (
      <>
        <main className="checkout-page-wrapper">
          <div className="container-editorial checkout-breb-modal">
            <FiRepeat size={48} className="breb-icon" aria-hidden="true" />
            <span className="editorial-label">SISTEMA INTEROPERABLE BRE-B / LLAVE</span>
            <h1 className="success-title">TRANSFERENCIA INMEDIATA</h1>
            <p className="success-desc">
              Orden <strong>{orderNum}</strong> registrada con stock reservado. Realiza la transferencia desde la app de tu banco o billetera favorita (Bancolombia, Nequi, Davivienda, Nu, etc.) utilizando cualquiera de nuestras Llaves oficiales registradas:
            </p>

            <div className="breb-instructions-card">
              <div className="breb-key-row">
                <div className="key-details">
                  <span className="key-type">Llave Celular (Colombia)</span>
                  <strong className="key-value">{NOIR_BREB_LLAVE_PHONE}</strong>
                </div>
                <button
                  type="button"
                  className="noir-btn noir-btn-secondary key-copy-btn"
                  onClick={() => copyToClipboard(NOIR_BREB_LLAVE_PHONE, 'phone')}
                >
                  {copiedKey === 'phone' ? <FiCheck size={16} /> : <FiCopy size={16} />}
                  <span>{copiedKey === 'phone' ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>

              <div className="breb-key-row" style={{ marginTop: '12px' }}>
                <div className="key-details">
                  <span className="key-type">Llave Correo Electrónico</span>
                  <strong className="key-value">{NOIR_BREB_LLAVE_EMAIL}</strong>
                </div>
                <button
                  type="button"
                  className="noir-btn noir-btn-secondary key-copy-btn"
                  onClick={() => copyToClipboard(NOIR_BREB_LLAVE_EMAIL, 'email')}
                >
                  {copiedKey === 'email' ? <FiCheck size={16} /> : <FiCopy size={16} />}
                  <span>{copiedKey === 'email' ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>

              <div className="breb-amount-box">
                <span>Total Exacto a Transferir:</span>
                <strong className="breb-total">{formatCOP(brebOrder.total)} COP</strong>
              </div>
            </div>

            <form onSubmit={handleConfirmBrebPayment} className="breb-confirmation-form">
              <div className="form-field full-width">
                <label htmlFor="breb-ref" className="field-label">
                  Número de Aprobación / Comprobante (Opcional)
                </label>
                <input
                  id="breb-ref"
                  type="text"
                  className="noir-input"
                  placeholder="Ej: 84920492 ó últimos dígitos"
                  value={brebReferenceInput}
                  onChange={(e) => setBrebReferenceInput(e.target.value)}
                />
              </div>

              <div className="breb-actions">
                <button
                  type="submit"
                  className="noir-btn noir-btn-primary breb-submit-btn"
                  disabled={brebSubmitting}
                >
                  {brebSubmitting ? (
                    'REGISTRANDO...'
                  ) : (
                    <>
                      <span>YA REALICÉ LA TRANSFERENCIA</span>
                      <FiArrowRight size={16} />
                    </>
                  )}
                </button>

                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="noir-btn noir-btn-secondary breb-wa-link"
                >
                  <FiMessageSquare size={16} />
                  <span>Enviar Comprobante por WhatsApp</span>
                </a>
              </div>
            </form>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ----------------------------------------------------
  // CASH ON DELIVERY SUCCESS STATE
  // ----------------------------------------------------
  if (createdOrder) {
    const waUrl = buildWhatsAppUrl(createdOrder);
    const orderNum = createdOrder.orderNumber || createdOrder._id.slice(-6).toUpperCase();

    return (
      <>
        <main className="checkout-page-wrapper">
          <div className="container-editorial checkout-success-screen">
            <FiCheckCircle size={56} className="success-icon" aria-hidden="true" />
            <span className="editorial-label">ORDEN CONFIRMADA EN SISTEMA</span>
            <h1 className="success-title">PEDIDO #{orderNum} REGISTRADO</h1>
            <p className="success-desc">
              Tu orden ha sido guardada en nuestra base de datos con stock reservado bajo la modalidad <strong>Pago Contra Entrega</strong> en Bogotá D.C. Continúa a nuestro canal oficial de WhatsApp para coordinar el horario exacto de entrega.
            </p>

            <div className="success-order-summary">
              <div className="summary-row">
                <span>Número de Orden:</span>
                <strong>{orderNum}</strong>
              </div>
              <div className="summary-row">
                <span>Cliente:</span>
                <strong>{createdOrder.customerName}</strong>
              </div>
              <div className="summary-row">
                <span>Dirección de Entrega:</span>
                <strong>{createdOrder.shippingAddress} (Bogotá)</strong>
              </div>
              <div className="summary-row">
                <span>Método:</span>
                <strong>Contra Entrega (Efectivo / Transferencia en sitio)</strong>
              </div>
              <div className="summary-row">
                <span>Total a Pagar:</span>
                <strong className="summary-total">{formatCOP(createdOrder.total)} COP</strong>
              </div>
            </div>

            <div className="success-actions">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="noir-btn noir-btn-primary success-wa-btn"
              >
                <FiMessageSquare size={18} aria-hidden="true" />
                <span>COORDINAR ENTREGA EN WHATSAPP</span>
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
  // EMPTY CART STATE
  // ----------------------------------------------------
  if (cartItems.length === 0) {
    return (
      <>
        <main className="checkout-page-wrapper">
          <div className="container-editorial checkout-empty-screen">
            <FiShoppingBag size={52} className="empty-cart-icon" aria-hidden="true" />
            <span className="editorial-label">CHECKOUT NOIR</span>
            <h1 className="empty-cart-title">TU CARRITO ESTÁ VACÍO</h1>
            <p className="empty-cart-desc">
              No tienes prendas en tu bolsa de compras para proceder al checkout. Explora las piezas de entrenamiento y streetwear del DROP 01.
            </p>
            <Link to="/products" className="noir-btn noir-btn-primary">
              EXPLORAR COLECCIÓN COMPLETA
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // ----------------------------------------------------
  // MAIN CHECKOUT SCREEN (TWO COLUMNS ON DESKTOP)
  // ----------------------------------------------------
  return (
    <>
      <main className="checkout-page-wrapper">
        <div className="container-wide">
          <div className="checkout-heading-group">
            <span className="editorial-label">PROCESO DE COMPRA</span>
            <h1 className="checkout-main-title">FINALIZAR COMPRA</h1>
          </div>

          {serverError && (
            <div className="checkout-alert-error" role="alert">
              <FiAlertTriangle size={18} className="alert-icon" aria-hidden="true" />
              <span>{serverError}</span>
            </div>
          )}

          <div className="checkout-grid-layout">
            {/* ====================================================
                LEFT COLUMN: CUSTOMER & DELIVERY & PAYMENT
                ==================================================== */}
            <section
              className="checkout-form-section"
              aria-label="Información del cliente y entrega"
            >
              <form onSubmit={handlePlaceOrder} id="checkout-order-form" noValidate>
                <div className="form-card">
                  <h2 className="form-section-title">1. DATOS DEL CLIENTE</h2>
                  <div className="form-fields-grid">
                    <div className="form-field full-width">
                      <label htmlFor="input-name" className="field-label">
                        Nombre Completo *
                      </label>
                      <input
                        id="input-name"
                        type="text"
                        name="name"
                        className={`noir-input ${formErrors.name ? 'input-error' : ''}`}
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Ej: Sebastián Arias"
                        required
                      />
                      {formErrors.name && (
                        <span className="field-error-text">{formErrors.name}</span>
                      )}
                    </div>

                    <div className="form-field">
                      <label htmlFor="input-email" className="field-label">
                        Correo Electrónico *
                      </label>
                      <input
                        id="input-email"
                        type="email"
                        name="email"
                        className={`noir-input ${formErrors.email ? 'input-error' : ''}`}
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="tucorreo@ejemplo.com"
                        required
                      />
                      {formErrors.email && (
                        <span className="field-error-text">{formErrors.email}</span>
                      )}
                    </div>

                    <div className="form-field">
                      <label htmlFor="input-phone" className="field-label">
                        Teléfono / WhatsApp *
                      </label>
                      <input
                        id="input-phone"
                        type="tel"
                        name="phone"
                        className={`noir-input ${formErrors.phone ? 'input-error' : ''}`}
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Ej: 312 425 2861"
                        required
                      />
                      {formErrors.phone && (
                        <span className="field-error-text">{formErrors.phone}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-card" style={{ marginTop: 'var(--space-lg)' }}>
                  <div className="form-section-header">
                    <h2 className="form-section-title">2. ENTREGA EN BOGOTÁ D.C.</h2>
                    <span className="delivery-city-badge">Bogotá D.C.</span>
                  </div>

                  <div className="delivery-notice-box">
                    <FiTruck size={18} className="notice-icon" aria-hidden="true" />
                    <p>
                      <strong>COBERTURA EXCLUSIVA BOGOTÁ:</strong> Despachos directos dentro del perímetro urbano de Bogotá. Nuestro equipo se contacta vía WhatsApp tras generar el pedido para confirmar horarios de entrega.
                    </p>
                  </div>

                  <div className="form-fields-grid" style={{ marginTop: 'var(--space-md)' }}>
                    <div className="form-field full-width">
                      <label htmlFor="input-address" className="field-label">
                        Dirección de Entrega Exacta *
                      </label>
                      <input
                        id="input-address"
                        type="text"
                        name="address"
                        className={`noir-input ${formErrors.address ? 'input-error' : ''}`}
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Ej: Carrera 15 # 85 - 20 Apto 402"
                        required
                      />
                      {formErrors.address && (
                        <span className="field-error-text">{formErrors.address}</span>
                      )}
                    </div>

                    <div className="form-field">
                      <label htmlFor="input-neighborhood" className="field-label">
                        Barrio / Localidad
                      </label>
                      <input
                        id="input-neighborhood"
                        type="text"
                        name="neighborhood"
                        className="noir-input"
                        value={formData.neighborhood}
                        onChange={handleInputChange}
                        placeholder="Ej: Chapinero / Cedritos"
                      />
                    </div>

                    <div className="form-field">
                      <label htmlFor="input-city" className="field-label">
                        Ciudad
                      </label>
                      <input
                        id="input-city"
                        type="text"
                        name="city"
                        className="noir-input"
                        value="Bogotá D.C."
                        disabled
                        aria-disabled="true"
                      />
                    </div>
                  </div>
                </div>

                {/* ====================================================
                    3. MULTI-GATEWAY PAYMENT METHODS (PHASE 6)
                    ==================================================== */}
                <div className="form-card" style={{ marginTop: 'var(--space-lg)' }}>
                  <h2 className="form-section-title">3. MÉTODO DE PAGO SEGURO</h2>
                  <div className="payment-options-list">
                    {/* Method 1: CARD (Wompi) */}
                    <label
                      className={`payment-radio-option ${
                        formData.paymentMethod === 'CARD' ? 'active-method' : ''
                      }`}
                      onClick={() => handlePaymentMethodSelect('CARD')}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="CARD"
                        checked={formData.paymentMethod === 'CARD'}
                        onChange={handleInputChange}
                      />
                      <div className="method-icon-wrap">
                        <FiCreditCard size={20} className="method-icon" />
                      </div>
                      <div className="radio-content">
                        <strong>Tarjeta de Crédito / Débito (Wompi)</strong>
                        <span>Visa, Mastercard, American Express procesadas de forma cifrada mediante Wompi (Bancolombia).</span>
                      </div>
                    </label>

                    {/* Method 2: NEQUI (Wompi) */}
                    <label
                      className={`payment-radio-option ${
                        formData.paymentMethod === 'NEQUI' ? 'active-method' : ''
                      }`}
                      onClick={() => handlePaymentMethodSelect('NEQUI')}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="NEQUI"
                        checked={formData.paymentMethod === 'NEQUI'}
                        onChange={handleInputChange}
                      />
                      <div className="method-icon-wrap">
                        <FiSmartphone size={20} className="method-icon" />
                      </div>
                      <div className="radio-content">
                        <strong>Nequi (Pasarela Oficial Wompi)</strong>
                        <span>Débito seguro desde tu cuenta Nequi con confirmación biométrica en tu app.</span>
                      </div>
                    </label>

                    {/* Method 3: BRE-B / LLAVE */}
                    <label
                      className={`payment-radio-option ${
                        formData.paymentMethod === 'BREB' ? 'active-method' : ''
                      }`}
                      onClick={() => handlePaymentMethodSelect('BREB')}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="BREB"
                        checked={formData.paymentMethod === 'BREB'}
                        onChange={handleInputChange}
                      />
                      <div className="method-icon-wrap">
                        <FiRepeat size={20} className="method-icon" />
                      </div>
                      <div className="radio-content">
                        <strong>Bre-B / Llave (Interoperable Colombia)</strong>
                        <span>Paga al instante desde cualquier banco o billetera colombiana mediante Llave Celular o Correo.</span>
                      </div>
                    </label>

                    {/* Method 4: CASH ON DELIVERY */}
                    <label
                      className={`payment-radio-option ${
                        formData.paymentMethod === 'CASH_ON_DELIVERY' ? 'active-method' : ''
                      }`}
                      onClick={() => handlePaymentMethodSelect('CASH_ON_DELIVERY')}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="CASH_ON_DELIVERY"
                        checked={formData.paymentMethod === 'CASH_ON_DELIVERY'}
                        onChange={handleInputChange}
                      />
                      <div className="method-icon-wrap">
                        <FiTruck size={20} className="method-icon" />
                      </div>
                      <div className="radio-content">
                        <strong>Pago Contra Entrega en Bogotá D.C.</strong>
                        <span>Pagas en efectivo o transferencia bancaria al momento de recibir tus prendas en Bogotá.</span>
                      </div>
                    </label>
                  </div>
                </div>
              </form>
            </section>

            {/* ====================================================
                RIGHT COLUMN: ORDER SUMMARY & CTAS
                ==================================================== */}
            <aside className="checkout-summary-section" aria-label="Resumen de la orden">
              <div className="summary-card">
                <h2 className="summary-title">RESUMEN DEL PEDIDO</h2>

                {/* Items List */}
                <ul className="checkout-items-list">
                  {cartItems.map((item) => {
                    const itemKey = item.cartKey || item._id;
                    const imageSrc = getImageSrc(item);
                    const lineTotal = (Number(item.precio) || 0) * (item.quantity || 1);

                    return (
                      <li key={itemKey} className="checkout-item">
                        <div className="checkout-item-media">
                          <img src={imageSrc} alt={item.nombre} />
                        </div>
                        <div className="checkout-item-details">
                          <div className="item-title-row">
                            <h3 className="checkout-item-name">{item.nombre}</h3>
                            <button
                              type="button"
                              className="item-remove-link"
                              onClick={() => removeFromCart(itemKey)}
                              aria-label={`Eliminar ${item.nombre}`}
                            >
                              <FiTrash2 size={15} />
                            </button>
                          </div>

                          <p className="checkout-item-variant">
                            Talla: <strong>{item.selectedSize || 'M'}</strong> &bull; Color: <strong>{item.selectedColor || 'Negro'}</strong>
                          </p>

                          <div className="checkout-item-bottom">
                            <div className="checkout-qty-control">
                              <button
                                type="button"
                                className="checkout-qty-btn"
                                onClick={() => decrementQuantity(itemKey)}
                                disabled={item.quantity <= 1}
                                aria-label="Disminuir"
                              >
                                <FiMinus size={12} />
                              </button>
                              <span className="checkout-qty-val">{item.quantity}</span>
                              <button
                                type="button"
                                className="checkout-qty-btn"
                                onClick={() => incrementQuantity(itemKey)}
                                aria-label="Aumentar"
                              >
                                <FiPlus size={12} />
                              </button>
                            </div>

                            <span className="checkout-line-price">
                              {formatCOP(lineTotal)}
                            </span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {/* Totals Breakdown */}
                <div className="checkout-totals-block">
                  <div className="totals-row">
                    <span>Subtotal:</span>
                    <span>{formatCOP(subtotal)}</span>
                  </div>
                  <div className="totals-row">
                    <span>Envío Bogotá D.C.:</span>
                    <span className="free-shipping">INCLUIDO</span>
                  </div>
                  <div className="totals-divider" />
                  <div className="totals-row total-highlight">
                    <span>TOTAL:</span>
                    <span className="final-total">{formatCOP(subtotal)} COP</span>
                  </div>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  form="checkout-order-form"
                  className="noir-btn noir-btn-primary checkout-submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    'PROCESANDO...'
                  ) : formData.paymentMethod === 'CARD' || formData.paymentMethod === 'NEQUI' ? (
                    <>
                      <span>CONTINUAR AL PAGO SEGURO</span>
                      <FiArrowRight size={17} style={{ marginLeft: '8px' }} />
                    </>
                  ) : formData.paymentMethod === 'BREB' ? (
                    <>
                      <span>CONTINUAR CON BRE-B</span>
                      <FiRepeat size={17} style={{ marginLeft: '8px' }} />
                    </>
                  ) : (
                    <>
                      <span>CONFIRMAR ORDEN Y COORDINAR</span>
                      <FiMessageSquare size={17} style={{ marginLeft: '8px' }} />
                    </>
                  )}
                </button>

                <div className="checkout-security-guarantee">
                  <FiShield size={16} className="guarantee-icon" aria-hidden="true" />
                  <span>
                    {formData.paymentMethod === 'CARD' || formData.paymentMethod === 'NEQUI'
                      ? 'Transacción cifrada y protegida por Wompi y Bancolombia.'
                      : 'Tu orden se almacena de forma autoritativa en el servidor.'}
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Checkout;