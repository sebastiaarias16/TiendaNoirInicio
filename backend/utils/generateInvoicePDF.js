const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoicePDF = async (orderData, explicitOutputPath) => {
  const invoicesDir = path.join(__dirname, '../invoices');
  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
  }

  const idToUse = orderData.orderNumber || orderData.orderId || orderData._id || 'NOIR-ORDER';
  const outputPath =
    explicitOutputPath || path.join(invoicesDir, `factura-${idToUse}.pdf`);

  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  const watermarkPath = path.join(__dirname, '../build/LogoSimple.png');
  const logoPath = path.join(__dirname, '../build/LogoCompleto.png');

  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // Watermark if available
  if (fs.existsSync(watermarkPath)) {
    try {
      doc.image(watermarkPath, 100, 200, {
        width: 400,
        opacity: 0.05,
        align: 'center',
      });
    } catch (_) {}
  }

  // 🧾 ENCABEZADO
  doc.fontSize(20).fillColor('#000').text('NOIR APPAREL — FACTURA DE COMPRA', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(11).fillColor('#666').text('THE NEW STANDARD. BUILT FOR THOSE WHO EVOLVE.', { align: 'center' });
  doc.moveDown();

  doc.fontSize(11).fillColor('#222').text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, { align: 'right' });
  doc.fontSize(11).fillColor('#000').text(`Orden: ${orderData.orderNumber || idToUse}`, { align: 'right' });
  doc.moveDown();

  // 👤 DATOS DEL CLIENTE
  doc.fontSize(13).fillColor('#000').text('INFORMACIÓN DEL CLIENTE', { underline: true });
  doc.moveDown(0.4);
  doc.fontSize(11).fillColor('#333').text(`Nombre: ${orderData.customerName || 'Cliente NOIR'}`);
  doc.text(`Correo: ${orderData.customerEmail || 'No especificado'}`);
  doc.text(`Dirección: ${orderData.customerAddress || 'Bogotá D.C.'}`);
  doc.text(`Ciudad: ${orderData.customerCity || 'Bogotá D.C.'}`);
  doc.moveDown();

  // 💳 ESTADO Y MÉTODO DE PAGO
  const isApproved =
    orderData.paymentStatus === 'APPROVED' || orderData.orderStatus === 'CONFIRMED';
  const paymentStatusText = isApproved
    ? 'PAGO CONFIRMADO (APROBADO)'
    : 'PENDIENTE DE PAGO (COORDINACIÓN)';

  doc.fontSize(13).fillColor('#000').text('DETALLE DEL PAGO', { underline: true });
  doc.moveDown(0.4);
  doc.fontSize(11).fillColor('#333').text(`Método: ${orderData.paymentMethod || 'CONTRA ENTREGA'}`);
  doc.fontSize(11).fillColor(isApproved ? '#10B981' : '#D97706').text(`Estado del Pago: ${paymentStatusText}`);
  if (orderData.paidAt) {
    doc.fontSize(10).fillColor('#666').text(`Fecha de Confirmación: ${new Date(orderData.paidAt).toLocaleString('es-CO')}`);
  }
  doc.moveDown();

  // 📦 DETALLE DE PRODUCTOS
  doc.fontSize(13).fillColor('#000').text('PRENDAS SELECCIONADAS', { underline: true });
  doc.moveDown(0.5);

  const items = orderData.items || [];
  items.forEach((item, index) => {
    const unitPrice = Number(item.price) || 0;
    const lineTotal = unitPrice * (item.quantity || 1);
    doc.fontSize(11).fillColor('#000').text(
      `${index + 1}. ${item.name} | Talla: ${item.size || 'M'} | Color: ${item.color || 'Negro'}`
    );
    doc.fontSize(10).fillColor('#555').text(
      `   Cantidad: ${item.quantity}  x  $${unitPrice.toLocaleString('es-CO')} COP  =  $${lineTotal.toLocaleString('es-CO')} COP`
    );
    doc.moveDown(0.3);
  });

  doc.moveDown();

  // 💰 TOTALES
  const subtotal = Number(orderData.subtotal || orderData.total || 0);
  const shipping = Number(orderData.shipping || 0);
  const total = Number(orderData.total || 0);

  doc.fontSize(11).fillColor('#333').text(`Subtotal: $${subtotal.toLocaleString('es-CO')} COP`);
  doc.text(`Envío (Bogotá D.C.): ${shipping === 0 ? 'INCLUIDO' : `$${shipping.toLocaleString('es-CO')} COP`}`);
  doc.fontSize(13).fillColor('#000').text(`TOTAL: $${total.toLocaleString('es-CO')} COP`, { bold: true });
  doc.moveDown(1.5);

  // 💌 MENSAJE Y POLÍTICA
  doc.fontSize(10).fillColor('#444').text('────────────────────────────────────────────────────────', { align: 'center' });
  doc.moveDown(0.5);
  doc
    .fontSize(10)
    .fillColor('#222')
    .text(
      '"Has elegido vestir con disciplina, evolución y estándar superior. Bienvenido a NOIR."',
      { align: 'center', italic: true }
    );
  doc.moveDown(0.5);
  doc.fontSize(9).fillColor('#666').text('Atención y despachos: WhatsApp +57 312 425 2861 | Bogotá D.C., Colombia', { align: 'center' });
  doc.text('Instagram: @noiroff | TikTok: @noiroff | www.noircol.com', { align: 'center' });

  // LOGO FINAL if available
  if (fs.existsSync(logoPath)) {
    try {
      doc.image(logoPath, doc.page.width / 2 - 40, doc.y + 15, {
        width: 80,
        align: 'center',
      });
    } catch (_) {}
  }

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
};

module.exports = generateInvoicePDF;