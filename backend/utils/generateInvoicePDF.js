const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoicePDF = async (orderData) => {
  // Ruta final del archivo
  const invoicesDir = path.join(__dirname, '../invoices');
  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir);
  }
  const outputPath = path.join(invoicesDir, `factura_${orderData._id}.pdf`);

  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  const watermarkPath = path.join(__dirname, '../build/LogoSimple.png');
  const logoPath = path.join(__dirname, '../build/LogoCompleto.png');

  doc.pipe(fs.createWriteStream(outputPath));

  // Marca de agua al fondo
  doc.image(watermarkPath, 100, 200, {
    width: 400,
    opacity: 0.07,
    align: 'center',
  });

  // 🧾 ENCABEZADO
  doc.fontSize(20).fillColor('#000').text('Factura de compra - Noir 🐾', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).fillColor('#444').text(`Fecha: ${new Date().toLocaleDateString()}`, { align: 'right' });
  doc.moveDown();

  // 👤 DATOS DEL CLIENTE
  doc.fontSize(12).fillColor('#000').text(`Nombre: ${orderData.customerName}`);
  doc.text(`Correo: ${orderData.customerEmail}`);
  doc.text(`Dirección: ${orderData.customerAddress}`);
  doc.text(`Ciudad: ${orderData.customerCity}`);
  doc.moveDown();

  // 📦 DETALLE DE PRODUCTOS
  doc.fontSize(14).text('Productos:', { underline: true });
  doc.moveDown(0.5);

  orderData.items.forEach((item, index) => {
    doc.fontSize(12).text(`${index + 1}. ${item.name} - Talla: ${item.size} - Color: ${item.color}`);
    doc.text(`   Cantidad: ${item.quantity} x $${item.price.toFixed(2)} = $${(item.quantity * item.price).toFixed(2)}`);
    doc.moveDown(0.5);
  });

  doc.moveDown();

  // 💰 TOTALES
  doc.fontSize(12).text(`Subtotal: $${orderData.subtotal.toFixed(2)}`);
  doc.text(`Envío: $${orderData.shipping.toFixed(2)}`);
  doc.text(`Total: $${orderData.total.toFixed(2)}`);
  doc.moveDown(2);

  // 💌 MENSAJE EMOCIONAL Y FINALE
  doc.fontSize(12).fillColor('#111').text('────────────────────────────────────────', { align: 'center' });
  doc.moveDown();
  doc
    .fontSize(12)
    .fillColor('#000')
    .text(`"Has elegido vestir con poder, elegancia y autenticidad. Gracias por ser parte de esta manada."`, {
      align: 'center',
      italic: true,
    });

  doc.moveDown();
  doc.fontSize(10).fillColor('#444').text('Síguenos y mantente conectado con el estilo:', { align: 'center' });
  doc
    .fontSize(10)
    .fillColor('#000')
    .text('Instagram: @noirOff   |   TikTok: @noirOff   |   www.noircol.com', { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).fillColor('#000').text('Con fuerza y estilo, El equipo Noir 🐾', { align: 'center' });

  // LOGO FINAL
  doc.image(logoPath, doc.page.width / 2 - 40, doc.y + 20, {
    width: 80,
    align: 'center',
  });

  doc.end();

    return new Promise((resolve, reject) => {
    doc.on('finish', () => resolve(outputPath));
    doc.on('error', reject);
  });
};

module.exports = generateInvoicePDF;