const nodemailer = require('nodemailer');
const fs = require('fs');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendInvoiceEmail = async (email, name, pdfPath) => {
  const mailOptions = {
    from: 'Noir 🖤 <noir.tienda@gmail.com>',
    to: email,
    subject: '¡Gracias por tu compra en Noir!',
    text: `Hola ${name}, gracias por confiar en nosotros. 🖤\nAdjuntamos tu factura de compra.\n\nDisfruta de tu estilo Noir.\n\n- Equipo Noir`,
    attachments: [
      {
        filename: 'Factura-Noir.pdf',
        path: pdfPath,
      },
    ],
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendInvoiceEmail;